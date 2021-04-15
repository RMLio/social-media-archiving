# Instaloader

**This documentation was created in November/December 2020**

## Introduction
Instaloader is an opensource tool specifically designed to be used for Instagram. The tool has been licenced by MIT and is an active repository with the last post being in 09/2020. This tool requires pypi v4.5.3 and python 3.5 | 3.6 | 3.7 | 3.8. 

## Terminology
* Stories: posts that only last for 24 hours
* Highlight : are stories which are more "permanent" ast here is no expiration date
* Feed : is a users profile with the images and videos posted
* IGTV : video application of Instagram

## Features
This tool uses the command line to retrieve data. Another option is using the python module instaloader.
NOTE : tool experiences the data rate limits defined by Instagram

The following data can be retrieved with this tool:
* Public and private profiles (one or more can be listed)
* From each profile the stories, highlights, feeds, saved media, tagged posts, igtv can be downloaded, all profiles followed by a profile
* Filter based on hashtags, location id (specific to instagram), owner, date, isvideo, has been liked by login user, the amount of likes and comments, caption hashtags, mentions and tagged users
* From each post you can downloads comments, geotags and captions
* Login possible to retrieve session cookies (download private profiles non-interactively, access location)
* Options can be given in a txt file, updating local copy is possible, with or without compression, customize metadata for each Post or StoryItem (such as geotags, comments,...)

For each target the Instaloader creates a directory named after the target i.e. profile, #hashtag, %locationid, :feed, etc. In the directories these files of the posts are named after their timestamp. The directory and file names are configurable.

More command line options can be found [here](https://instaloader.github.io/cli-options.html#command-line-options).
The python module is explained [here](https://instaloader.github.io/as-module.html)

Features which may be lacking :
* Language filtering : Not possible
* Location option currently only supports Instragram location id, which is limited to search on specific cities, streets or sometimes even the location "my bed" which users have created some point in time.  Meaning that if you were to want all tweets from Belgium it would need to search for the entire list of location ids available in Belgium. Which does not have a straight forward api which can do that for you.
* Searching based on posts that contain certain words which are not hashtagged.

# Installation (expected duration <1 min, if other downloads needed <5 min)
The tool is downloaded with pip3 as showed below, but alternatives are possible for Arch Linux, Windows 10 and Android. 

* Is a docker container available? : no
* How long did it take to install the tool? : 5 minutes if there were to be install issues or when python and pip3 would also need to be installed. In general however less then half a minute.
* What other software needs to be installed? (E.g. a database?) : pip3, python (3.5|3.6|3.7|3.8)
* Which data need to be provided during the setup? : none

## Download using Bash script 
There is a bash script available in this repository to easy the installation and deinstallation. Note that before using instaloader the environment must be activated using the following command.
```
$ source instaloader_env/bin/activate
```

## Downloading yourself
```console
foo@bar:~$ pip3 install instaloader
```
Use "pip3 install --upgrade instaloader" if you already have instaloader

Make sure to test if the installation went well by running the following command
```console
foo@bar:~$ instaloader --help
```

If this command returns "command not found" then it may be that ~/.local/bin is not part of your $PATH environment variable. This is where pip installs a script to run Instaloader. Thus do the following command and the help page should show up when running the previously given command
```console
foo@bar:~$ export PATH="$HOME/.local/bin:$PATH"
```

# Configuration of the tool
This tool is specifically developed for Instagram, thus no changes can be made to access other social media platforms.

1. How is Twitter accessed? N/A
2. How is Facebook accessed? N/A
3. How is Instagram accessed? Using the instaloader command with any query wished.
4. Can a configuration file be given? There are no configuration files however it is possible to pass a txt file in the command line with all the arguments for the query. Then it would be possible to list eg many of user profiles if needed.

5. How can the output destination be changed? (folder or database):
 
For each target the Instaloader creates a directory named after the target i.e. profile, #hashtag, %location id, :feed, etc. In the directories these files of the posts are named after their timestamp.
To construct a filename or output folder name yourself one can use a few [options](https://instaloader.github.io/basic-usage.html#filename-specification) which are specific to the specific harvest such as {target}, {profile} Owner of the Post / StoryItem, {owner_id}, {shortcode} Shortcode (identifier string), {mediaid}, {date_utc} (same as {date})
In the terminal we do it the following way : instaloader --filename-pattern=research1_{profile}_{mediaid} profilename
An example of the directory name change and the file name change.
```console
foo@bar:~$ instaloader --dirname-pattern={profile} --filename-pattern={date_utc:%Y}/{shortcode} <target> ...
```

## Harvesting data non-interactively
Most queries do not need the login of instagram accounts. However, for some queries an instagram account must be logged in in order to harvest data. Data which need login first are private accounts, location filter, stories, currently-visible stories of your followees, your feed, posts marked as saved and all profiles that are followed by profile. Thus to allow non-interactive downloads a user must first login using the following command (this does not need to be a developer account):
```console
foo@bar:~$ instaloader --login username
Session file does not exist yet - Logging in.
Enter Instagram password for username:
```
After entering the password, you will receive a session cookie in the home directory. The next time you use --login username in the command line it will go look for your session cookie and login automatically when found. It is possible to have multiple session cookies of different accounts in the home directory.
Important note is that public profiles do not need logins and also have a higher data rate as there is less limitations as to how many posts can be archived per hour. [when logged in, at 95 posts a long wait was forced; when not logged in all 2200 posts were downloaded without pause]

Example of harvesting private profiles 
```console
foo@bar:~$ instaloader --login=your_username profile [profile ...]
```
NOTE: Warning: Use --login to download higher-quality versions of pictures. 

# Creating a new collection (general)
The creation of a collection (for example how users can instruct the harvesting tool to harvest certain data)

This tool has a commandline interface and a python module. This tool does not have a webinterface. The python module would allow developing a user web interface.

The files harvested are txt files, image or video files and metadata files are json files which are compressed by default but can be turned off. 

Questions
1. Is it possible to use different user accounts to manage collections: 
The tool does not require accounts. 
2. What content can be archived?: 
Public and private profiles (one or multiple), posts with its comments, stories, highlights, feeds, saved media, tagged posts, IGTV, all profiles followed by a profile, the amount of likes and comments, caption hashtags, mentions and tagged users, customize metadata for each Post or StoryItem

# Monitoring a collection
Harvesting a collection can be quitted, when we then download the data again we can add an option --fast-update, so that it will update the local copy.
Problem with resuming harvesting option is that it only checks the date of the newest post in your savings. So if gaps exist they will persist. So the user must keep track of errors, failed downloads.

Is it visible in the user interface how many errors occurred? 

During the downloading you will be able to see successful and unsuccesful downloads. At the end after the download or when stopping the download you will be able to see a summary. It will also add in the id of the post that did not succeed.
Example: 400 Bad Request Unable to fetch high quality image version of <Post CHiGdU8laoi>.
%213633143/2020-11-13_13-35-50_UTC_1.jpg 400 Bad Request Unable to fetch high quality image version of <Post CHiGdU8laoi>.

Example of the conclusion in the end:
Errors or warnings occurred:
400 Bad Request Unable to fetch high quality image version of <Post CHiGdU8laoi>.
400 Bad Request Unable to fetch high quality image version of <Post CHiGdU8laoi>.

# Creating an account-based selection

1. Can you provide several social media accounts?
It is possible to download public accounts and private accounts if the user is logged in. It is possible to give multiple profile names or a txt file with profile names if needed. 
2. How far back in time you can harvest the posts of a specific social media account?
As long as the data is available we can retrieve the data from instagram. For example stories which are only available for 24 hours will not be retrievable after its expiration date.

# Creating a keyword-based selection
This use case covers the collection of social media posts related to a specific event or keyword, for example if you ask the Twitter API to return all tweets for a certain hashtag or search string.

## Examples in the command line
Search strings can easily be constructed with different available filters. 
This would for example search for all the covid 19 related tweets in [brussels](https://www.instagram.com/explore/locations/213633143/).
% stands for location and the number after that is the instagram specific location id. Location ids can be found [here](https://www.instagram.com/explore/locations/). Important note that the query only accepts full number only id, cities for example can be %c269969 which can not be used.
--login follows the username of an account which we already have a session cookie of.
hashtag symbol must precede each hashtag term, always wrap it in "". 
Since we are using a location filter the user must be logged in.
```console
foo@bar:~$ instaloader --login username %213633143 "#covid_19"
```

Archive 2 different public profiles (more can always be added)
```console
foo@bar:~$ instaloader de.tijd destandaard 
```

Archive the igtv, tagged posts and highlights from de.tijd profile
```console
foo@bar:~$ instaloader de.tijd --igtv --tagged --highlights
```

Archiving posts from de.tijd profile but stating that no videos and no pictures should be downloaded. Comments however should be downloaded (off by default)
```console
foo@bar:~$ instaloader de.tijd --no-videos --no-pictures --comments
```

Get the amount of likes and the comments from the posts already downloaded previously.
```console
foo@bar:~$ instaloader --post-metadata-txt="{likes} likes, {comments} comments." <target>/*.json.xz
```

## Examples with the python module
```python
import instaloader

# Get instance
L = instaloader.Instaloader()

# Optionally, login or load session
L.login(USER, PASSWORD)        # (login)
L.interactive_login(USER)      # (ask password on terminal)
L.load_session_from_file(USER) # (load session created w/
                               #  `instaloader -l USERNAME`)
                               
```

Find all posts related to ghent.
```python
for post in instaloader.Hashtag.from_name(L.context, 'ghent').get_posts():
    # post is an instance of instaloader.Post
    L.download_post(post, target='#ghent')
```
## Output examples
### txt file contains the tweet without any extra information (eg. 2020-08-07_09-15-16_UTC.txt)
```
De epidemie die begin dit jaar uitbrak, was aangevuurd door de middenklasse die na terugkeer uit coronahaarden in skige$ 
‘De 10 procent minst gefortuneerden hebben bijna altijd een dubbel zo grote kans op besmetting’, zegt Brecht Devleescha$ 
Data-analyse: Thomas Roelens en Dries Bervoet.
 
Lees de volledige analyse via de #linkinbio

#corona #coronavirus #data
```
### the json file has .xz extention by default if not toggled off
.xz to unzip do the following

$ sudo apt-get install xz-utils
$ unxz file.xz

If you would like to have a organized view of this json file it is suggested to open the file with Firefox.

Included in these files are the following fields : id of the post, dimensions fo the image, amount of likes and if comments are disabled and how many, extended information on the owner (followers, following, blocked by viewer, related profiles...), url, thumbnail resources, tracking tokens, media to tagged user, if viewer has liked/added to collection/... 

3. The images are also added in jpg format, videos in mp4.

# Error handling
There are all kinds of things which can go wrong, e.g. the internet connection might drop, the social media API might be not available or a rate limit for consuming the content might be reached. It is valuable metainformation for a collection to know when which kind of error happened, e.g. to assess if a day of social media posts is missing.

* Changed profile name will automatically be detected and the target directory will be updated
* Automatic resume of previously-interrupted download iterations
* The errors are given in the command line, no logs are kept. If the user wants to it could manually by saving the output to a file and removing the lines before the conclusion which summarizes the errors.
* The errors are quite clear

Examples : 
When a non-existing profile name is given clear errors are given and a list of similar profile names are suggested.

If requesting for a location without login it will show the following :
```console
foo@bar:~$ instaloader %214487811
%214487811: --login=USERNAME required.

Errors or warnings occurred:
%214487811: --login=USERNAME required.
```

When a wrong location is given

```console
foo@bar:~$ instaloader %location
Invalid location %location
```

If no data was found with your searchstring : No targets were specified, thus nothing has been downloaded.

When a bad request happened it will log the error as follows, it will also be summarized in the end. The postid allows to know which post specifically went wrong : 
[downloadednumber] 400 Bad Request Unable to fetch high quality image version of <Post postid>.
%213633143/2020-11-13_13-35-50_UTC_1.jpg 400 Bad Request Unable to fetch high quality image version of <Post postid>.

When you are requesting too much data : -[downloadednumber] Too many queries in the last time. Need to wait 101 seconds, until 14:56.

NOTE : when a search is missing one of the files and you apply --fast-update it will only look if the newest post is available, if it is it will not further check and the existing gaps in the search will continue to exist. Thus it is of importance to keep track of the errors when downloading.

## Issues encountered

### Disconnected after too many request
"client_loop: send disconnect: Connection reset by peer" message received after waiting for the continuation of 
"The request will be retried in 431 seconds, at 05:35."

# Conclusion
Instaloader does not generate WARC files but downloads images, videos, posts in txt and metadata in json (compression can be toggled). This tool is designed to be used on Instagram only it is very complete in archiving and filtering all the different Instagram specific features such as stories, IGTV, feed, followers, etc. The tool provides compression and allows toggling images, thumbnails and video downloads. Instaloader can be used on commandline or via the python module. As it lacks a web interface it might be a little less user friendly. The python module allows enterprises to develop a user friendly web interface if needed. The module exposes internal methods and structure and allows user to go futher than the default options. Even though it is mainly a command line tool it is important to note that the commands are very straight forward and easy to use. Some limitations are that the error messages are not saved, but this can be done by saving the output in a file and only keeping the summary of the occurred errors and warnings. If this is not properly saved then data will be lost. --fast-update, the resume harvesting option, only checks the most recent data date which it has downloaded. So if there are gaps within your dataset it will not be fixed automatically.  Another problem is the filtering of location, which only can be done with the instagram location id. This id only exists in very small sections so a list of ids must be provided if a larger area is needed to be analysed. Lastly The tool does experience limitations in the download limit since it is dependent on the Instagram api.  

To conlude if properly used it is possible to retrieve all data required and help the tool by saving the error longs. This tool Is very complete in terms of Instagram feature coverage.
