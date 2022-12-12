
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import pickle

import pandas as pd

print()
cred = credentials.Certificate('Backend/serviceAccount.json')
app = firebase_admin.initialize_app(cred)

db = firestore.client()

doc_ref = db.collection(u'dd-mm-yy').document(u'Day').collection(u'flight_ID')
# doc_ref = db.collection(u'users')
# doc_ref = db.collection(u'Date').document(u'Day').collection(u'Arrivals').document(u'alovelace')
# doc_ref.set({
#     u'first': u'Ada',
#     u'last': u'Lovelace',
#     u'born': 1815
# })



# df = pd.read_csv('Preprocess/data/Sample_data3.csv')
# postdata = df.to_dict('records')
# list(map(lambda x: doc_ref.add(x), postdata))
# print(postdata)
# doc_ref.push(postdata)



# def batch_data(iterable, n=1):
#     l = len(iterable)
#     for ndx in range(0, l, n):
#         yield iterable[ndx:min(ndx + n, l)]

# def upload_file(df):
#     file_name = f'test.csv'
#     df.to_csv(file_name, index=False)

#     return



import time

start = time.time()

# users_ref = db.collection("/test/eKJpCK7IgpSI7x90Ky3C/test2")
users_ref = db.collection("2022-12-09").document("day").collection('AIQ359-1670457540-schedule-0563')
# users_ref = db.collection("test").document("eKJpCK7IgpSI7x90Ky3C").collection('test2')

docs = list (users_ref.get())
# print(docs)
flight_dict = list(map(lambda x: x.to_dict(), docs))
df = pd.DataFrame(flight_dict)
end = time.time()

print(df)
print('end time => ',end - start)