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
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

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
            # break
        
    for i in response.json()['departures']:
        if 'schedule' in i['fa_flight_id']:
            Departures_FlightID.append(i['fa_flight_id'])
            # break
        
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
            
            #----- altitude <= 100k ft. & index[1]-index[0]==1 -----#
            tmp_df = tmp_df[tmp_df['altitude']<=100]
            tmp_df['check_index_1'] = tmp_df.index
            tmp_df['check_index_2'] = tmp_df['check_index_1'].shift(-1)
            tmp_df['drop'] = tmp_df['check_index_2']-tmp_df['check_index_1'] == 1
            
            #----- loop append only Departures -----#
            res = pd.DataFrame()
            n = 0
            while(tmp_df.iloc[n]['drop']) :
                res = res.append(tmp_df.iloc[n])
                # res = pd.concat([res, tmp_df.iloc[n]])
                n+=1
            res = res.append(tmp_df.iloc[n])
            # res = pd.concat([res, tmp_df.iloc[n]])
            
            #----- interpolate 1 sec -----#
            res['timestamp'] = pd.to_datetime(res.timestamp)
            nidx = np.arange(res['timestamp'][0], res['timestamp'].iloc[-1], 1000000 )
            nidx = pd.to_datetime(nidx)

            res['timestamp'] = res['timestamp'].round('S').dt.tz_localize(None)
            res.set_index('timestamp', inplace=True)
            res = res.reindex(res.index.union(nidx))

            #----- interpolate ['altitude', 'groundspeed', 'heading', 'latitude', 'longitude'] -----#
            res = res[['fa_flight_id', 'altitude', 'groundspeed', 'heading', 'latitude', 'longitude']]
            res['altitude'] = pd.to_numeric(res['altitude'])
            res['groundspeed'] = pd.to_numeric(res['groundspeed'])
            res['heading'] = pd.to_numeric(res['heading'])
            res = res.interpolate(method='time',limit_direction='both',limit=100)
            res['fa_flight_id'] = id
            
            #----- ONLY TEST -----#
            # res.to_csv(f'../Preprocess/ONLY_TEST/{id}.csv')
            
            #----- check day/night -----#
            if res.iloc[:1].between_time('07:00', '23:00').empty :
                print(id,' night ', res.iloc[0])
                Dict_departures_flights['night'][id] = res.copy()
                Dict_departures_flights['night'][id].reset_index(inplace=True)
                Dict_departures_flights['night'][id].rename(columns={'index':'timestamp'},inplace=True)
            else :
                print(id,' day ', res.iloc[0])
                Dict_departures_flights['day'][id] = res.copy()
                Dict_departures_flights['day'][id].reset_index(inplace=True)
                Dict_departures_flights['day'][id].rename(columns={'index':'timestamp'},inplace=True)
                
        else:
            print("Error executing request")
            
        # i+=1
        time.sleep(10)
        
        

    for day_night in Dict_departures_flights:
        for flight in Dict_departures_flights[day_night]:
            # print(day_night, flight)
            postdata = Dict_departures_flights[day_night][flight]
            date_index = postdata.iloc[0].timestamp.date()

            # doc_ref = db.collection(f'{start}').document(f'{day_night}').collection(f'{flight}')
            doc_ref = db.collection(f'{date_index}').document(f'{day_night}').collection(f'{flight}')
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