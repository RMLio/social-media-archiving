# Message queue-based Knowledge Graph generation

We provide adapter software which integrates an RML processor into the SFM framework,
thus performing Knowledge Graph generation on the fly.
To this end, we use the [RMLMapper](https://github.com/RMLio/rmlmapper-java) (java) via a javascript [wrapper](https://github.com/RMLio/rmlmapper-java-wrapper-js/tree/feature/functions).

This adapter listens to a RabbitMQ message queue and waits for mapping requests.

## Functions

As part of the Knowledge Graph generation, functions are called.
Most functions are provided by the RMLMapper out of the box, but we additionally provide
the custom function `dbpediaSpotlightWithConfidenceParameter`.
The implementation of this function is provided in the `function` directory.

We provide the declarative function description of this funtion in the file `functions_besocial.ttl`.
Since we provide a function with the `-f` command line flag to the RMLMapper, out of the box functions are no longer recognized,
thus we also provide `functions_grel.ttl` and `functions_idlab.ttl`.

## Lift existing data to a Knowledge Graph

Our solution gets triggered with every new "WARC file created" event,
but in certain situations the Knowledge Graph generation should be triggered manually.

One such case is the mapping of already existing WARC files.
We provide the script `bulk-mapping.js` which queries the SFM database for existing WARC files
generates *mapping request* messages and send it to our adapter software.
