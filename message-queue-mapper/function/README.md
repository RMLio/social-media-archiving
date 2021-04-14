# besocial-functions

Prerequisites:

- Maven (`sudo apt install maven`)
- `yarrrml-parser`

The `parse-yarrrml-example-mappings.sh` script will parse the YAML mappings in
each example in the `mappings-examples` directory.

The `run.sh`-script will execute the RML mapping provided as first argument.
More specfically, the following steps are executed:

- check the prerequisites
- build the BeSocialFunctions JAR, and move it to the current directory
- execute the mapping and output the results to std. out

Make sure to add execution permissions to both scripts.

```bash
chmod +x ./run.sh
chmod +x ./parse-yarrrml-example-mappings.sh
```

The RML Mapper needs the following function description files:

- `functions_besocial.ttl`
- `functions_grel.ttl`
- `functions_idlab.ttl`
- `grel_java_mapping.ttl`

## Examples

```
mapping-examples/
├── minimal
│   ├── mapping.ttl
│   └── mapping.yml
└── minimal-with-string-contains
    ├── mapping.ttl
    └── mapping.yml
```


- Example `minimal` illustrates the use of the `idlab-fn:dbpediaSpotlightWithConfidenceParameter` function.
- Example `minimal-with-string-contains` illustrates uses the `idlab-fn:dbpediaSpotlightWithConfidenceParameter` function as well as the `grel:string_contains` function.
