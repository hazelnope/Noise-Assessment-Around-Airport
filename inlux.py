import influxdb_client, os, time
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime

import pandas as pd

from key_value.token import INFLUXDB_TOKEN as token
# import token from 'token/'


org = "boonsak.s@ku.th"
url = "https://europe-west1-1.gcp.cloud2.influxdata.com"

client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)




#---------------เขียนลง DB-----------------
# bucket="Flight_aware"

# write_api = client.write_api(write_options=SYNCHRONOUS)
   
# for value in range(4,5):
#   point = [(
#     Point("flight_id")
#     .tag("groupspped",11)
#     .tag("test","test2")
#     .field("ID_XY", 11)
#     .time('2022-12-01 00:02:00')
#   ),
#   (
#     Point("flight_id")
#     .tag("test","test3")
#     .field("ID_XY", 22)
#     .time('2022-12-01 00:02:00')
#   )
#   ]
#   write_api.write(bucket=bucket, org="boonsak.s@ku.th", record=point, write_precision='s')
#   time.sleep(1) # separate points by 1 second




#-----------------อ่านคิวรี่------------------
# query_api = client.query_api()

# query = """from(bucket: "Flight_aware")
#  |> range(start: -30d)
#  |> filter(fn: (r) => r._measurement == "flight_id")
#  |> filter(fn:(r) => r._field == "ID_XY")

#  """
 
# tables = query_api.query(query, org="boonsak.s@ku.th")
# tables = query_api.query_data_frame(query, org="boonsak.s@ku.th")

# print(type(tables))
# print(tables)
# test_df = pd.DataFrame()
# print(type(test_df))
# for table in tables:
#   print(table)
#   for record in table.records:
#     # print(record)
#     print(type(record))
#     # print(record.values['_value'])
#     print(record.get_value())
#     print(record.get_field())
#     print(record.values)
#     print()



#--------รวมข้อมูล--------
# query_api = client.query_api()

# query = """from(bucket: "Flight_aware")
#   |> range(start: -10m)
#   |> filter(fn: (r) => r._measurement == "measurement1")
#   |> mean()"""
# tables = query_api.query(query, org="boonsak.s@ku.th")

# for table in tables:
#     for record in table.records:
#         print(record)






# json_body = [
#         {
#             "measurement": "flight_id",
#             "tags": {
#                 "host": "server01",
#                 "region": "us-west"
#             },
#             "time": "2022-12-01 00:02:00",
#             "fields": {
#                 "Float_value": 0.64,
#                 "Int_value": 3,
#                 "String_value": "Text",
#                 "Bool_value": True
#             }
#         },
#         {
#             "measurement": "flight_id",
#             "tags": {
#                 "host": "server01",
#                 "region": "us-west"
#             },
#             "time": "2022-12-01 00:02:00",
#             "fields": {
#                 "Float_value": 0.12,
#                 "Int_value": 5,
#                 "String_value": "Text2",
#                 "Bool_value": True
#             }
#         }
#     ]
  
# client.write_points(json_body, time_precision='s', database='Flight_aware')