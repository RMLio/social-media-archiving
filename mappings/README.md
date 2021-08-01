# RML-based Knowledge Graph generation

This folder contains mapping rules to generate an RDF Knowledge Graph.
Data is generated via YARRRML/RML and if necessary with additional SPARQL CONSTRUCT/INSERT queries after mapping.

## YARRRML mapping rules

* The file *collection-provenance.yml* contains mappings for meta information stored in the SFM PostgreSQL database.
* The file *json-twitter-warc-mapping.yml* contains mappings for Tweet objects (after fetching from Twitter this JSON need to be preprocessed such that each Tweet object contains a `warc-header` field, in our workflow done during the WARC extraction, see folder `message-queue-mapper`

## SPARQL construct


