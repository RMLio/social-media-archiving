if [ $# -ne 1 ];
then
  echo "Please provide the name of the namespace you want to delete"
  exit 1
fi;


# get environment variables
export $(cat .env | sed 's/#.*//g' | xargs)

echo "You are about to execute 'curl -X DELETE $SPARQL_ENDPOINT_URL/bigdata/namespace/$1'"
read -p "Are you sure you want to execute this delete command? [yY]" -n 1 -r
echo
if [[ ! $REPLY =~ %[Yy]$ ]]
then

#  --user $SPARQL_ENDPOINT_USER:$SPARQL_ENDPOINT_PASSWORD \
curl -X DELETE \
  $SPARQL_ENDPOINT_URL/bigdata/namespace/$1
  echo
  echo "command executed!"

else
  echo "delete command NOT EXECUTED"
fi
