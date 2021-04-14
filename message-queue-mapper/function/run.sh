# !/bin/bash

# Filename of the RMLMapper JAR
FPATH_RMLMAPPER_JAR="rmlmapper.jar"
FPATH_RML_MAPPING=$1


function checkPreRequisites() {
    
    # Check existence of RMLMapper JAR
    if [ ! -f $FPATH_RMLMAPPER_JAR ]; then
        echo "RMLMAPPER JAR NOT FOUND."
        exit;
    fi;

    if [ -z $(which yarrrml-parser) ]; then
        echo "yarrrml-parser NOT INSTALLED."
        exit;
    fi;

    if [ -z $(which mvn) ]; then
        echo "Maven NOT INSTALLED."
        exit;
    fi;
}



################################################################################
# checkPreRequisites
checkPreRequisites

################################################################################
# Build the BeSocialFunctions JAR
mvn package
# Move the BeSocialFunctions JAR to current directory
mv target/besocial-functions-1.0-SNAPSHOT.jar .

################################################################################
# Execute mapping

echo "Executing mapping: $FPATH_RML_MAPPING"
echo ""
java \
    -jar $FPATH_RMLMAPPER_JAR \
    -m $FPATH_RML_MAPPING \
    -f "functions_besocial.ttl" \
    -f "functions_grel.ttl" \
    -f "functions_idlab.ttl" \
    -f "grel_java_mapping.ttl"