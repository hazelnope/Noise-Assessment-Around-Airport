import os
import glob
import math
import numpy as np
import pandas as pd
import firebase_admin
import geopy.distance
from scipy import integrate
from firebase_admin import credentials
from firebase_admin import firestore
import sys
import requests
from sklearn.linear_model import LinearRegression

 
sys.path.append('./../Backend/')
from key_value.token import apiKey, apiUrl, auth_header




change_type = {
    # "A320"      : "737800",
    "A320"      : "727200",
    # "737-800"   : "737800",
    "737-800"   : "727200",
    "737-900"   : "727200",
    "Dash 8-400" : "727200"
}

mockup_api = ['AIQ311-1670716320-schedule-0614','AIQ3102-1670715240-schedule-0556']

lat_start =  13.831475
long_start = 100.525997

L_dB_start = 0
size = 40



#----- read fix_point to get power setting -----#
# df_fix_point = pd.read_csv('./../Preprocess/data/ANP2.2_Default_fixed_point_profiles.csv',delimiter=';', skiprows=[0])
# df_fix_point = pd.read_csv('./../Preprocess/data/ANP2.2_Default_fixed_point_profiles.csv',delimiter=';')

# df_fix_point = df_fix_point[df_fix_point['Stage Length'] == 1]
# df_fix_point = df_fix_point[df_fix_point['Op Type'] == "D"]

#----- read NPD to get L(dB) by [power setting - distance]-----#
# npd = pd.read_csv('./../Preprocess/data/ANP2.2_NPD_data.csv',delimiter=';', skiprows=[0])




#----- calculate distance from lat, long -----#
def add_distance(lat1, long1, lat2, long2, h2):
    position1 = (lat1,long1)
    position2 = (lat2,long2)
    a = geopy.distance.geodesic(position1, position2).ft
    b = h2
    b = b*100
    c_square = a**2 + b**2
    c = math.sqrt(c_square)
    return c

#----- function Single Soung Event -----#
def function_L(sound) :
    if sound ==0:
        return 0
    return 10**(sound / 10)

def get_feet(distance):
    feet = distance.split('_')[1]
    return float(feet[:-2])

def npd_inter_per_flight(df_param, npd_id,npd):
    npd_of_flight = npd[npd['NPD_ID'] == npd_id]
    npd_of_flight = npd_of_flight[npd_of_flight['Noise Metric'] == 'LAmax']
    npd_of_flight = npd_of_flight[npd_of_flight['Op Mode'] == 'D']
    npd_of_flight.set_index('Power Setting', inplace=True)
    # print(df_param[df_param['Power Setting' ]!=df_param['Power Setting' ]])
    # print(df_param['Power Setting'].unique())
    # print(df_param.loc[257])
    # print(npd_of_flight, npd_id)
    # print(npd)

    # print('-------------------')
    npd_of_flight = npd_of_flight.reindex(npd_of_flight.index.union(df_param['Power Setting'].unique()))
    # npd_of_flight = npd_of_flight.drop(columns=['NPD_ID','Noise Metric','Op Mode'])
    # npd_of_flight = npd_of_flight.dropna()
    # print(npd_of_flight)
    npd_of_flight = npd_of_flight.interpolate(method='index',limit_direction='both',limit=400)
    
    npd_of_flight = npd_of_flight.drop(columns=['NPD_ID','Noise Metric','Op Mode']).T.reset_index()

    # npd_of_flight = npd_of_flight.T.reset_index()
    npd_of_flight.rename(columns={'index':'distance'},inplace=True)

    npd_of_flight['distance'] = npd_of_flight['distance'].apply(get_feet)
    npd_of_flight.set_index('distance',inplace=True)
    # print(npd_of_flight)

    return npd_of_flight

def add_powersetting_2_flight(df_param, df_fixpoint):


    # df__tmp = df_fixpoint.copy().groupby('TAS (kt)').max()
    df__tmp = df_fixpoint.copy()
    # display(df__tmp)

    df__tmp = df__tmp.groupby('TAS (kt)').max()
    # df__tmp = df__tmp.groupby('Altitude AFE (ft)').max()
    # display(df__tmp)
    # print("before",df__tmp.shape)
    # print(df_param.groundspeed.unique())
    # print(df_param[df_param['groundspeed' ]!=df_param['groundspeed' ]])

    df__tmp = df__tmp.reindex(df__tmp.index.union(df_param.groundspeed.unique()))
    # df__tmp = df__tmp.reindex(df__tmp.index.union(df_param.altitude.unique()))
    # print("after",df__tmp.shape)
    # print(df__tmp)

    df__tmp = df__tmp.interpolate(method='index',limit_direction='both',limit=400)
    df__tmp = df__tmp.reindex(df_param.groundspeed.unique())
    # df__tmp = df__tmp.reindex(df_param.altitude.unique())
    df__tmp.reset_index(drop=False, inplace=True)
    df__tmp.rename(columns={'TAS (kt)':'groundspeed'}, inplace=True)
    # df__tmp.rename(columns={'Altitude AFE (ft)':'altitude'}, inplace=True)
    df__tmp = df__tmp[['groundspeed', 'Power Setting']]
    # df__tmp = df__tmp[['altitude', 'Power Setting']]

    # df_param = df_param.merge(df__tmp, how='left', on='altitude')
    df_param = df_param.merge(df__tmp, how='left', on='groundspeed')
    # print(df_param[df_param['Power Setting' ]!=df_param['Power Setting' ]])
    # print(df__tmp[df__tmp['Power Setting' ]!=df__tmp['Power Setting' ]])
    return df_param

def create_observerer():
    global lat_start, long_start, L_dB_start, size
    observer = np.zeros((size,size,3))
    for i in range(size) :
        for j in range(size) :
            observer[i][j] = lat_start, long_start, L_dB_start
            long_start += 0.004
        lat_start  += 0.004
        long_start = 100.525997
    lat_start =  13.831475
    return observer

def cal_noise_model(npd_param, distance, power_setting):

    x = npd_param.index.values.reshape(-1, 1)
  
    y = npd_param[power_setting].values.reshape(-1, 1)    
    x_inv_square = 1 / (x**2)
    x_transformed = np.c_[x, x_inv_square]
    reg = LinearRegression().fit(x_transformed, y)
    
    x_pred_inv_square = 1 / (distance**2)
    x_pred_transformed = np.c_[distance, x_pred_inv_square]
    y_pred = reg.predict(x_pred_transformed)

    result = y_pred[0][0]
    if result < 0:
        result = 0
    r0 = npd_param.index[0] *0.3048
    # r0 = 1
    r = distance*0.3048
    l = npd_param[power_setting].iloc[0]
    # l = 100
    res = 20 * np.log10(r/r0)
    # res = 10 * np.log10(r/r0)
    res = l-res
    if res<0:
        res = 0
    # if res>60:
    #     print(r0,r,res, l)



    # print(r0,r, l)
    print(result, res, distance)
    return result

def sound_range(sound, Lmin):
    if sound < Lmin:
        return 0
    return sound


def Calculate_Grid(observer,df_param, npd_param):
    # npd_after_inter = npd_param.copy()
    for i in range(len(observer)):
        for j in range(len(observer[i])): # j = [lat, long, L(dB)]
            #----- copy df_param -----#
            tmp = df_param.copy()
            
            #----- calculate distance every transection -----#
            # tmp_distance = []
            tmp['distance'] = -1
            
            for index, row in tmp.iterrows():
                distance = add_distance(observer[i][j][0], observer[i][j][1], row['latitude'], row['longitude'], row['altitude'])
                # print(distance)
                # tmp_distance.append(distance)
                # if distance > 5000 :
                #     distance = 999999
                tmp.loc[index, 'distance'] = distance

            
            
            #----- calculate L_dB from powersetting & distance -> copy to model_data -----#
            # for index, row in tmp.iterrows():
            #     nop = cal_noise_model(npd_param, row['distance'], row['Power Setting'])
            # print(tmp)
            tmp['sound'] =  tmp.apply(lambda row: cal_noise_model(npd_param, row['distance'], row['Power Setting']),axis=1)
            # return
            # print(tmp)
            # return
            # npd_after_inter = npd_param.reindex(npd_param.index.union(tmp_distance))

            # npd_after_inter = npd_after_inter.interpolate(method='index',limit_direction='both',limit=200)
            # model_data = npd_after_inter.copy()

            #----- add L_dB to df['sound'] & select -----#
            # for index, row in tmp.iterrows():
            #     tmp.loc[index,'sound'] = model_data.loc[row.distance,row['Power Setting']]

            #     if tmp.loc[index,'sound'] != tmp.loc[index,'sound']:
            #         tmp.loc[index,'sound'] = 0

            # find within range minus 10 of L max
            Lmax = tmp['sound'].max()
            L_min = Lmax -10
            tmp['sound'] = tmp.apply(lambda row: sound_range(row['sound'], Lmin=L_min),axis=1)
            #----- Single Sound Event Model -----#
            # if tmp.empty:
            #     continue
            tmp['Function'] = tmp['sound'].apply(function_L)

            

            area = integrate.simpson(tmp['Function'])
            #----- change -inf -> 0 -----#
            if area == 0:
                lSEL = 0
            else:
                lSEL = 10*np.log10( (1/1)*area)
                # if lSEL != lSEL:
                #     print('have NAN2')
                # if lSEL <= 40 or lSEL >=85:
                #     print("have ",lSEL)
        
            
            #----- add l_dB to observer -----#
            observer[i][j][2] = lSEL
        
    # model_data.to_csv('tmp_model.csv')
    # print(tmp['Function'])
    # print(tmp)
    return observer

def generate_grid(flight, db):
    df = {}
    # get npd from firestore
    npd_ref = db.collection(f'ANP_sound')
    npd_docs = list(npd_ref.stream())
    npd_dict = list(map(lambda x: x.to_dict(), npd_docs))
    npd = pd.DataFrame(npd_dict)
    # get fix point
    fixed_point_ref = db.collection(f'fixed_point_profiles')
    fixed_point_docs = list(fixed_point_ref.stream())
    fixed_point_dict = list(map(lambda x: x.to_dict(), fixed_point_docs))
    df_fix_point = pd.DataFrame(fixed_point_dict)
    df_fix_point = df_fix_point[df_fix_point['Stage Length'] == 1]
    df_fix_point = df_fix_point[df_fix_point['Op Type'] == "D"]


    result_func = {
    'status':1,
    'id':flight
    }
    
    doc_ref = db.collection('detail_and_grid').document('detail').collection(f'{flight}').order_by("timestamp")
    docs = list(doc_ref.stream())
    # print(docs)
    flight_dict = list(map(lambda x: x.to_dict(), docs))
    df['df'] = pd.DataFrame(flight_dict)
    # print(f'flight -> {flight}')
    # print('-------------------------------------- here --------',df['df'])
    
    #----- set air_type, NPD_ID -----#
    aircraft = flight.split('-')[0]
    # print(aircraft)
    doc = db.collection('aircraft_engine').document(f'{aircraft}').get()
    if doc.exists:
        doc = doc.to_dict()
        air_type = doc['type']
        df['ACFT_ID'] = air_type
        # print('found ACFT_ID', df['ACFT_ID'])

    else: 
        print('not found',aircraft)
        response = requests.get(apiUrl + f"flights/{aircraft}",headers=auth_header)
        # print('resp', response)
        if response.status_code == 200:
            print("got aircraft_type", aircraft)
            # print('resp', response.json()['flights'])
            if response.json()['flights'] == [] :
                result_func['status'] =0
                result_func['message'] = f'FlightAware got no data about {aircraft}'
                return result_func
            aircraft_type = response.json()['flights'][0]['aircraft_type']
            
            #----- get engine data from aircraft_type -----#
            response = requests.get(apiUrl + f"aircraft/types/{aircraft_type}",headers=auth_header)
            
            if response.status_code == 200:
                # print("got engine data")
                engine_data = response.json()
                engine_data.pop('manufacturer', None)
                engine_data.pop('description', None)
                engine_data['flight_id'] = aircraft
                
                #----- add to firestore -----#
                doc_ref = db.collection(f'aircraft_engine').document(f'{aircraft}')
                doc_ref.set(engine_data)
            else:
                # print("this error")
                result_func['status'] =0
                result_func['message'] = 'Error executing request'
                return result_func  
                
            # df['ACFT_ID'] = aircraft
            df['ACFT_ID'] = engine_data['type']

        else:
            result_func['message'] = 'Error executing request'
            result_func['status'] =0
            return result_func
            
    airtype = df['ACFT_ID']       
    doc2 = db.collection('NPD_ID').document(f'{airtype}').get()
    if doc2.exists:
        doc2 = doc2.to_dict()
        df['NPD_ID'] = doc2['NPD_ID']
    else: 
        # print('not found NPD : ', flight, f' Aircraf_type : \"{airtype}\"')
        result_func['status'] =0
        result_func['message'] = f'not found NPD : {flight}, Aircraf_type : "{airtype}"'
        return result_func
    NPDForCheck = df['NPD_ID']
        
    # print(f'airtype :{airtype}, npd: {NPDForCheck}, flight_ID: {flight}')
    result_func['message'] = f'airtype :{airtype}, npd: {NPDForCheck}, flight_ID: {flight}'
    # return result_func
    
    #----- set period -----#
    doc2 = db.collection('filter_flight').document(f'{flight}').get()
    if doc2.exists:
        doc2 = doc2.to_dict()
        period = doc2['period']
        df['period'] = period
    
    #----- add data_fix_point -----#
    aircraft_type = df["ACFT_ID"]
    if aircraft_type in change_type:
        aircraft_type = change_type[aircraft_type]

    df['df_fix_point'] = df_fix_point[df_fix_point.ACFT_ID == aircraft_type]
    df['df_fix_point'] = df['df_fix_point'].reset_index(drop=True)
    #----- add power setting to df -----#
    # print('-------------------------------------- here --------',df['df'])
    df['df'] = df['df'].dropna()
    # print('here',df['df'])

    df['df'] = add_powersetting_2_flight(df['df'], df['df_fix_point'])
    # df['df'] = df['df'].dropna()

    # #########################
    # print('here',df['df'].isna().sum())
    # return df['df']
    # df['df'].to_csv('check_power.csv')

    #----- get NPD table -----#
    # print(df['NPD_ID'],'npd')
    # print(airtype,'airtype')
    df['npd'] = npd_inter_per_flight(df['df'], df['NPD_ID'], npd)
    #----- create grid [lat, long, 0] -----#
    df['grid'] = create_observerer()

    # print('aaaaaa',df['df'])
    #----- get grid from calculate_Grid -----#
    # df['npd'].to_csv('check_npd.csv')
    df['npd'] = df['npd'].sort_index()
    # df['npd'] = df['npd'] * 0.3048
    df['grid'] = Calculate_Grid(df['grid'], df['df'], df['npd'])
    return None
    #----- TO PIVOT TABLE -----#
    df_tmp = pd.DataFrame(columns = ['Lat','Long','L_dB'])

    #----- matrix to pandas -----#
    for i in range(len(df['grid'])):
        row = pd.DataFrame(df['grid'][i], columns = ['Lat','Long','L_dB'])
        df_tmp = pd.concat([df_tmp, row])
    
    #----- Create pivot table -----#
    tabal_df = pd.pivot_table(df_tmp,index='Lat',columns='Long',values='L_dB')

    df['grid'] = tabal_df
    df['grid'] = df['grid'].iloc[::-1]
    
    result_func['df'] = df['grid']
    return result_func
# generate_grid(mockup_api)


# result_func = {
#     'status':1,
#     'id':'test',
#     'df':pd.DataFrame
# }