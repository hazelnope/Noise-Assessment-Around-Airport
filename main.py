from fastapi.responses import JSONResponse
from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
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
import itertools
from typing import List
import pytz

from function_backend.grid_to_firebase import generate_grid
from function_backend.cumulative_level import Cumulative_model


import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

app = FastAPI()


class date_flight(BaseModel):
    start: str
    end: str
    time: int

class api_flightID(BaseModel):
    flight_id:Union[str, None] = None
    date:str
    period:Union[str, None] = None

class list_flight(BaseModel):
    flights:Union[list, None] = None
    duration_day:Union[int, None] = None
    duration_night:Union[int, None] = None

class DateRange(BaseModel):
    start_date: datetime.date
    end_date: datetime.date
    hour: str
    state: str

class generate_grid_api(BaseModel):
    date: str
    
    @validator("date")
    def check_date_format(cls, value):
        try:
            datetime.datetime.strptime(value, '%Y-%m-%d')
            return value
        except ValueError:
            raise ValueError("Incorrect date format. Use YYYY-MM-DD")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


cred = credentials.Certificate('serviceAccount.json')
app_firebase = firebase_admin.initialize_app(cred)
db = firestore.client()
# doc_ref = db.collection(u'dd-mm-yy').document(u'Day').collection(u'flight_ID')

def validate(date_text):
        try:
            test = datetime.datetime.strptime(date_text, '%Y-%m-%d %H:%M:%S')
            return 0, test.timestamp()
        except ValueError:
            # raise ValueError("Incorrect data format, should be YYYY-MM-DD")
            return 1 ,"Incorrect data format, should be YYYY-MM-DD H:M:S"



@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/get_flightaware")
async def create_date_range(date_range: DateRange):
    # print(date_range)
    tz = pytz.timezone('Asia/Bangkok')
    start_date = date_range.start_date
    end_date = date_range.end_date
    hour = date_range.hour
    state = date_range.state
    d_or_a = state[0].upper()
    # print(start_date, hour)

    
    if len(hour) == 1:
        # Add zero-padding to the hour string
        hour = f"0{hour}"
    if int(hour) > 20:
        end_hour = '00'
    else:
        end_hour = f'{int(hour)+3}'
    if len(end_hour) == 1:
        # Add zero-padding to the hour string
        end_hour = f"0{end_hour}"
    Airport_id = 'DMK'
    Airport_start = f'{start_date}T{hour}%3A00%3A00%2B07%3A00'
    Airport_end = f'{end_date}T{end_hour}%3A00%3A00%2B07%3A00'
    # print(Airport_start)
    #----- get flight data from DMK airport -----#
    response = requests.get(apiUrl + f"airports/{Airport_id}/flights/{state}?start={Airport_start}&end={Airport_end}&max_pages=4",
    headers=auth_header)
    
    #----- api_to_db -----#
    Showflights = []
    
    Departures_FlightID = []
    Arrivals_FlightID = []
    counter = 0
    response = response.json()
    # for i in response.json()['departures']:
    if state not in response:
        print(f"{state} not in response", response.keys())
    for i in response[state]:
        print(i['fa_flight_id'])
        if counter == 3:
            break
        # counter += 1
        if 'schedule' in i['fa_flight_id']:
            Departures_FlightID.append(i['fa_flight_id'])
            counter += 1
    


    #----- get data from flight ID -----#
    Dict_departures_flights = {
        'day':{},
        'night':{}
    }

    for id in Departures_FlightID:
        check_docs = db.collection('filter_flight').document(id).get()
        if check_docs.exists:
            print('Document exists',id)
            Showflights.append(check_docs.to_dict())
            continue


        response = requests.get(apiUrl + f"flights/{id}/track",
        headers=auth_header)

        if response.status_code == 200:
            # print(i)
            #----- Add data to dict -----#
            tmp_df = pd.DataFrame.from_dict(response.json()['positions'])
            
            #----- check time -----#
            tmp_df = tmp_df.drop_duplicates(subset=['timestamp'], keep='first')
            
            #----- altitude <= 100k ft. & index[1]-index[0]==1 -----#
            if state == 'arrivals':
                print('arrivals')
                tmp_df.sort_index(ascending=False,inplace=True)
                # print(tmp_df)
                # return
            tmp_df = tmp_df[tmp_df['altitude']<=100]
            tmp_df['check_index_1'] = tmp_df.index
            tmp_df['check_index_2'] = tmp_df['check_index_1'].shift(-1)
            if state == 'arrivals':
                tmp_df['drop'] = tmp_df['check_index_1']-tmp_df['check_index_2'] == 1
            else:
                tmp_df['drop'] = tmp_df['check_index_2']-tmp_df['check_index_1'] == 1
            
            
            
            #----- loop append only Departures -----#
            res = pd.DataFrame()
            n = 0
            while(tmp_df.iloc[n]['drop']) :
                res = res.append(tmp_df.iloc[n])
                # res = pd.concat([res, tmp_df.iloc[n]])
                n+=1
            res = res.append(tmp_df.iloc[n])
            
            #----- interpolate 1 sec -----#
            res['timestamp'] = pd.to_datetime(res.timestamp)
            if state == 'arrivals':
                nidx = np.arange(res['timestamp'].iloc[0], res['timestamp'].iloc[-1], -1000000 )
                nidx = pd.to_datetime(nidx)
                # print(nidx)
            else:
                nidx = np.arange(res['timestamp'].iloc[0], res['timestamp'].iloc[-1], 1000000 )
                nidx = pd.to_datetime(nidx)
                # print(nidx)
            # return
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
            

            
            #----- check day/night -----#
            if res.iloc[:1].between_time('00:00', '16:00').empty :
                # print(id,' night ', res.iloc[0])
                Dict_departures_flights['night'][id] = res.copy()
                Dict_departures_flights['night'][id].reset_index(inplace=True)
                Dict_departures_flights['night'][id].rename(columns={'index':'timestamp'},inplace=True)
            else :
                # print(id,' day ', res.iloc[0])
                Dict_departures_flights['day'][id] = res.copy()
                Dict_departures_flights['day'][id].reset_index(inplace=True)
                Dict_departures_flights['day'][id].rename(columns={'index':'timestamp'},inplace=True)
                
        else:
            print("Error executing request")
            
        # i+=1
        time.sleep(15)

    # print(Dict_departures_flights)
    for day_night in Dict_departures_flights:
        for flight in Dict_departures_flights[day_night]:
            doc_ref = db.collection(f'filter_flight').document(f'{flight}')
            doc_ref2 = db.collection(f'detail_and_grid').document(u'detail').collection(f'{flight}')
            doc_ref.set({
                'date': int(Dict_departures_flights[day_night][flight].iloc[0].timestamp.floor(freq='H').timestamp()),
                'id':flight,
                'period':day_night,
                'D_or_A':d_or_a,
                'available_grid':False
            })
            postdata = Dict_departures_flights[day_night][flight].to_dict('records')
            list(map(lambda x: doc_ref2.add(x), postdata))
            Showflights.append({
                'id':flight,
                'date' :int(Dict_departures_flights[day_night][flight].iloc[0].timestamp.floor(freq='H').timestamp()),
                'D_or_A': d_or_a
            })
            print('insert success', flight)
       

    # return {"response": f'Insert successful','status_code':200}
    return {"res": Showflights}



@app.post('/filter_flight')
def filter_flight(item:api_flightID):
    date_check, param_date = validate(item.date)
    if date_check:
        return {'response': param_date}
    period = None
    if item.period in ['day','night']:
        period = item.period
    # print(param_date+3600)
    # doc_ref = db.collection('filter_flight').where('period','==',period).where('date','==',param_date).limit(3)
    doc_ref = db.collection('filter_flight').where('date','>=',param_date).where('date','<',param_date+10800)
    docs = list(doc_ref.stream())
    flight_dict = list(map(lambda x: x.to_dict(), docs))
    return {'res':flight_dict}


@app.post('/grid_to_firebase')
def grid2firebase(date:generate_grid_api):

    flight_dict = [{'id':'AIQ3102-1670715240-schedule-0556'},{'id':'AIQ311-1670716320-schedule-0614'},{'id':'AIQ3029-1670715240-schedule-0553'}]
    # {'id':'AIQ3029-167075240-schedule-0553'},


    result = {
        'error':[],
        'succuss':[]
    }
    for i in flight_dict:
        name = i['id']
        print(name)
        doc_ref2 = db.collection('detail_and_grid').document('grid').collection(f'{name}')
        check_exist = doc_ref2.limit(1).stream()
        check_exist = list(check_exist)
        if check_exist != []:
            print('found')
            continue
        else:
            print('not found at main')

    
        tmp = generate_grid(i['id'], db)

        df_grid = tmp.pop('df', None)

        if df_grid is not None:
            result['succuss'].append(tmp)
            df_grid.reset_index(inplace=True)
            df_grid.columns = [str(col) for col in df_grid.columns]
            postdata = df_grid.to_dict('records')
            list(map(lambda x: doc_ref2.add(x), postdata))
            update_filter = db.collection('filter_flight').document(name)
            update_filter.update({'available_grid': True})
            print(f'add {i} succuess')
        else:
            result['error'].append(tmp)
            print("error", i)
        # break
  

    return JSONResponse(content=result)

@app.post('/web_cal_grid')
def web_cal_grid(flight_dict:List[str]):

    result = {
        'error':[],
        'succuss':[]
    }
    for name in flight_dict:
        print(name)
        doc_ref2 = db.collection('detail_and_grid').document('grid').collection(f'{name}')
        check_exist = doc_ref2.limit(1).stream()
        check_exist = list(check_exist)
        if check_exist != []:
            print('found')
            continue
        else:
            print('not found at main')

    
        tmp = generate_grid(name, db)
        # return {}
        df_grid = tmp.pop('df', None)

        if df_grid is not None:
            result['succuss'].append(tmp)
            df_grid.reset_index(inplace=True)
            df_grid.columns = [str(col) for col in df_grid.columns]
            postdata = df_grid.to_dict('records')
            list(map(lambda x: doc_ref2.add(x), postdata))
            update_filter = db.collection('filter_flight').document(name)
            update_filter.update({'available_grid': True})
            print(f'add {name} succuess')
        else:
            result['error'].append(tmp)
            print("error", name)
        # break
  

    return JSONResponse(content=result)




@app.post('/flight_path')
def flight_path(item:list_flight):
    size = 40
    flight_list = item.flights
    res_list = []
    #----- result grid for plot -----#
    cumu_value = [[0 for x in range(size)] for y in range(size)]
    
    cumu_grid = []
    df_cumu = {}
    
    for id in flight_list:
        doc_ref2 = db.collection('detail_and_grid').document('detail').collection(f'{id}').order_by('timestamp')
        docs = list(doc_ref2.stream())
        flight_dict = list(map(lambda x: x.to_dict(), docs))
        df = pd.DataFrame(flight_dict)
        df['altitude'] = df['altitude']*100
        df = df[['longitude','latitude','altitude']].values.tolist()

        doc_ref3 = db.collection('detail_and_grid').document('grid').collection(f'{id}')
        docs2 = list(doc_ref3.stream())
        flight_dict2 = list(map(lambda x: x.to_dict(), docs2))
        df2 = pd.DataFrame(flight_dict2)
        
        #----- for cumu grid -----#
        doc_ref4 = db.collection('filter_flight').document(f'{id}')
        docs3 = doc_ref4.get()
        df3 = docs3.to_dict()
        
        if not df2.empty:
            df4 = df2.copy()
            cumu_grid = df2.copy()
            df2 = pd.melt(df2, id_vars=['Lat'], value_vars=df2.drop(columns=['Lat']).columns)
            # print(df2)
            df2.rename(columns={'variable':'Long'},inplace=True)
            # df2['value'] = df2['value']/100
            # cumu_grid = df2[['Long','Lat']].values.tolist()
            df2 = df2[['Long','Lat','value']].values.tolist()
            
            #-----cumu grid -----#
            df_cumu[id] = {}
            df_cumu[id]['period'] = df3['period']
            
            cumu_grid.set_index('Lat',inplace=True)
            cumu_grid = cumu_grid.T
            cumu_grid.sort_index(inplace=True)
            col = list(cumu_grid.columns)
            col.sort(reverse=True)
            cumu_grid = cumu_grid[col]
            
            cumu_grid.index.name = 'Long'
            cumu_grid.reset_index(inplace=True)
            cumu_grid = pd.melt(cumu_grid, id_vars=['Long'], value_vars=cumu_grid.drop(columns=['Long']).columns)
            cumu_grid = cumu_grid[['Long','Lat']].values.tolist()
            
            df4.set_index('Lat',inplace=True)
            df4.sort_index(ascending=False,inplace=True)
            col = list(df4.columns)
            col.sort()
            df4 = df4[col]
            df_cumu[id]['grid'] = df4.copy()

            
        # else:
            # print('empty : ',id)
            # print(df2)
            # df2 = df2.values.tolist()
        tmp_dict ={
            'id':id,
            'value':df,
            'D_or_A': df3['D_or_A'],
            'date': df3['date']
            # 'grid':df2
        }
        res_list.append(tmp_dict)
        
    if len(df_cumu) != 0:
        
        #----- result grid for plot -----#
        cumu_value = [[0 for x in range(size)] for y in range(size)]
        #----- Variable Value for Cumulative Level ( Day-Night ) -----#
        t0 = 1
        T0 = 3
            
        #----- calculate cumulative level -----#
        for i in range(len(df_cumu[list(df_cumu.keys())[0]]['grid'])):
            for j in range(len(df_cumu[list(df_cumu.keys())[0]]['grid'])):
                LDN = 0
                for key in df_cumu.keys():
                    # LDN = LDN + Cumulative_model(df_cumu[key]['period'], df_cumu[key]['grid'].iloc[i, j])
                    LDN = LDN + Cumulative_model(df_cumu[key]['period'], df_cumu[key]['grid'].iloc[i, j], item.duration_day, item.duration_night)
                cumu_value[i][j] = 10*np.log10( (t0 / T0) * LDN )
        
        #----- set value to [long, lat, value] format -----#
        cumu_value = list(itertools.chain.from_iterable(cumu_value))
        for target_list, input_val in zip(cumu_grid, cumu_value):
            target_list.append(input_val)
            
    
    return {'response':'success','res':res_list, 'cumu_grid':cumu_grid}



def get_feet(distance):
    feet = distance.split('_')[1]
    return float(feet[:-2])

def check_spherical_propagation(r,l2, l0,r0):
    if r == r0:
        return l0
    return

@app.post('/check_noise_model')
def check_noise_model():
    npd_ref = db.collection(f'ANP_sound')
    npd_docs = list(npd_ref.stream())
    npd_dict = list(map(lambda x: x.to_dict(), npd_docs))
    npd = pd.DataFrame(npd_dict)
    npd = npd.query('NPD_ID == "CF567B" and `Op Mode` == "D" and `Noise Metric` == "LAmax" ')
    npd.set_index('Power Setting', inplace=True)
    npd = npd.drop(columns=['NPD_ID','Noise Metric','Op Mode']).T.reset_index()
    npd.rename(columns={'index':'distance'},inplace=True)
    npd['distance'] = npd['distance'].apply(get_feet)
    npd.columns = [str(col) for col in npd.columns]
    npd['distance'] = npd['distance'] *0.3048
    npd.apply(lambda row: check_spherical_propagation(row['distance'], row['distance'], row['Power Setting']),axis=1)
    print(npd)


    return





# uvicorn main:app --reload
# python -m uvicorn main:app --reload