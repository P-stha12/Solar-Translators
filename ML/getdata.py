#warning! this scripts downloads about 30GB of Data

import requests
from bs4 import BeautifulSoup
from urllib.request import urlretrieve
import os
import wget

#os.chdir(r'C:\Users\shres\OneDrive\Desktop\windspeed')
os.chdir(r'C:\Users\shres\OneDrive\Desktop\magnetic')

#link = 'https://cdaweb.gsfc.nasa.gov/pub/data/wind/swe/swe_h1/2012/'
link = 'https://cdaweb.gsfc.nasa.gov/pub/data/wind/mfi/mfi_h2/2012/'
req = requests.get(link)
soup = BeautifulSoup(req.content, 'html.parser')
a = soup.find_all('a')
files = []

for ae in a:
    if 'cdf' in ae.get('href'):
        files.append(ae.get('href'))

for file in files:
    response = wget.download(link+file, file)
