# RML-based Knowledge Graph generation

This folder contains mapping rules to generate an RDF Knowledge Graph.
Data is generated via YARRRML/RML and if necessary with additional SPARQL CONSTRUCT/INSERT queries after mapping.

The order of mapping should be the following

* Generate initial RDF: YARRRML mappings
* Generate direct links (`dcterms:isPartOf`) between collections and tweets: `construct-item-collection-links.sparql`
* Generate direct links (`schema:mentions`) between tweets and recognized named entities: `construct-named-entities.sparql`

## YARRRML mapping rules

Several YARRRML files are used to initially generate RDF on collection and on item level.

### Collection level - meta information

Collection level data are collected from SFMs PostgreSQL database.
There is no notification mechanism with the RabbitMQ message queue which could trigger a mapping.
Therefore collection level mappings are executed frequently, e.g. daily.

**collection-metadata.yml**
This file contains mappings for collections according to the Europeana Data Model.

**collection-harvest-seeds.yml**
This file contains mappings for seeds, scheduled harvests and the usage of seeds by harvests mainly by using PROV-O.

### Collection level - versioning
Collections are created with the SFM UI by humans and are dynamic because in a specified schedule new social media content is harvested and added to the collection.
Additionally, users can also adapt collection information at any time and therefore versioning of collections is important.

As outlined in the data model, different versioning schemes are possible for which we describe possible mappings.
Possible versioning can be applied on a range from using the `ui_historicalcollection` table (containing every small change of a collection)
to only versioning when new seeds are added or existing seeds are removed.

**collection-versioning-seed-change.yml**
This file contains mappings for a versioning only when seeds or other meta information of collections are changed.
This potentially leads to fewer versions compared to other versioning schemes as not for every harvest a new version is created.
Versions are detected based on a rather complex SQL query.

**collection-versioning-harvest.yml**
This file contains mappings for a versioning based on harvests, i.e. when new content is added to a collection.


### Item level
* The file *json-twitter-warc-mapping.yml* contains mappings for Tweet objects (after fetching from Twitter this JSON need to be preprocessed such that each Tweet object contains a `warc-header` field, in our workflow done during the WARC extraction, see folder `message-queue-mapper`

## SPARQL construct


