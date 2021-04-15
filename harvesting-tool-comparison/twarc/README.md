# Twarc

**This documentation was created in November/December 2020**.

## Introduction
Twarc is a command line tool and Python library for archiving Twitter JSON data. The tool is part of the [Documenting the Now](https://www.docnow.io/) project, the Github repository is active and was last updated 12/2020. It has a MIT Licence and the requirements of the tool is *Python 2 or 3*. Each tweet is represented as a JSON object that is exactly what was returned from the Twitter API. Tweets are stored as line-oriented JSON. Twarc will handle Twitter API's rate limits for you. In addition to letting you collect tweets Twarc can also help you collect users, trends and hydrate tweet ids.

## Features
Twarc is a commandline tool specifically developed to harvest tweets from Twitter. There are also possibilities to use the python module Twarc as a library. It relies on the Twitter api and thus has the limitation of only being able to harvest tweets from within a week. You can search on tweets matching a given query, filter on tweets as they happen or fetch random samples of tweets of recent public statuses. There is an option to dehydrate tweets from a file of tweets (generate an id list). Hydrate will then do the opposite and and regenerate tweets from the identifiers. This is useful for sharing tweets, Twitter does not allow sharing large amounts of large data but does allow sharing tweetids. It is possible to link your Premium Search API and link the Gnip Twitter Full-Archive Enterprise API. There is also a utils direcory which helps working with the line-oriented JSON. It can print the archived tweets in form of txt or html, extract usernames, referenced urls and so on. 

## Setup/Installation (1 minute)
* Is a docker container available: Yes
* How long did it take to install the tool with the setup: 1 minute
* What other software needs to be installed : python 2 or 3
* Which data needs to be provided during setup : Twitter api key, application access tokens and secret values must be given. If you don't know your application access token and its secret value you can give permission to the tool to access you Twitter for you.

### Installation

1. **Installation script**
Available in the repository.

2. **Manual download**
Mac OS users:
```
# install python
sudo apt-get install python
# install pip
sudo apt install python-pip
# install twarc
pip install twarc
```

Mac OS users:
```
$ brew install twarc
```
### Setup
```
$ twarc configure
```
In the configure you will have to pass your Twitter api key, application access tokens and secret values must be given. If you don't know your application access token and its secret value you can give permission to the tool to access you Twitter for you.

## Configuration of the tool
* How is Twitter accessed? : Tool is specifically made for Twitter thus automatically will access it.
* How is Facebook/Instagram accessed? : N/A, tool is only made for Twitter
* How  can the output destination be changed : yes, the output name and destination are chosen by the user by piping the output to a file.
* Can a configuration file be given: No

## Creating a new collection (general)
* Web interface available to create/edit a collection? No.
* Possible to use different user accounts to manage collections? No, tool does not use accounts
* What content can be archived? Posts, replies, etc? 
    1. Instagram : N/A
    2. Facebook : N/A
    3. Twitter : 

Search on tweets matching a given query (tweets <= 7 days, geocode, language can be added with flags)
Filter on tweets as they happen (follow a user, location and language can be added using flags)
Sample on tweets to listen at a random sample of recent public statuses
Get users metadata given 1<= screennames/userids
Get the followers of one user (order is reverse chronological, most recent follower first)
Get the friends of one user
Get the timeline of one users screenname or user id. (data <= 2 months)
Retweets of an twitter id or lists of ids.
Replies on a tweet. --recursive option will also fetch replies to the replies as well as quotes. 
Get users on a list
Retrieve information on trending hashtags (optional is to give a [woeid](https://web.archive.org/web/20180102203025/https://developer.yahoo.com/geo/geoplanet/). A Where On Earth Identifier indicates the location. 1 returns the entire planet.)

Note queries of filter and search in the Twitter API slightly differ:

1. More information on query building for the **search command**: [twitter-advanced-search repository](https://github.com/igorbrigadir/twitter-advanced-search/blob/master/README.md) or the [Twitter search guide](https://developer.twitter.com/en/docs/labs/recent-search/guides/search-queries) Important to note is that there is a maximum number of operators which lies at 22 or 23.

2. More information on query building for the **filter command**: [Twitter filter guide](https://developer.twitter.com/en/docs/labs/filtered-stream/guides/search-queries). 

### Utils Library
The utils direcory has some command line utilities which kan work with line-oriented JSON. It allows harvested tweets to be printed out as text, html, extracint usernames, referenced URL's, you can create a word cloud of tweets, create a rudimentary wall, create a static D3 visualization,.. For more information check the [Twarc github repository](https://github.com/DocNow/twarc#utilities)

[Twarc-report](https://github.com/pbinkley/twarc-report) is a seperate Github repository with scripts which can generate csv or json output for the use of D3.js visualizations. It might be handy to visualize the harvested data.

### Twitter rate limiting
Twarc will manage rate limiting by Twitter. However, their rate limiting varies based on the way that you authenticate. The two options are User Auth and App Auth. Twarc defaults to using User Auth but you can tell it to use App Auth.

Switching to App Auth can be handy in some situations like when you are searching tweets, since User Auth can only issue 180 requests every 15 minutes (1.6 million tweets per day), but App Auth can issue 450 (4.3 million tweets per day).

Note: the statuses/lookup endpoint used by the hydrate subcommand has a rate limit of 900 requests per 15 minutes for User Auth, and 300 request per 15 minutes for App Auth.
```
$ twarc --app_auth search ferguson > tweets.jsonl
```

Using the Twarc library: 
```
from twarc import Twarc

t = Twarc(app_auth=True)
for tweet in t.search('coronabelgique'):
    print(tweet['id_str'])
```
## Monitoring a collection
This use case covers the monitoring of an existing collection, for example a collection about 
“#COVID-19” tweets which are harvested around the clock or a collection of specific accounts twice per day.

* Can the harvest of a collection be paused/resumed? No.
* Is it visible in the user interface how many errors occurred? There is no userinterface. However, in the directory where you will be running the commands, a twarc.log file is generated which logs every job you have done. Every fetch with the tweetid. Errors have not occurred during testing but would be found here.

Monitoring the harvesting is possible in the global twarc log file.

## Creating an account-based selection
This use case covers the collection of a list of social media accounts to archive, for example deMorgen, nieuwsblad and knack.

* Can you provide several social media accounts? 
You can get the metadata of several accounts. However timelines can only do one user at a time. Writing a bash script to read from a userlist and run the command on each one is however not a difficult task.
* How far back in time you can harvest the posts of a specific social media account?
You can go as far back as the Twitter API allows, which is within 7 days of posting. Interesting to note is the fact that when tweetids older than 7 days are given to hydrate it will be retrieved from Twitter even if they exceed that age. Timeline harvesting can however go up to 2 month old tweets.

## Creating a keyword-based selection
This use case covers the collection of social media posts related to a specific event or keyword, 
for example if you ask the Twitter API to return all tweets for a certain hashtag or search string.

1. Twitter search on hashtag coronabelgique market with language french 
twarc search '#coronabelgique' --lang fr > tweets.jsonl

2. Twitter search on hashtag corona with geocode of brussels within 10 miles radius.
```
twarc search '#corona' --geocode 50.85045,4.34878,10mi > tweets.jsonl
```
Geocode is constructed in the format latitude,longitude,[radius]mi. For the longitude and latitude we need the DD coordinates. Easy lookup can be done on the following site [latitude.to](https://latitude.to/map/be/belgium/cities/brussels). The radius is in miles.
When conducting geo searches, the search API will first attempt to find Tweets which have lat/long within the queried geocode, and in case of not having success, it will attempt to find Tweets created by users whose profile location can be reverse geocoded into a lat/long within the queried geocode, meaning that is possible to receive Tweets which do not include lat/long information.

3. Twitter filter (tweets as they happen) related. Query guide can be found [here](https://developer.twitter.com/en/docs/labs/filtered-stream/guides/search-queries).
```
# Which will look for tweets which match with grumpy, cat and #meme.
$ twarc filter "grumpy cat #meme" > tweets.jsonl
# Which will look for tweets which will match at least one of the words grumpy, cat or #meme.
$ twarc filter "grumpy OR cat OR #meme" > tweets.jsonl
# Which will look for tweets which match with cat and #meme but must not contain grumpy.
$ twarc filter "-grumpy cat #meme" > tweets.jsonl
```

4. Twitter filter with extra flags
```
# collect tweets from given user id (in this case "tijd") including retweets
$ twarc filter --follow 3147651 > tweets.jsonl
# location bound can be added. 
$ twarc filter --locations "\-74,40,-73,41" > tweets.jsonl
# adding language filters in the format ISO 639-1. French or Spanish tweets will be added to the search on the tweets which mention of Paris and Madrid.
$ twarc filter paris,madrid --lang fr --lang es
```
Note: the leading dash infront of the location needs to be escaped in the bounding box or else it will be interpreted as a command line argument!

5. Random sample of tweets
```
$ twarc sample > tweets.jsonl
```

6. Twitter search on a specific user : de tijd
```
$ twarc search 'from:tijd' > tijd.jsonl
```
7. Twitter timeline from user
```
$ twarc timeline tijd > tijd-timeline.jsonl
# or using the twitterid of tijd
$ twarc timeline 3147651 > tijd-timeline.jsonl
```
8. Retweets given a twitterid
```
$ twarc retweets 1330819261741342721 > tijdretweet.jsonl
# or when given list of twitterids in ids.txt
$ twarc retweets ids.txt > retweets.jsonl
```

9. Replies given a twitterid
```
$ twarc replies 1330819261741342721 > tijdreplies.jsonl
# optionally a recursive flag can be added
$ twarc replies 1330819261741342721 --recursive
```
Using the --recursive option will also fetch replies to the replies as well as quotes. This can take a long time to complete for a large thread because of rate limiting by the search API.

10. Get users on the list using an existing list URL
twarc listmembers https://twitter.com/edsu/lists/bots

Terminology : A List is a curated group of Twitter accounts. You can create your own Lists or follow Lists created by others. Viewing a List timeline will show you a stream of Tweets from only the accounts on that List. [Guide](https://help.twitter.com/en/using-twitter/twitter-lists#:~:text=A%20List%20is%20a%20curated,the%20accounts%20on%20that%20List.) on how to create lists, add/remove people, share and discover lists.

11. Trends with the [woeid (Where On Earth identifier)](https://web.archive.org/web/20180102203025/https://developer.yahoo.com/geo/geoplanet/) specifying trends around the globe (woeid 1 means the planet).
```
$ twarc trends 1
```

12. Trends in Belgium woeid of Belgium is 23424757
```
$ twarc trends 23424757
```
Note if you do not know the woeid, it is handy to use the following command to check the woeids. Here 
```
$ twarc trends
```

13. Check the friends and followers of a single account.
Multiple accounts are not possible. But if you write your own bash script which just reads in from a txt and feeds it to this command and save the output the a file name you wish I shouldn't be very difficult.
```
$ twarc friends tijd > friend_ids.txt
$ twarc followers tijd > friend_ids.txt
```

Script would look as follows. eg name of the file friends_users.sh
```
#!/bin/bash
while read p; do
  twarc followers "$p" > friends_ids_"$p".txt
done < users_list.txt
```

Give the bash a good execution permission and run it with 
```
$ chmod +x script.sh
$ ./friends_users.sh
```

14. Get metadata of several users
```
$ twarc users tijd,destandaard > users.jsonl
# or use their twitterids instead
$ twarc users 3147651,21408400 > friend_ids.txt
# or pass it the ids using a txt file
$ twarc users ids.txt > users.jsonl
```

15. Dehydrate tweets: extract tweetid from the jsonl file of tweets
```
$ twarc dehydrate tweets.jsonl > tweet-ids.txt
```
16. Hydrate tweets : get the tweets from the tweetid from the idfile
```
$ twarc hydrate ids.txt > tweets.jsonl
```
Important to note is that when you hydrate tweets it does not matter if they are older than one week, they can be fetched. Even if the user also would not be able to manually scroll such old data in the webbrowser.

## Error handling
There are all kinds of things which can go wrong, e.g. the internet connection might drop, the social media API might be not available or a rate limit for consuming the content might be reached. It is valuable metainformation for a collection to know when which kind of error happened, e.g. to assess if a day of social media posts is missing.

Error handling is done in the global twarc log file called twarc.log. In this file all the archived Twitter ids, timestamps and errors should be logged. During the research no errors have occurred thus no examples can be given. It would be useful to write a script which can remove the successful archiving messages to more clearly see what other messages (such as error messages) are present.

## Issues encountered
None

## Conclusion
Twarc is specifically made for Twitter and relies on the Twitter API. Thus it is subjected under the Twitter rate limitation. The tool is quite complete, it can do all that the Twitter API allows and has a easy to use command line. It does require the user to know how the search and filter query are build to use the Twitter API. The tool does not have a webinterface, but it would be possible to use the Twarc library to develop one. The tool offers many options. Dehydrating and hydrating tweets is useful to keep tweets longterm without the overhead of keeping all the tweets in your database. As you can only save the tweet ids and you can fetch them again later. It has the plain features which are available in many tools such as search and filter. However, some extra features are checking followers and metadata of users. Finally, a very important feature is that it allows to easily check replies and quotes which other tools might have difficulties with, as the Twitter API doesn't straight forwardly offer it. 

The log file makes sure you can track back issues that might have happened. However, it is not easy to search through. So the user might want to write a script to filter out the succesful archive messages, to clearly see the other messages.

The tool furthermore has scripts which can generate csv or json output for the use of D3.js visualizations which might be handy to visualize the harvested data, more helpers exists in the utils directory.
