#!/bin/bash
sudo apt-get update

# python 3.6
sudo apt-get install python3.6

# virtual environment
python3 -m pip install --user --upgrade pip
python3 -m pip install --user virtualenv
python3 -m venv brozzler_env
source brozzler_env/bin/activate

# brozzler
printf 'brozzler\nbrozzler[easy]\nbrozzler[dashboard]' > requirements.txt
pip3 install -r requirements.txt
pip install brozzler[easy]
pip install brozzler[dashboard]

# wayback needs a yml file to run
printf '# "archive_paths" should point to the output directory of warcprox\narchive_paths: warcs/  # pywb will fail without a trailing slash\ncollections:\n  brozzler:\n    index_paths: !!python/object:brozzler.pywb.RethinkCDXSource\n      db: brozzler\n      table: captures\n      servers:\n      - localhost\nenable_auto_colls: false\nenable_cdx_api: true\nframed_replay: true\nport: 8880\n' > pywb.yml

# google chrome
sudo apt install wget
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f
rm google-chrome-stable_current_amd64.deb
