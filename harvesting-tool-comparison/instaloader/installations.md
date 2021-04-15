# Installations

There is a deinstallation and installation script. We will be using a virtual environment thus before starting a command please activate your environment first (source instaloader_env/bin/activate).

For more information on what to do when you are working remotely on how to set this up check `remote-access-gui.md`.

## Running ports : none

## Requirements
pypi v4.5.3\
Python 3.5,3.6,3.7,3.8

Recommended setting up a virtual environment: \
python3 -m venv brozzler_env.\
source instaloader_env/bin/activate

## In the VM Instaloader (folder instaloader_test)
Has a virtual environment called in instaloader_env: python version 3.6.9\
requirements.txt contains the following : \
instaloader

Different posts run on 04/12/2020 
```
# all posts with the hashtag coronabelgique
instaloader "#coronabelgique"
# harvesting 2 public profiles de tijd and standaard
instaloader de.tijd destandaard 
# login via biassketch account to have high quality images, with comments turned on
instaloader --login biassketch demorgen --comments
```
