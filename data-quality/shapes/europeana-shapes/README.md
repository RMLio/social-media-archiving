# Europeana Data Model Shapes

Several years ago Hugo Manguinhas from Europeana created SHACL shape constraints for the Europeana Data Model (EDM)
with the SHACL version available back then (https://github.com/hugomanguinhas/europeana_shapes).
However, the used SHACL version is *not* the one which eventually became recommended by W3C and thus these shapes cannot be used out of the box.

We use the SHACL constraints of [SHACL itself](https://www.w3.org/ns/shacl-shacl) to validate the previously generated shapes and adapt them to W3C recommended SHACL,
we use the SHACL processor [pySHACL](https://github.com/RDFLib/pySHACL).
In the following we described how we adapted the existing shapes to conform to SHACL-SHACL.

## Agent

* https://github.com/hugomanguinhas/europeana_shapes/blob/master/shapes-edm/src/main/resources/etc/edm/shapes/external/Agent.ttl
* **32 constraint violations**

To fix the violations we executed the following steps:

* We adapted the main shape to be of type `sh:NodeShape` instead of `sh:Shape`
* We replaced `sh:predicate` with `sh:path`
* We replaced `sh:scopeClass` with `sh:targetClass`
* We replaced `sh:constraint` with `sh:node` (except for "closure shapes" as `sh:closed` did not work this way, in that case we made the closure shape target the class instead of let it being invoked)

## Aggregation

* Source: https://github.com/hugomanguinhas/europeana_shapes/blob/master/shapes-edm/src/main/resources/etc/edm/shapes/external/Aggregation.ttl
* **33 constraint violations**


To fix the violations we executed the following steps:

* We replaced `sh:predicate` with `sh:path`
* Line 35: The aggregation shape is an instance of `sh:NodeShape` instead of `sh:Shape`
* Line 40: The term `sh:scopeClass` was changed to `sh:targetClass`
* Line 43,44: The terms `sh:constraint` were replaced with `sh:node` as they refer to other constraints (except for "closure shapes" as `sh:closed` did not work this way, in that case we made the closure shape target the class instead of let it being invoked)
* Line 89: The class for `<Aggregation#correlation>` was changed from `sh:Constraint` to `sh:Shape`
* Line 136: The term `sh:valueShape` was replaced with `sh:node`
* Line 316: The property shape `<Aggregation/edm_ugc#cardinality>` contained two minCounts, the larger value was adapted to `sh:maxCount`
* Line 48: It is linked to a `sh:PropertyShape` which does not exist. The line was uncommented for now

# Concept

* Source: https://github.com/hugomanguinhas/europeana_shapes/blob/master/shapes-edm/src/main/resources/etc/edm/shapes/external/Concept.ttl
* **13 constraint violations**

To fix the violations we executed the following steps:

* We adapted the main shape to be of type `sh:NodeShape` instead of `sh:Shape`
* We replaced `sh:predicate` with `sh:path`
* We replaced `sh:scopeClass` with `sh:targetClass`
* We replaced `sh:constraint` with `sh:node` (except for "closure shapes" as `sh:closed` did not work this way, in that case we made the closure shape target the class instead of let it being invoked)
* We changed the shape in line 200: instead of referring to an external shape (also defined using outdated SHACL), we added the following constraints after consulting the external shape `etp:TypedLiteralConstraint`
  * line 203: the value of `skos:notation` should be a literal
  * line 204: the datatype of `skos:notation` should either be an `xsd:string` or `xsd:langString`

# Place

* Source: https://github.com/hugomanguinhas/europeana_shapes/blob/master/shapes-edm/src/main/resources/etc/edm/shapes/external/Place.ttl
* **18 constraint violations**

To fix the violations we executed the following steps:

* We adapted the main shape to be of type `sh:NodeShape` instead of `sh:Shape`
* We replaced `sh:predicate` with `sh:path`
* We replaced `sh:scopeClass` with `sh:targetClass`
* We replaced `sh:constraint` with `sh:node` (except for "closure shapes" as `sh:closed` did not work this way, in that case we made the closure shape target the class instead of let it being invoked)

# ProvidedCHO

* Source: https://github.com/hugomanguinhas/europeana_shapes/blob/master/shapes-edm/src/main/resources/etc/edm/shapes/external/ProvidedCHO.ttl
* **34 constraint violations**

To fix the violations we executed the following steps:

* We adapted the main shape to be of type `sh:NodeShape` instead of `sh:Shape`
* We replaced `sh:predicate` with `sh:path`
* We replaced `sh:scopeClass` with `sh:targetClass`
* We replaced `sh:constraint` with `sh:node` (except for "closure shapes" as `sh:closed` did not work this way, in that case we made the closure shape target the class instead of let it being invoked)
* We changed the datatype of the construct in line 200 from `sh:Constraint` to `sh:Shape`

# TimeSpan

* Source: https://github.com/hugomanguinhas/europeana_shapes/blob/master/shapes-edm/src/main/resources/etc/edm/shapes/external/TimeSpan.ttl
* **13 constraint violations**

To fix the violations we executed the following steps:

* We adapted the main shape to be of type `sh:NodeShape` instead of `sh:Shape`
* We replaced `sh:predicate` with `sh:path`
* We replaced `sh:scopeClass` with `sh:targetClass`
* We replaced `sh:constraint` with `sh:node` (except for "closure shapes" as `sh:closed` did not work this way, in that case we made the closure shape target the class instead of let it being invoked)

# WebResource

* Source: https://github.com/hugomanguinhas/europeana_shapes/blob/master/shapes-edm/src/main/resources/etc/edm/shapes/external/WebResource.ttl
* **24 constraint violations**

To fix the violations we executed the following steps:

* We adapted the main shape to be of type `sh:NodeShape` instead of `sh:Shape`
* We replaced `sh:predicate` with `sh:path`
* We replaced `sh:scopeClass` with `sh:targetClass`
* We replaced `sh:constraint` with `sh:node` (except for "closure shapes" as `sh:closed` did not work this way, in that case we made the closure shape target the class instead of let it being invoked)
* We removed the `sh:minCount 0` in line 236 and modified the second `sh:minCount 1` in line 237 to `sh:maxCount 1` to be in line with the EDM Mapping guidelines for `edm:rights`
* We uncommented the 6 constraints (line 49,50,53-56) because they point to non existing shapes for dcterms properties
