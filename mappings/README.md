# RML-based Knowledge Graph generation

This folder contains the requirements of the data model and YARRRML mapping rules to generate an RDF Knowledge Graph.


**How to execute the mappings?**

```bash
todo command
```

## Requirements and data model
We provide requirements for our Knowledge Graph in the form of user stories
and competency questions, thus following common best practices.
A live version of these requirements is available in [this GoogleSpreadsheet](#).

The folder `sparql-queries` contains formalized competency questions using the query language SPARQL.

Given our use case we decided to use the [Europeana Data Model (EDM)](https://pro.europeana.eu/page/edm-documentation), the *de-facto* standard for cultural heritage data.
Additionally we use the [PREMIS](https://www.loc.gov/standards/premis/ontology/owl-version3.html) ontology in version 3 concerning preservation of digital content,
which is able to describe collected and preserved WARC Files as well as the digital content they preserve.
For each competency question we provide one SPARQL query to validate that our model can answer the question.
Such a SPARQL query is a formal representation of the informal competency question, tied to a concrete model and therefore a concrete solution.

todo: insert image


## YARRRML mapping rules

* The file *collection-provenance.yml* contains mappings for meta information stored in the SFM PostgreSQL database.
* The file *json-twitter-warc-mapping.yml* contains mappings for Tweet objects (after fetching from Twitter this JSON need to be preprocessed such that each Tweet object contains a `warc-header` field, in our workflow done during the WARC extraction, see folder `message-queue-mapper`
