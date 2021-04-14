# !/bin/bash

function checkPreRequisites() {
    if [ -z $(which yarrrml-parser) ]; then
        echo "yarrrml-parser NOT INSTALLED."
        exit;
    fi;
}


################################################################################
# checkPreRequisites
checkPreRequisites

################################################################################
# Parse YARRRML mapping to TTL

DIR_EXAMPLES="mapping-examples"
EXAMPLE_DIRECTORIES=$(ls $DIR_EXAMPLES)
echo "example dirs: " $EXAMPLE_DIRS

for d in $EXAMPLE_DIRECTORIES; do
    FPATH_MAPPING_YAML="$DIR_EXAMPLES/$d/mapping.yml"
    FPATH_MAPPING_TTL="$DIR_EXAMPLES/$d/mapping.ttl"
    
    yarrrml-parser \
        -i $FPATH_MAPPING_YAML  \
        -o $FPATH_MAPPING_TTL   


done;
