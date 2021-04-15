#!/bin/bash
sudo apt-get update

# python 3.6
sudo apt-get install python3.6

# virtual environment
python3 -m pip install --user --upgrade pip
python3 -m pip install --user virtualenv
python3 -m venv brozzler_env
source twarc_env/bin/activate

# install twarc
pip install twarc