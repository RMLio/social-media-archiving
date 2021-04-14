# Message queue-based Knowledge Graph generation

We provide adapter software which integrates an RML processor into the SFM framework,
thus performing Knowledge Graph generation on the fly.
To this end, we use the [RMLMapper](https://github.com/RMLio/rmlmapper-java) (java) via a javascript [wrapper](https://github.com/RMLio/rmlmapper-java-wrapper-js/tree/feature/functions).

This adapter listens to a RabbitMQ message queue and waits for mapping requests.

