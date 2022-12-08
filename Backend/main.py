from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import numpy as np
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
import time
from key_value.token import apiKey, apiUrl, auth_header

app = FastAPI()


class date_flight(BaseModel):
    start: str
    end: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df_sample_data = pd.read_csv('../Preprocess/data/Sample_data2.csv')

cred = credentials.Certificate('serviceAccount.json')
app_firebase = firebase_admin.initialize_app(cred)
db = firestore.client()
# doc_ref = db.collection(u'dd-mm-yy').document(u'Day').collection(u'flight_ID')


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/get_flight")
def get_flight():

    return {
        "name" : "aa",
        "coords": df_sample_data[['longitude','latitude','altitude']].values.tolist(),
        "date" : "2022-10-04",
        "time_1" : '17:23:06',
        "time_2" : '23:24:10',
        "week" : '1'
        }


@app.post('/get_flightaware')
def get_flightaware(item:date_flight):
    # format yyyy-mm-dd
    start = item.start
    end = item.end
    if len(start.split('-')) != 3 or len(end.split('-')) != 3 :
        return {'response': 'please check your format yyyy-mm-dd', 'status_code': 400}
    
    Airport_id = 'DMK'
    Airport_start = f'{start}T00%3A00%3A00Z'
    Airport_end = f'{end}T00%3A00%3A00Z'
    
    #----- get flight data from DMK airport -----#
    response = requests.get(apiUrl + f"airports/{Airport_id}/flights?start={Airport_start}&end={Airport_end}",
    headers=auth_header)
        
    Arrivals_FlightID = []
    Departures_FlightID = []
    
    #----- add flight data from DMK airport -----#
    for i in response.json()['arrivals']:
        if 'schedule' in i['fa_flight_id']:
            Arrivals_FlightID.append(i['fa_flight_id'])
        
    for i in response.json()['departures']:
        if 'schedule' in i['fa_flight_id']:
            Departures_FlightID.append(i['fa_flight_id'])
        
    #----- get data from flight ID -----#
    Dict_departures_flights = {
        'day':{},
        'night':{}
    }
    Dict_arrivals_flights = {
        'day':{},
        'night':{}
    }

    # i = 1
    for id in Departures_FlightID:
        response = requests.get(apiUrl + f"flights/{id}/track",
        headers=auth_header)

        if response.status_code == 200:
            # print(i)
            #----- Add data to dict -----#
            tmp_df = pd.DataFrame.from_dict(response.json()['positions'])
            
            #----- check time -----#
            tmp_df = tmp_df.drop_duplicates(subset=['timestamp'], keep='first')
            
            #----- altitude <= 100k ft. -----#
            tmp_df = tmp_df[tmp_df['altitude']<=100]
            
            #----- interpolate 1 sec -----#
            tmp_df['timestamp'] = pd.to_datetime(tmp_df.timestamp)
            nidx = np.arange(tmp_df['timestamp'][0], tmp_df['timestamp'].iloc[-1], 1000000 )
            nidx = pd.to_datetime(nidx)

            tmp_df['timestamp'] = tmp_df['timestamp'].round('S').dt.tz_localize(None)
            tmp_df.set_index('timestamp', inplace=True)
            tmp_df = tmp_df.reindex(tmp_df.index.union(nidx))

            #----- interpolate ['altitude', 'groundspeed', 'heading', 'latitude', 'longitude'] -----#
            tmp_df = tmp_df[['fa_flight_id', 'altitude', 'groundspeed', 'heading', 'latitude', 'longitude']]
            tmp_df['altitude'] = pd.to_numeric(tmp_df['altitude'])
            tmp_df['groundspeed'] = pd.to_numeric(tmp_df['groundspeed'])
            tmp_df['heading'] = pd.to_numeric(tmp_df['heading'])
            tmp_df = tmp_df.interpolate(method='time',limit_direction='both',limit=100)
            tmp_df['fa_flight_id'] = id
            
            #----- check day/night -----#
            if tmp_df.iloc[:1].between_time('23:00', '07:00').empty :
                # print('night')
                Dict_departures_flights['night'][id] = tmp_df.copy()
                Dict_departures_flights['night'][id].reset_index(inplace=True)
                Dict_departures_flights['night'][id].rename(columns={'index':'timestamp'},inplace=True)
            else :
                # print('day')
                Dict_departures_flights['day'][id] = tmp_df.copy()
                Dict_departures_flights['day'][id].reset_index(inplace=True)
                Dict_departures_flights['day'][id].rename(columns={'index':'timestamp'},inplace=True)
                
        else:
            print("Error executing request")
            
        # i+=1
        time.sleep(7)

    for day_night in Dict_departures_flights:
        for flight in Dict_departures_flights[day_night]:
            # print(day_night, flight)
            postdata = Dict_departures_flights[day_night][flight]
            doc_ref = db.collection(f'{start}').document(f'{day_night}').collection(f'{flight}')
            print('docref success')
            postdata = postdata.to_dict('records')
            list(map(lambda x: doc_ref.add(x), postdata))
            print('insert success')

    return {"response": f'Insert successful','status_code':200}


@app.get('/test_firebase')
def firebase():
    doc_ref = db.collection(f'dd-mm-yy').document(u'Day').collection(u'flight_ID')

    df = pd.read_csv('./../Preprocess/data/Sample_data3.csv')
    postdata = df.to_dict('records')
    list(map(lambda x: doc_ref.add(x), postdata))
    return {'status':'good'}


# col_list = df_sample_data[['long','lat','altitude_ft']].values.tolist()
# uvicorn main:app --reload
# python -m uvicorn main:app --reload