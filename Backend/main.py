from fastapi import FastAPI
import pandas as pd

app = FastAPI()
df_sample_data = pd.read_csv('../Preprocess/data/Sample_data1.csv')


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/get_flight")
def get_flight():

    return {"Hello": "World"}