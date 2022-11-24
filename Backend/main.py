from fastapi import FastAPI
import pandas as pd

app = FastAPI()
df_sample_data = pd.read_csv('../Preprocess/data/pamika.csv')


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/get_flight")
def get_flight():

    return {"Hello": df_sample_data[['long','lat','altitude_ft']].values.tolist()}


# col_list = df_sample_data[['long','lat','altitude_ft']].values.tolist()
# uvicorn main:app --reload
# python -m uvicorn main:app --reload