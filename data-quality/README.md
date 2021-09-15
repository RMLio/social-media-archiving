# Data Quality

This folder contains resources for a declarative data quality assessment of social media archives.

Functionality on top of our Knowledge Graph poses several requirements for data quality which we have to define, measure and assess:
content queried from the Knowledge Graph, on the one hand our dashboard to browse collections and on the other hand different XML-based metadata records.
We defined the following concepts in CSV files and mapped them via RML to instances of related classes of the DQV vocabulary.

We define four **data quality categories** regarding needed functionality: structural integrity, UI dashboard, MARC export, and EAD export.
Each of these categories is defined in `quality-info-raw/quality-categories.csv` and mapped via RML to instances of `dqv:Category`.

From BESOCIAL **user stories** we derive quality-related **requirements** (`quality-info-raw/quality-requirements.csv`)
which we relate to abstract **quality dimensions** measured by concrete **quality metrics**. Dimensions refer to categories.


We define W3C SHACL shapes to define quality metric-related **constraints**, thus these shapes can be used in a SHACL validation process to **measure** quality metrics for given data.
Querying a SHACL validation report using SPARQL enables us to link quality dimensions with measured metrics and thus to compute quality scores.


## Example

The description of a collection should be meaningful and thus should have at least 200 characters.

* This belongs to the dimension `bsq:dimension_1`, a "Rich collection description", belonging to the category `bsq:category_2`, "UI dashboard".
* It is measured by the SHACL shape `bss:collectionRichDescriptionShape` and specifically by the property shape `bss:richDescription` which defines a `sh:minLength` constraint
* For a quality assessment of all collections we define the metric `bsq:metric_6`, the "number of insufficient descriptions"
* For a quality assessment of particular collections we define the metric `bsq:metric_5`, the "collection description min length" 

```
#
# Quality information of the example
#
bsq:category_2 a dqv:Category ;
  skos:prefLabel "UI Dashboard"@en .

bsq:dimension_1 a dqv:Dimension ;
  skos:prefLabel "Rich collection description"@en ;
  dqv:inCategory bsq:category_2 .

bsq:metric_5 a dqv:Metric ;
  skos:prefLabel "Collection description min length" ;
  dqv:inDimension bsq:dimension_1 ;
  dqv:expectedDataType xsd:boolean .

bsq:metric_6 a dqv:Metric ;
  skos:prefLabel "Number of insufficient descriptions"@en ;
  dqv:inDimension bsq:dimension-1 ;
  dqv:expectedDataType xsd:boolean .


#
# The shape to validate all collections (other properties not relevant for the example are not shown)
#
bss:collectionRichDescriptionShape a sh:NodeShape ;
  rdfs:label "collectionRichDescriptionShape"@en ;
  sh:targetClass bsm:SocialMediaCollectionRepresentation ;
  sh:property bss:richDescription .

#
# The property shape which, if not valid, will be shown in the SHACL validation report
#
bss:richDescription a sh:PropertyShape ;
  rdfs:label "richDescription"@en ;
  sh:path dc:description ;
  sh:minLength 200 .
```

The shape to obtain validation information is linked to quality metrics via W3C Web Annotations,
therefore different SPARQL queries, depending on what should be assessed, can compute metric measurements accordingly.

```
bsq:annotation_1337 a oa:Annotation ;
  oa:motivatedBy bsq:singleCollectionAssessment ;
  oa:hasBody bss:richDescription ;
  oa:hasTarget bsq:metrics_5 .

bsq:annotation_4711 a oa:Annotation ;
  oa:motivatedBy bsq:collectionsAssessment ;
  oa:hasBody bss:richDescription ;
  oa:hasTarget bsq:metrics_6 .
```

For example, if we want to assess quality metrics across all our collections,
our motivation in fact is `bsq:collectionAssessment` which comprises metrics such as `bsq:metrics_6` which measure integer values.
The following SPARQL query performs the quality metric measurements for this case.

```sparql
CONSTRUCT{

  ?measurement a dqv:QualityMeasurement ;
    dqv:isMeasurementOf ?qualityMetric ;
    dqv:value ?numberViolations .
}
WHERE {

  BIND (URI(concat("http://w3id.org/besocial/data/qualityMeasurement_", STRUUID())) as ?measurement)

  {
    SELECT ?qualityMetric (COUNT(?violationResult) AS ?numberViolations)
    WHERE {
      ?violationResult a sh:ValidationResult ;
        sh:sourceShape ?violatedShape ;
        sh:focusNode ?focusNode .

      ?annot a oa:Annotation ;
        oa:motivatedBy bsq:collectionAssessment ;
        oa:hasBody ?violatedShape ;
        oa:hasTarget ?qualityMetric .
    } GROUP BY ?qualityMetric
  }
}
```

