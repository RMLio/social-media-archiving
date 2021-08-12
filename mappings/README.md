# RML-based Knowledge Graph generation

This folder contains mapping rules to generate an RDF Knowledge Graph.
Data is generated via YARRRML/RML and if necessary with additional SPARQL CONSTRUCT/INSERT queries after mapping.

The order of mapping should be the following

* Generate initial RDF: YARRRML mappings
* Generate direct links (`dcterms:isPartOf`) between collections and tweets: `construct-item-collection-links.sparql`
* Generate direct links (`schema:mentions`) between tweets and recognized named entities: `construct-named-entities.sparql`

## YARRRML mapping - collection level

Collection level data are collected from SFMs PostgreSQL database.
There is no notification mechanism with the RabbitMQ message queue which could trigger a mapping.
Therefore collection level mappings are executed frequently, e.g. daily.

**collection-metadata.yml**
This file contains mappings for collections according to the Europeana Data Model.

**collection-harvest-seeds.yml**
This file contains mappings for seeds, scheduled harvests and the usage of seeds by harvests mainly by using PROV-O.

## YARRRML mapping - collection level - versioning
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


## YARRRML mapping - item level

Item level data are collected from WARC files containing tweets in JSON format.
The RDF generation is informed by a notification mechanism via RabbitMQ every time a new WARC file is created (a harvested finished successfully).
WARC files containing JSON content are preprocessed by our `mapping-queue-mapper` (see other folder) and then mapped via YARRRML/RML.

**json-twitter-warc-mapping.yml**
This file contains mappings for Tweet objects (after fetching from Twitter this JSON need to be preprocessed such that each Tweet object contains a `warc-header` field).
These mappings use the Europeana Data Model, PROV-O, sioc and schema.org to describe tweets (see data model).

## SPARQL construct

Some RDF triples are aggregations of existing RDF and thus need to be generated in a step seperate from the initial YARRRML/RML mapping.

**construct-item-collection-links.sparql**
The SPARQL query in this file creates direct links from collections to social media posts.
This makes subsequent queries easier as they do not have to traverse large parts of the graph.

**construct-named-entities.sparql**
The SPARQL query in this file creates direct links from social media posts to recognized named entities mentioned in the post.

