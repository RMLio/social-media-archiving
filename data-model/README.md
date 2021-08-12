# Data model

This data model has the aim to enable data stewardship on harvested social media collections.
Therefore this model must represent information from both the collection and item level (social media posts)
to represent rich metadata in a standardized and interoperable way.
By using this data model to represent collection and item level information,
we create a Knowledge Graph.

In the following we first outline the high level goals and existing vocabularies we reuse,
and then elaborate on the main concepts related to the collection and item level
while also developing requirements in the form of user stories.

## Explanations

In this document we develop requirements in the form of user stories which are rendered the following:

> :smiley: *I am a user story from the perspective of an archive-user*

> :computer: *I am a user story from the perspective of a data steward*

Our data model is represented using the Resource Description Framework (RDF)
and for the different components of the model (and the data) we use the following namespaces.

```
# BESOCIAL data model (concepts and properties)
bsm: <http://w3id.org/besocial/ns/model#> .

# BESOCIAL data model shapes (constraints on the data)
bss: <http://w3id.org/besocial/ns/shapes#> .

# BESOCIAL data
bsd: <http://w3id.org/besocial/data/> .
```


## High level goals

Preservation of social media data roughly covers two areas of interest, (1) **cultural heritage**, and (2) **long-term preservation**.
We consider social media as cultural heritage which needs to be preserved.
The [Europeana portal](https://www.europeana.eu/en) and its Europeana Data Model (EDM) are the *de-facto* standard to represent cultural heritage objects.
Regarding *long-term preservation*, the Reference Model for an Open Archival Information System ([OAIS](http://www.oais.info/)) exists.
From a data model perspective, the [PREMIS](https://www.loc.gov/standards/premis/) data model from the Library of Congress
is "the international standard for metadata to support the preservation of digital objects and ensure their long-term usability".

Therefore our model should be interoperable with Europeana and PREMIS.

## Reused vocabularies
In general this data model makes use of the following *de facto* standard vocabularies in our context:

* **Europeana Data Model (EDM)**, the *de-facto* standard to represent cultural heritage objects
* **PREMIS**, developed by the Library of Congress to support long-term preservation of digital objects
* **PROV-O**, a W3C recommended vocabulary to represent provenance
* **SIOC**, a widely used vocabulary to represent social media content
* **Dublin Core**, a common standard to represent metadata
* **SHACL**, a W3C recommended vocabulary to define and validate constraints

## User stories and requirements

In the following we elaborate on our context and needed concepts.
While elaborating we incrementally add requirements in the form of **user stories**,
thus following common best practices.
A complete list of these user stories (and related Competency Questions) is available in [this live GoogleSpreadsheet](https://docs.google.com/spreadsheets/d/13D2Z-stDdWhul3CGI5UClhPlGJtkFMBhB_Mk3Tl7giQ/edit#gid=0). (Todo: add a static representation of these user stories and competency questions to the current repository for each release)

Following common ontology-engineering practices, we create competency questions for each user story related to the data model.
These questions are used to describe which questions our data model should be able to answer.
The folder `sparql-queries` contains formalized competency questions using the query language SPARQL.
Such SPARQL queries are formal representations of the informal competency question, tied to a concrete model and therefore *one possible* solution.

## Collection level

A social media collection is described by giving it for example a name, a description and a harvesting schedule which fetches the content based on collection-related *seeds*.
On collection level we represent collections created via the tool Social Feed Manager (SFM) or other tools,
and related provenance such as the version history of collection-related concepts.

### Collections
According to SFM, a collection is bound to a specific representation of social media content and a collection-set is a higher level grouping of collections.
Out of the box such a SFM collection cannot be represented in different representations.
However, Based on some initially harvested data in one representation,
users may harvest the same data in a different representation,
e.g. a broad JSON crawl may inform a smaller more qualitative HTML crawl.
It remains questionable if these possibly few HTML social media posts *represent* a different representation of *the whole* collection which would exist as JSON.

We anyway should represent a collection separately from its representations
even if we *only* ever have one representation,
such that we reach our high-level goals regarding interoperability with EDM and PREMIS.

> :smiley: *As an archive-user, I want to know how many and which collections exist, so I can understand which content is covered and if it is relevant to me.*

> :computer: *As a data steward, I want to represent a collection and its representation, so I stay interoperable with EDM and PREMIS.*

> :smiley: *As an archive-user, I want to know in which representations collection items are available, e.g. JSON or HTML, so I can assess if the content is relevant to me.*

**Our solution**

<details>
<summary>Following EDM and PREMIS we distinguish a collection by reusing three classes and create one class ourselves (click to read more)</summary>

* The conceptual *thing* using `edm:ProvidedCHO`, `premis:IntellectualEntity` and `prov:Entity`
* A representation of the conceptual thing using `edm:WebResource`, `premis:Representation` and `prov:Entity`
* An aggregation object linking a thing to its representations and the context we provide using `edm:Aggregation` and `prov:Entity`

For our purposes we have to add an own subclass for a collection.
*Collection* is a very generic term, `PROV-O` knows `prov:Collection` which is different as it describes a data structure;
the DCMI Metadata Terms of Dublin Core know `dcmitype:Collection` but it is already used as superclass of EDM aggregation, thus not enough to distinguish a collection in our context.

Therefore we introduce `bsm:SocialMediaCollection`, a subclass of `edm:ProvidedCHO`, `premis:IntellectualEntity` and `prov:Entity`
which can be used with the other reused classes in the following way.
Please note that according to the EDM mapping guidelines an instance of `edm:ProvidedCHO` should contain more properties as shown in the example, see next constraints section.

```turtle
#
# A social media collection "thing"
#
bsd:flemishNewspaperCollection
  a bsm:SocialMediaCollection ;
  dc:title "Flemish Newspapers"@en ;
  dc:description "A collection of tweets from Twitter accounts of several Flemish newspapers."@en ;
  prov:generatedAtTime "2020-10-26T10:15:00+02:00"^^xsd:dateTime .

#
# A JSON representation of this collection (its tweets are harvested in JSON format)
#
bsd:flemishNewspaperCollectionJSON
  a edm:WebResource, premis:Representation, prov:Entity ;
  dc:title "Flemish Newspapers (JSON)"@en ;
  dc:description "A collection of tweets from Twitter accounts of several Flemish newspapers in JSON format."@en ;
  dcterms:format "application/json" ;
  ebucore:hasMimeType, "application/json" ;
  relSubType:rep bsd:flemishNewspaperCollection .

#
# An aggregation to group the collection with its representations
#
bsd:flemishNewspaperCollectionAggregation
  a edm:Aggregation, prov:Entity ;
  dc:title "Flemish Newspapers Aggregation"@en ;
  dc:description "Resources related to a collection of tweets from Twitter accounts of several Flemish newspapers."@en ;
  edm:aggregatedCHO bsd:flemishNewspaperCollection ;
  edm:hasView bsd:flemishNewspaperCollectionJSON .

```

</details>

**Constraints related to our solution**

<details>
<summary>Following the EDM mapping guidelines each `edm:ProvidedCHO` should have several properties (click to read more)</summary>

Example of EDM constraints for the class `edm:ProvidedCHO` expressed using SHACL.

```turtle

bss:providedCHOMinimum a sh:NodeShape
  rdfs:label "ProvidedCHO minimum"@en ;
  rdfs:comment "Properties needed according to the EDM mapping guidelines"@en ;
  sh:property [
    sh:path dc:language ;
    sh:minCount 1 ;
  ] ;
  sh:property [
    sh:path edm:type ;
    sh:minCount 1 ;
  ] ;
  sh:property [
    sh:path edm:aggregatedCHO ;
    sh:minCount 1 ;
  ] ;
  sh:property [
    sh:path edm:dataProvider;
    sh:minCount 1 ;
  ] ;
  sh:property [
    sh:path edm:provider ;
    sh:minCount 1 ;
  ] ;
  sh:property [
    sh:path edm:rights ;
    sh:minCount 1 ;
  ] ;
  sh:or (
    [ sh:path dc:description ; sh:minCount 1 ; ]
    [ sh:path dc:title ; sh:minCount 1 ; ]
  ) ;
  sh:or (
    [ sh:path dc:subject ; sh:minCount 1 ; ]
    [ sh:path dc:type ; sh:minCount 1; ]
    [ sh:path dcterms:spatial ; sh:minCount 1; ]
    [ sh:path dcterms:temporal ; sh:minCount 1 ; ]
  ) ;
  sh:or (
    [ sh:path edm:isShownAt ; sh:minCount 1 ; ]
    [ sh:path edm:isShownBy ; sh:minCount 1 ; ]
  )
```

</details>



### Seeds
Seeds describe a unit of the content which should be harvested and are dependent on the content.
For example, when harvesting social media posts from specific users the seeds are user accounts,
and when harvesting social media posts based on search queries a seed is a query.

With the SFM tool, seeds can be created with the user interface and are stored within a PostgreSQL database.
For account-based seeds, there might be a user name which changes and additionally a (social media provider-internal) identifier.
Account-based seeds can be added to SFM by providing the user name (e.g. twitter handle).
Successfully executed harvests update the PostgreSQL record of the seed by providing the account identifier to further enrich the user name (which is subject to change).
If the user name changed and the harvester is notified by this, e.g. during Twitter harvests, SFM updates the seed with the new user name.
Thus over time, the seed history also reflects changes.
This might be valuable information, e.g. in 2021 the Belgian social democratic party *sp.a* was rebranded to *vooruit* which was also reflected in the user names of their social media accounts.

> :computer: *As a data steward, I want to know the version history of a seed, so I can assess its provenance.*

**Our solution**

<details>
<summary>We use PROV-O to represent seeds and their versions which are used by harvests. (click to read more)</summary>

Following `PROV-O`, we represent a seed as an instance of `prov:Entity` and different versions also as `prov:Entity` but linking via `prov:specializationOf` to their representation across versions.

Example:

```turtle
# A seed representing a user account (the identifier might be set with the unique user ID provided by the social media API)
bsd:seedObject_123
  a prov:Entity ;
  dc:title "Seed 123" ;
  rdf:value "username111" ;
  dcterms:identifier "u111" ;
  dc:description "This seed is a twitter user with the initial value 'username111'. This name may change, pelase consider specific versions of this entity." .

# A seed for a search query
bsd:seedObject_456
  a prov:Entity ;
  dc:title "Seed 456" ;
  rdf:value "#hashtag1 OR #hashtag2" ;
  dc:description "This seed is a search query with the initial value '#hashtag1 OR #hashtag2'. This query may change, plase consider specific versions of this entity." .

# An example seed version of seed_123 (similarly there will be a version for seedObject_456)
bsd:seedVersion_123_1
  a prov:Entity ;
  dc:title "Seed Version 123_1"@en ;
  prov:specializationOf bsd:seedObject_123 ;
  prov:generatedAtTime "..."^^xsd:dateTime ;
  rdf:value "username111" ;
  dcterms:identifier "u111" ;
  dc:description "This seed is a twitter user with the value 'username111'." .
```

</details>

### Harvests
Harvests are scheduled and fetch social media posts based on provided seeds.
With the SFM tool, harvests can be scheduled *daily*, *weekly* or even every few hours.
Therefore such a harvesting schedule results in periodical harvests extending the collection with new content and thus possibly representing a new version of a collection.
This also takes changed collection metadata into account, for instance when the seeds of a collection are changed at any time via the SFM UI, the next harvest will take the updated seeds into account.

> :computer: *As a data steward, I want to know the version history of a collection, so I can assess its provenance.*

> :computer: *As a data steward, I want to know which seeds versions were used by a scheduled harvest, so I can assess its provenance.*

> :computer: *As a data steward, I want to know which seeds contributed in which time period to a collection version, so I an assess the collection's provenance.*

> :computer: *As a data steward, I want to know which harvests succeeded, failed, or were skipped, so I can gain insights in the system's behavior.*

> :computer: *As a data steward, I want to know which harvests concerned which type of social media, e.g. twitter search, twitter user timeline or flickr search, so I can filter a search.*

*Harvests* result in one or more *WARC* files, thus these files are part of a collection representation and versions.
For example, the three harvests `h1`, `h2` and `h3` represent the versions `v1`, `v2` and `v3` of collection `c1`.
The harvests result in the three WARC files `w1`, `w2` and `w3`.
In this case `w1` is part of `v1`, `v2` and `v3`; `w2` is part of `v1` and `v2`; and `w3` is part of `v3`.
Additionally all these WARC Files are part of `c1` representing the collection across versions.

> :computer: *As a data steward, I want to know which harvested files belong to which scheduled harvest, so I can assess its provenance in the context of a collection..*

> :computer: *As a data steward, I want to know which harvested files belong to which collection and collection version, so I can assess its provenance in the context of a collection.*

**Our solution**
<details>
<summary>We represent harvests as PROV-O activities which use a PROV-O collection of seed versions and produce one or more PROV-O entities and PREMIS files representing WARC files. (click to read more)</summary>

Following `PROV-O`, we represent harvests as instances of  a `prov:Activity` subclass which generate one or more WARC files (`ex:warc prov:wasGeneratedBy ex:harvest`)
by using one or more seeds organized as an instance of `prov:Collection`.

For each `harvest_type` we created a subclass of `prov:Activity`, e.g. `bsm:TwitterTimelineHarvest`.
Additionally, the status of a harvest can be retrieved via the property `schema:eventStatus` which can take one of several values,
e.g. `bsm:harvestSuccessful` which is an instance of `schema:EventStatusType`.

We currently map the following harvest statuses: successful, failed, skipped and voided.
We do not map the statuses requested, running and stop requested as we consider harvests to be finished, skipped or voided.
For example, in a daily insert harvest metadata are updated, usually requested or running harvests are at some point either finished, skipped or voided.

Each harvest produces new content which may justify also a new version of a collection.
Despite which versioning scheme is used, new versions of a collection are instances of `prov:Entity`
which refer via the property `prov:specializationOf` to the entity representing the collection across versions.

We apply the versioning on the *representation* because harvests are bound to a specific representation,
i.e. another representation of the collection (e.g. HTML instead of JSON) may be harvested only once per week and results in a different versioning scheme.

The links from WARC files to the collections they belong to (as exemplified above) is represented using `dcterms:partOf`.

Daily harvests may result in a large number of versions,
thus versions are not numbered using ascending integers but dates, e.g. `2020100416` for a new version of the collection as of the 4th of October 2020 at 4pm (since harvests could be scheduled every few hours).

> **_NOTE:_** one may decide *not* to represent each harvest as new version explicitly, for example for daily harvests spanning multiple years. Other versioning schemes may be applied, for example only when seeds for a collection change.

Example:

```turtle
bsd:harvestSeeds_123
  a prov:Collection ;
  dc:title "Input seeds for harvest 123"@en ;
  prov:hadMember bsd:seedVersion_123_1 ;
  prov:hadMember bsd:seedVersion_456_1 ;
  prov:hadMember bas:seedVersion_789_3 .

bsd:harvest_123
  a bsm:TwitterTimelineHarvest ;
  dc:title "Harvest 123"@en ;
  dc:description "A twitter_user_timeline harvest with status success for collection 123"@en ;
  schema:eventStatus bsm:harvestSuccessful ;
  prov:used bsd:harvestSeeds_123 ;
  prov:startedAtTime "..."^^xsd:dateTime ;
  prov:endedAtTime "..."^^xsd:dateTime .

bsd:warcJSON_123 ;
  a prov:Entity, premis:File ;
  dc:title "WARC 123"@en ;
  dc:description "The WARC file 123 of size 4 MB generated by harvest 123 at 2020-04-04T16:00:00"@en ;
  dcterms:identifier "123456" ;
  schema:encodingFormat "application/warc" ;
  schema:fileSize "4 MB" ;
  premis:fixity bsd:warcJSONFixity_123 ;
  premis:originalName "/path/to/warc/file.warc.gz" ;
  dcterms:format "application/warc" ;
  ebucore:hasMimeType "application/warc" ;
  dcterms:isPartOf bsd:collectionVersionJSON_123 ;
  prov:wasGeneratedBy bsd:harvest123 .

bsd:warcJSONFixity_123
  a premis:Fixity ;
  dc:title "WARC Fixity 123"@en ;
  rdf:value "345a342622646d4262a" ;
  dc:description "The fixity of WARC file 123: '345a342622646d4262a'"@en .
```

</details>


## Item level

On item level we represent social media posts and related provenance.
Social media posts are usually defined by a unique ID,
and additionally we may harvest a social media post in different representations.
For example, in an SFM `twitter_user_timeline` collection we harvest tweets in JSON format,
but in an hypothetical SFM `webrecorder_user_timeline` collection we harvest the same tweets in HTML format.

Because a social media post is identified by a unique ID and conceptually represents
different representations, we can use the EDM and PREMIS model to represent item level social media posts.

