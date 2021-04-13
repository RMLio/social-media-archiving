# BESOCIAL - a sustainable workflow for social media archiving

Social media is already a paramount part of our society and, thus, its content needs to be preserved.
Because archiving is an expensive long-term commitment, deals with heterogeneous data
and currently there is no complete workflow for social media archiving,
we developed a Knowledge Graph-based workflow consisting of open source components.

**This repository contains resources and software related to this workflow.**
First we present a comparison of social media harvesters
where a summary is available in [this GoogleSpreadsheet](https://docs.google.com/spreadsheets/d/1nGuTC9Ww5yWZQ0wSUPPnIITMJBf1JyEaDOCO0Ve-O9U/edit#gid=0) under a CC BY 4.0 license.
Then we elaborate on the three major workflow components:
(i) the selection and collection of social media content via the Social Feed Manager (SFM),
(ii) the automatic and declaratively controlled Knowledege Graph generation, and
(iii) the creation of domain-specific metadata records via declarative Knowledge Graph queries and templates.


`The following workflow was developed for a social media archiving use case at KBR Royal Library of Belgium,
funded by the Belgian Federal Science Policy Office (BELSPO) BRAIN 2.0. [BESOCIAL](https://kbr.be/en/projects/besocial/).`


## Comparison of social media harvesting tools

Several social media harvesting tools exist,
we performed a comparison based on selected features to decide which tool we will reuse in our workflow.

We adapt a general web archiving framework of the [Data Together Initiative](https://github.com/datatogether/research/tree/master/web_archiving)
and add social media archiving specific columns.
A summary is available in [this GoogleSpreadsheet](https://docs.google.com/spreadsheets/d/1nGuTC9Ww5yWZQ0wSUPPnIITMJBf1JyEaDOCO0Ve-O9U/edit#gid=0) under a CC BY 4.0 license.

After an initial selection we tested several of the surveyed tools.
The folder `harvesting-tool-comparison` of this repository contains the documentation
we created during this testing activities.


We selected the [Social Feed Manager (SFM)](https://gwu-libraries.github.io/sfm-ui/),
based on its unique features combining machine-readable social media data with WARC-based preservation of technical metadata,
and because it is an extensible framework reusing existing social media harvesting tools.
Thus can also be used to harvest content from different social media providers,
and new components like our Knowledge Graph generation can be integrated.

## Social media harvesting

Compared to general websites, social media data comes from single providers and can be fetched via Application Programming Interfaces (APIs).

This step provides:

* Content selection
* Content collection

Based on the tool comparison above, we have chosen SFM to harvest social media because

* it supports several social media provider by reusing existing social media harvesters
* it is extensible with new harvesters or other components as it uses a central RabbitMQ message queue
* it preserves machine-readable social media data within uniform WARC files, preserving necessary provenance information
* it provides a user interface to describe collections, this data is available in a relational PostgreSQL database

## Knowledge Graph generation

Data related to social media archiving is heterogeneous and needs to be made interoperable for appropriate data stewardship:
harvesters produce content in JSON format, technical metadata is enclosed in WARC files,
and user-provided provenance information resides in databases.

This step provides:

* Knowledge Graph requirements and a data model
* Declarative Knowledge Graph generation rules
* Software to automatically generate a Knowledge Graph

**Knowledge Graph requirements and data model**

We provide requirements for our Knowledge Graph in the form of user stories
and competency questions, thus following common best practices.
These requirements are available in [this GoogleSpreadsheet](#).
Given our use case we decided to use the [Europeana Data Model (EDM)](https://pro.europeana.eu/page/edm-documentation), the *de-facto* standard for cultural heritage data.
Additionally we use the [PREMIS](https://www.loc.gov/standards/premis/ontology/owl-version3.html) ontology in version 3 concerning preservation of digital content,
which is able to describe collected and preserved WARC Files as well as the digital content they preserve.
For each competency question we provide one SPARQL query to validate that our model can answer the question.
Such a SPARQL query is a formal representation of the informal competency question, tied to a concrete model and therefore a concrete solution.

**Knowledge Graph generation rules**

The interoperable Knowledge Graph is generated using declarative reusable [RML](https://rml.io/specs/rml/) rules, thus no programming experience is needed.
We express these RML rules using the more human-friendly [YARRRML](https://rml.io/yarrrml/) syntax,
these rules are available in the `mappings` folder of this repository.
During the Knowledge Graph generation process an RML processor generates a Knowledge Graph based on the RML rules.

**Automatic Knowledge Graph generation**

We provide adapter software which integrates an RML processor into the SFM framework,
thus performing Knowledge Graph generation on the fly.
The documentation and configuration of this adapter software resides in the `message-queue-mapper` folder of this repository.
To this end, we use the [RMLMapper](https://github.com/RMLio/rmlmapper-java) which listens to the RabbitMQ message queue of the SFM framework.


## Metadata records generation

Although a Knowledge Graph-based data model enables semantic interoperability of data,
concrete preservation systems or stakeholders may demand data in a domain-specific syntax.

This step provides:

* Software to build an API on top of a Knowledge Graph providing domain-specific metadata records
* Queries to fetch data from the Knowledge Graph
* Templates to create domain-specific metadata records

**API to provide domain-specific metadata records**

We use the tool [Walder](https://github.com/KNowledgeOnWebScale/walder) to set up an API on top of our Knowledge Graph.
The configuration and related resources are available in the `metadata-records-api` folder of this repository.
This tool can be configured to read RDF files in different serializations, from SPARQL endpoints or triple stores.

**Knowledge Graph Queries**

With the tool Walder [GraphQL-LD](https://comunica.dev/docs/query/advanced/graphql_ld/) can be specified.
We provide queries as part of our configuration in the `metadata-records-api` directory.

**Metadata records Templates**

The tool Walder can use different HTML templating engines which we use to create XML-based metadata record templates.
These templates reside in the `metadata-records-api/views` folder of this repository.
We use the [Handlebars](https://handlebarsjs.com/) engine and created three templates:
one to view collections, one to export in EAD 2002 format and one in MARC XML format.
