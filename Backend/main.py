from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df_sample_data = pd.read_csv('../Preprocess/data/Sample_data2.csv')


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


# col_list = df_sample_data[['long','lat','altitude_ft']].values.tolist()
# uvicorn main:app --reload
# python -m uvicorn main:app --reload