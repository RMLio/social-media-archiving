# Installations

There is a deinstallation and installation script. This script does not include the [rethinkDB download](https://rethinkdb.com/docs/install/). This download is specific to the computers operating system. We will be using a virtual environment thus before starting a command please activate your environment first (source brozzler_env/bin/activate). It may be possible that you will need to retry downloading the easy and dashboard command when they are not recognized using:
```
pip install brozzler[easy]
pip install brozzler[dashboard]
```

For more information on what to do when you are working remotely on how to set this up check `remote-access-gui.sh`.

## Running ports
pywb runs on 0.0.0.0:8880 \
brozzler-dashboard runs on 127.0.0.1:8881

RethinkDB:\
Intracluster connections on port 29015\
Client driver connections on port 28015\
Default rethinkdb uses localhost:8080

## Requirements
Python 3.5,3.6,3.7,3.8\
RethinkDB\
Chrome or Chromium >= 64 version

Recommended setting up a virtual environment: \
python3 -m venv brozzler_env.\
source brozzler_env/bin/activate

## In the VM Brozzler (folder brozzler_python)
Has a virtual environment called in brozzler_env: python version 3.6.9\
requirements.txt contains the following : \
brozzler\
brozzler[easy]\
brozzler[dashboard]

rethinkdb and google chrome are installed.
Since 8080 port is already taken rethinkdb runs on port 8085.
Rethinkdb is started in the brozzler_python file!
