#!/usr/bin/env bash

#
# author: Sven Lieber
# Ghent University - imec - IDLab
#

RML_MAPPER="rmlmapper.jar"

downloadYARRRML(){
  local yarrrml_dir="yarrrml-parser"
  if [ ! -d $yarrrml_dir ];
  then
    git clone --branch feature/env-variables https://github.com/SvenLieber/yarrrml-parser.git $yarrrml_dir
    cd $yarrrml_dir
    npm i
    cd - 
  fi
}

downloadRML(){
  if [ ! -f rmlmapper.jar ];
  then
    curl -L https://github.com/RMLio/rmlmapper-java/releases/download/v4.11.0/rmlmapper.jar > $RML_MAPPER
  fi
}

parseYARRRML(){
  local yarrrml_file=$1
  local output_file=$2
  ./yarrrml-parser/bin/parser.js -i $yarrrml_file -o $output_file
}

map(){
  local rml_file=$1
  local output_file=$2
  echo "mapping '$rml_file' and store output in '$output_file'"
  time java \
    -jar $RML_MAPPER \
    -f function/grel_java_mapping.ttl \
    -f function/functions_idlab.ttl \
    -f function/functions_grel.ttl \
    -f function/functions_besocial.ttl \
    -s turtle \
    -m $rml_file > $output_file
}

applyFix(){
  local rml_file=$1
  local output_file=$2
  echo "fixing '$rml_file' and store fix in '$output_file'"
  python workaround-yarrrml-issue-124.py -i $rml_file -o $output_file

  # rdflib does not generate a prefix declaration for 'rdf', thus adding it manually
  sed -i '1s/^/@prefix rdf: <http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#>.\n/' $output_file
}

if [ $# -ne 2 ];
then
  echo "Please provide a valid yarrrml file (.yml) and the name of the mapped turtle output"
  exit 1
fi

inputFile=$1
outputFilename=$2
inputBasename=$(basename $inputFile .yml)
rmlFilename="$inputBasename""-rml.ttl"
fixFilename="$inputBasename""-rml-fixed.ttl"

echo "Creating $outputFilename by transforming $inputFile to $rmlFilename and executing it with $RML_MAPPER"

downloadYARRRML
downloadRML
parseYARRRML $inputFile $rmlFilename
applyFix $rmlFilename $fixFilename
map $fixFilename $outputFilename

exit 0
