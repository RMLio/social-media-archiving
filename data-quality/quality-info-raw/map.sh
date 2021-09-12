#!/usr/bin/env bash

#
# author: Sven Lieber
# Ghent University - imec - IDLab
#

RML_MAPPER="../../mappings/rmlmapper.jar"
YARRRML_PARSER_DIR="../../mappings/yarrrml-parser"

downloadYARRRML(){
  if [ ! -d $YARRRML_PARSER_DIR ];
  then
    echo "YARRRML not found, cloning it from GitHub"
    git clone --branch feature/env-variables https://github.com/SvenLieber/yarrrml-parser.git $YARRRML_PARSER_DIR
    cd $YARRRML_PARSER_DIR
    npm i
    cd - 
  fi
}

downloadRML(){
  if [ ! -f $RML_MAPPER ];
  then
    echo "RMLMapper not found, downloading jar from GitHub"
    curl -L https://github.com/RMLio/rmlmapper-java/releases/download/v4.11.0/rmlmapper.jar > $RML_MAPPER
  fi
}

parseYARRRML(){
  local yarrrml_file=$1
  local output_file=$2
  $YARRRML_PARSER_DIR/bin/parser.js -i $yarrrml_file -o $output_file
}

map(){
  local rml_file=$1
  local output_file=$2
  echo "mapping '$rml_file' and store output in '$output_file'"
  time java \
    -jar $RML_MAPPER \
    -s turtle \
    -m $rml_file > $output_file
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
map $rmlFilename $outputFilename

exit 0
