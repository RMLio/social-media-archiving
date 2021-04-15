#!/bin/bash
sudo apt-get update

# python 3.6
sudo apt-get install python3.6

# virtual environment
python3 -m pip install --user --upgrade pip
python3 -m pip install --user virtualenv
python3 -m venv instaloader_env
source instaloader_env/bin/activate

# brozzler
printf 'instaloader\n' > requirements.txt
pip3 install -r requirements.txt
export PATH="$HOME/.local/bin:$PATH"
pip3 install instaloader

