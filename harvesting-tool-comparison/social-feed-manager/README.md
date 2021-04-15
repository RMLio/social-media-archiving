# Social Feed Manager (SFM)

**This documentation was created in November/December 2020**

## Introduction
Social Feed Manager is an opensoure software designed to create collections of data from social media platforms.
It harvests from Twitter, Tumblr, Flickr, Sina Weibo and is extensible for other platforms. 
This tool has been licenced by MIT and the last update dated from 05/2020. 
In this study we will focus on Twitter, Instagram and Facebook. 

## Features
SFM has a webinterface which offers many features offering possibilities to work together in teams and share collections dynamically.
It is possible to create, delete, monitor and manage collections in a clear and structural way.
It offers possibilities to create a collection from scratch or incrementally from last data retrievals.
The user can choose to automatically delete seeds for deleted/not found accounts, suspended accounts and/or protected accounts.
It is also possible to schedule recurring harvests (every 30 min, 1 hour, 4 hours 12 hours, every day, week or 4 weeks), an end date can also be provided.
For every collection and collection set more information can be given to clearly keep track of what this collection contain. 
**SFM supports Twitter, Tumblr and Sina Weibo.**
The collection can then be collected into a spreadsheet or feed the data to the processing pipeline from the command line.

For Twitter there are several types of collections

1. Twitter user timeline: Collect tweets from specific Twitter accounts
2. Twitter search: Collects tweets by a user-provided search query from recent tweets
3. Twitter sample: Collects a subset of all tweets in real time.
4. Twitter filter: Collects tweets by user-provided criteria from a stream of tweets in real time.

Harvesters for other social media providers can be added
by providing a wrapper to integrate it to the RabbitMQ message queue of the SFM framework, e.g. as docker image.


## Installation/setup

* Is a docker container available: [Yes](https://github.com/gwu-libraries/sfm-docker.git)
* How long did it take to install the tool with the setup: 20 min
* What other software needs to be installed : docker, docker-compose
* Which data needs to be provided during setup : twitter API key, application access tokens and secret values is obliged. To run SFM on HTTPS a localhost certificate and private key will be needed. Information on your institution, email,... is all optional. 
* What are the commands to install the tool: using docker-compose, see documentation


1.git clone (there is an [alternative way](https://sfm.readthedocs.io/en/latest/install.html#amazon-ec2-installation))
```console
$ git clone https://github.com/gwu-libraries/sfm-docker.git
$ cd sfm-docker
Replace 2.1.0 with the correct version.
$ git checkout 2.1.0
$ cp example.prod.docker-compose.yml docker-compose.yml
$ cp example.env .env
```

2. update the configuration in example.env : In this step you can set new passwords, datavolumes, hostnames, ports, set up emails, information about your institution and so on. The only thing that you must do is uncomment the TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET (Weibo and Tumblr if needed) and associate it with your own key and secret value. 

For Twitter consumer key and secret you will need a free [developers-account](https://developer.twitter.com/en/apply-for-access) and give some information on what you are going to do with the data, then the free keys will be provided to you instantly. Instagram and Facebook is not yet implemented thus are not discussed. 

To edit the other optional configurations make sure to have a look [here](https://sfm.readthedocs.io/en/latest/install.html#install-configuration). Note if you would like to receive an email notification when the data is done exporting then you will need to enter edit your email information in the configuration file.

3. Download containers and start SFM. The first time it might take a few minutes. These images are large (roughly 12GB), so make sure you have enough disk space.
If you dont have docker you might need to run this first "sudo apt install docker-compose".
```console
$ docker-compose up -d
```
4. Suggested to scale up the Twitter Rest Harvester container 
```console
$ docker-compose scale twitterrestharvester=2 twitterpriorityrestharvester=2
```

5. Run SFM with HTTPS
* Create or acquire a valid certificate and private key.
Since we want the certificate and private key for our localhost run the following command in the sfm-docker directory (more information on adding cert and keys to localhost [here](https://letsencrypt.org/docs/certificates-for-localhost/)): 

```
$ openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```
Then we will copy the certificate to our ca-certificates folder 
```
$ sudo cp localhost.crt /usr/local/share/ca-certificates/localhost.crt
$ cd /usr/local/share/ca-certificates/localhost.crt
change permission of the file
$ sudo chmod 644 localhost.crt
update the trusted certificates and you will see one is added.
$ sudo update-ca-certificates
```
* In docker-compose.yml uncomment the nginx-proxy container and set the paths under volumes to point to your certificate and key. move the key and certificate to /etc/nginx/certs directory. If it does not yet exist create the directory. Again chmod 644 localhost.crt in this folder.
* In .env change USE_HTTPS to True and SFM_PORT to 8080. Make sure that SFM_HOSTNAME matches your certificate, which is in our case localhost.
* Start up SFM. (It is possible that ports will have to be changed in the docker compose nginx-proxy, 80:80  might already be in use)
```
$ docker-compose up -d
```
You will be able to find the interface on [http://localhost:8080](http://localhost:8080)

### Usage
1. Sign up is needed to harvest your first collection.
2. Get credentials to authorize access to social media platforms. (Credentials are keys used by each platform to control the data they release to you). On the webinterface itself register your credentials as follows: 

* Navigate to [twitter apps](https://apps.twitter.com/).
* Sign in to Twitter and select “Create New App.”
* Review and agree to the Twitter Developer Agreement after filling in the forms.

* Go to the created application and press on the key button to view keys or regenerate access tokens and secret.
* Go to the web interface of SFM and go to the tab credentials. Fill in your found keys, access tokens and secret values.
* Save, now you can continue making collections with this credential.

3. Create collection set in collection sets tab
4. Add collection set with unique name and one or multiple seeds(criteria to collect, can be individual accounts or posts). When adding a seed you will need the profile id, which can be found with online tools such as [tweeterid](https://tweeterid.com/). Entering their @username, will return their id number.

Note: when creating collections and you are part of a group project, you can contact your SFM administrator and set up a new group which you can share each collection set with. (can be changed or added later on).

## Configuration of the tool
* How is Twitter/Facebook/Instagram accessed? Through the web interface different Twitter collections can be made
* How  can the output destination be changed : the data can be exported (note section on Data output format). You can save as and then change the name of the file and choose an output destination when downloading the file.
* Can a configuration file be given: No, configuration is done via the web interface.

### Data output format
File types include Excel (.xlsx) and Comma Separated Values (.csv), full data is available using JSON. One can also load the format into analysis software such as Stata, SPSS, or Gephi [1](#extra). It is possible to export the size of the file which you would prefer based on the number of posts. Deduplication is possible to have only one instance of each post. It is also possible to filter based on start and end date of creation (date will be in local timezone). 

The datafields of the data are according to each platforms API. Click here to see specific examples of [dictionaries](https://sfm.readthedocs.io/en/latest/data_dictionary.html#data-dictionaries).

It is also possible to feed the data into the processing pipeline on the commandline.

SFM does not currently provide a web interface for “replaying” the collected social media or web content.

## Creating a new collection (general)
* Web interface available to create/edit a collection? Yes, very complete web interface. (Sharing collections, deleting, editing, creating,...)
* Possible to use different user accounts to manage collections? Yes,if you are part of a group project, you can contact your SFM administrator and set up a new group which you can share each collection set with
* What content can be archived? Posts, replies, etc? 
    1. Instagram : N/A
    2. Facebook : N/A
    3. Twitter : 
For Twitter there are several types of collections
1. Twitter user timeline: Collect tweets from specific Twitter accounts
2. Twitter search: Collects tweets by a user-provided search query from recent tweets : geocode and search strings can be passed. Guidelines to construct the search query using Twitter. We can filter based on the Twitter searchs search query syntax. Allowing users to define which words must be present together, or one or the other must be present, mentioning, hashtag contained, tweet send by and so on.
https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/guides/standard-operators
3. Twitter sample: Collects a subset of all tweets in real time.
4. Twitter filter: Collects tweets by user-provided criteria from a stream of tweets in real time.

Creating a data collection can be done in a very structured manner. You first create or select a collection set, which you give a name and description. Then you select or create a collection, with more detailed description and urls if needed. Finally you define the seed. In every step you have the opportunity to give a description to keep track of what is going on. Especially important when working in larger teams. When you would like to turn off harvesting (or pause) you can add a note with a description as to why you stopped it, which can be very helpful.

## Monitoring a collection
This use case covers the monitoring of an existing collection, for example a collection about 
“#COVID-19” tweets which are harvested around the clock or a collection of specific accounts twice per day.

* Can the harvest of a collection be paused/resumed? Yes, it is supported in the web interface. When turning off the collection there is an option which allows the user to leave a note, to explain why the harvest is turned off. It can be resumed by turning it on again. Resuming or incrementally adding to previous archived datasets is possible. 
* Is it visible in the user interface how many errors occurred? No, there seem to be no errors.

## Creating an account-based selection
This use case covers the collection of a list of social media accounts to archive, for example deMorgen, nieuwsblad and knack.

* Can you provide several social media accounts?
Yes, you can do this by giving creating different seeds in the collection. Or by using the Twitter query and indicate the different accounts you are interested in.
* How far back in time you can harvest the posts of a specific social media account?
The tool relies on the Twitter API thus within 7 weeks or when you harvest a timeline within 2 months.


## Creating a keyword-based selection
This use case covers the collection of social media posts related to a specific event or keyword, 
for example if you ask the Twitter API to return all tweets for a certain hashtag or search string.

1. Harvesting from the public profile page Tijd.
Created type is 'Twitter user timeline': Collect tweets from specific Twitter accounts
Adding a seed with id found on tweeterid.com => 3147651. 3,226 tweets were harvested date of the furthest post dates from "Apr 01 2007". The posts were exported in full json. An email was send as soon as the data was ready to be analysed. Each tweet is a different line.

2. Twitter search: Collects tweets by a user-provided search query from recent tweets
Guidelines to construct the search query using Twitter. https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/guides/standard-operators
The following search string was given : "#corona #belgique" and no geocode. In this case thus we want to find both the hashtags in the tweet.

4. Examples of some more advance search strings which are found in the previously mentioned [Twitter guide](https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/guides/standard-operators):

| Search query | Meaning |
| ------ | ------ |
| from:interior | would mean tweet send from account interior. |
| puppy url:amazon  | containing “puppy” and a URL with the word “amazon” anywhere within it. |
| to:NASA  | Tweet authored in reply to Twitter account “NASA” |
| politics filter  | safe containing “politics” with Tweets marked as potentially sensitive removed.|


Many other options exist such as language parameter and so on.


3. Twitter search string "sport" combined with a geocode of Brussels with radius 10 miles: 50.85045,4.34878,10mi passed as geocode.
Geocode is constructed in the format latitude,longitude,[radius]mi. For the longitude and latitude we need the DD coordinates. Easy lookup can be done on the following site [latitude.to](https://latitude.to/map/be/belgium/cities/brussels). The radius is in miles.
When conducting geo searches, the search API will first attempt to find Tweets which have lat/long within the queried geocode, and in case of not having success, it will attempt to find Tweets created by users whose profile location can be reverse geocoded into a lat/long within the queried geocode, meaning that is possible to receive Tweets which do not include lat/long information.


## Error handling
There are all kinds of things which can go wrong, e.g. the internet connection might drop, the social media API might be not available or a rate limit for consuming the content might be reached. It is valuable metainformation for a collection to know when which kind of error happened, e.g. to assess if a day of social media posts is missing.

All components have logging enabled. In case the framework runs via docker the log of a specific container can be displayed like shown for the `sfm_ui_1` container:

```
docker log --follow --tail=200 sfm_ui_1
```

When harvests fail for some reason, subsequent harvests will be skipped.
This is also indicated in the UI, and one has to "void" the failed harvest in the UI such that subsequent harvests will run again.
This is further described in the SFM documentation.

## Extra information
**[Gephi](https://gephi.org/)** is an open source visualization tool for visualizing and analysing large networks’ graphs. No programing knowledge required, user-friendly and intuitive UI and produces the highest quality and most attractive visualizations.

| Tool | Gephi |
| ------ | ------ |
| Platform | Java |
| Cost | Free |
| Tractable number of nodes | Networks up to 100,000 nodes and 1,000,000 edges |

**[Stata](https://www.stata.com/)** and **[SPSS](https://www.ibm.com/analytics/spss-statistics-software)** are non-opensource statistical software for data science. 

For more information on visualising exported data [https://gwu-libraries.github.io/sfm-ui/posts/2017-09-08-sna](https://gwu-libraries.github.io/sfm-ui/posts/2017-09-08-sna)\


## Conclusion 
The Social Feed Manager is a harvesting tool with extensive and clear documentation.
The tool has a very structured and complete web interface.
The user can do practically everything it would possibly need such as creating, editing, deleting, managing, pausing, resuming, monitoring (with visuals), exporting and so on.
Thus this web interface is very user friendly even for those not familiar with command lines.
It allows people to work in teams and make some of the collections visible for a limited subgroup.
It is possible to resume harvests, harvest in a scheduled manner and optionally in an incremental fashion.
The harvesting is fast and has a wide variety of export formats.
The harvested data can be deduplicated during export and filtered based on dates to limit the output.
It is also possible to visualize the retrieved data with other tools such as Gephi, Stata and SPSS.
The tool is deployed with Docker and currently has support for Twitter, Seina Weibo and Tumblr. 
Thus when other good tools have been found in the future it would be possible to merge it into the Social Feed Manager by wrapping it in a Docker container.
The setup of this tool is quite extensive but only has to be done by the admin once, and is facilitated by docker, and other users can use the web application without any knowledge of the details.
To harvest Twitter it currently uses the API, and as Twitter has a rich set of search queries a lot of interesting data can be retrieved.
The tool harvests on the fast side. Do note that the Twitter API does come with limitations as to how many tweets you can harvest in a limited period of time.

The full json format offers quite a bit of metadata which can be interesting to study such as used languages, hashtags, linked urls, images used, user mentions, user data and so on.
A downside is that the look-and-feel of the tweet is no longer retained. 
