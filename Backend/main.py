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
from typing import Union
import datetime
import os
import glob
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

app = FastAPI()


class date_flight(BaseModel):
    start: str
    end: str

class api_flightID(BaseModel):
    flight_id:Union[str, None] = None
    date:str
    period:Union[str, None] = None


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

def validate(date_text):
        try:
            # print(date_text)
            test = datetime.datetime.strptime(date_text, '%Y-%m-%d %H:%M:%S')
            # print(test.timestamp())
            return 0, test.timestamp()
            # year, month, day = date_text.split('-')

            # if len(day) == 1:
            #     day = f'0{day}'
            # if len(month) == 1:
            #     month = f'0{month}'
            # return 0, f'{year}-{month}-{day}'
        except ValueError:
            # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
            return 1 ,"Incorrect data format, should be YYYY-MM-DD H:M:S"



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


@app.post('/get_flight')
def get_flight(item:api_flightID):

    date_check, param_date = validate(item.date)
    if date_check:
        return {'response': param_date}
    period = None
    if item.period in ['day','night']:
        period = item.period
    # print(param_date+3600)
    doc_ref = db.collection('filter_flight').where('period','==',period).where('date','==',param_date)
    docs = list(doc_ref.stream())
    flight_dict = list(map(lambda x: x.to_dict(), docs))
    df = pd.DataFrame(flight_dict)
    print(df)

    # print(type(param_date))
    return {'flight_id':f'{param_date} {item.period} {item.flight_id}'}


@app.get('/csv_2_db')
def csv_2_db():
    path = '../Preprocess/ONLY_TEST/'
    csv_files = glob.glob(os.path.join(path, "*.csv"))
    for f in csv_files:
        # print(f)
        df = pd.read_csv(f)
        df['timestamp'] = pd.to_datetime(df.timestamp)
        date_index = df.iloc[0].timestamp.date()
        if df.set_index('timestamp').iloc[:1].between_time('07:00', '23:00').empty :
            period = 'night'
        else: period = 'day'
        id = df.iloc[0].fa_flight_id
        # print(date_index, period, id)
        doc_ref = db.collection(f'filter_flight')
        # doc_ref2 = db.collection(f'detail_and_grid').document(u'detail').collection(f'{id}')
        # print(df.iloc[0].timestamp ,df.iloc[0].timestamp.floor(freq='H').strftime("%s"), int(df.iloc[0].timestamp.floor(freq='H').strftime("%s"))+3600)
        doc_ref.add({
            # 'date':f'{date_index}',
            # 'date': int(date_index.strftime("%s")),
            'date': int(df.iloc[0].timestamp.floor(freq='H').strftime("%s")),
            # 'date':time.mktime(datetime.datetime.strptime(date_index, '%Y-%m-%d').timetuple()),
            # 'date':date_index.datetime.timestamp(),
            'id':id,
            'period':period
        })
        # postdata = df.to_dict('records')
        # list(map(lambda x: doc_ref2.add(x), postdata))
    return {'response':'success'}


@app.get('/test_firebase')
def firebase():
    doc_ref = db.collection(f'dd-mm-yy').document(u'Day').collection(u'flight_ID')

    df = pd.read_csv('./../Preprocess/data/Sample_data3.csv')
    postdata = df.to_dict('records')
    list(map(lambda x: doc_ref.add(x), postdata))
    return {'status':'good'}



# uvicorn main:app --reload
# python -m uvicorn main:app --reload