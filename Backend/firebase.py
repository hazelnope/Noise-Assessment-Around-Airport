
import firebase_admin
from firebase_admin import credentials

import os 
dir_path = os.path.dirname(os.path.realpath(__file__))
print(dir_path)
dir_list = os.listdir(dir_path)
 
print("Files and directories in '", dir_path, "' :")
 
# prints all files
print(dir_list)

print()
cred = credentials.Certificate('serviceAccount.json')
firebase_admin.initialize_app(cred)

