
module.exports = {
  getCorrectRabbitMQWARCCreatedMessage: () => {
    return {"harvest": {"id": "1"}, "warc": {"path": "abc", "id": "w123"}, "collection_set": "cs123", "collection": "c123"};
  },

  getCorrectRabbitMQPublisherConfig: () => {
    return {"routingKey": "test-routing-key", "exchange": "test_exchange", "mappingFileLookup": {"twitter_user_timeline": "/path/mapping/file.ttl"}};
  },

  getIncorrectRabbitMQPublisherConfig: () => {
    return {"routingKey": "test-routing-key", "exchange": "test_exchange", "mappingFileLookup": {"randomKey": "/path/mapping/file.ttl"}};
  },

  getCorrectRabbitMQPublishMessage: () => {
    let generationMsg = {};
    generationMsg['id'] = "1";
    generationMsg['type'] = 'rml_mapping';
    generationMsg['input_path'] = "abc";
    generationMsg['output_path'] = '/sfm-kg-data/';
    generationMsg['input_type'] = 'application/warc';
    generationMsg['input_mapping'] = "/path/mapping/file.ttl";
    generationMsg['collection_set'] = "cs123";
    generationMsg['collection'] = "c123";
    generationMsg['warc'] = { 'id': "w123"}
    return generationMsg;
 
  }

}
