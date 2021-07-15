/**
 * author: Sven Lieber (sven.lieber@ugent.be)
 * Ghent University - imec - IDLab
 */

const chai = require('chai');
const sinon = require('sinon');
const assert = require('assert');
const RabbitMQPublisher = require('./lib/targets/rabbitmq');
const testUtils = require('./test/utils');
const winston = require('winston');

describe('RabbitMQ target', function() {
  this.timeout(5000);

  it('successful rml_mapping publishing', async () => {
    // GIVEN a mocked message queue channel
    const channelMock = {
      publish: sinon.spy()
    };

    // and GIVEN a mocked PostreSQL db connection
    const poolMock = {
      query: function(query, values){
        return { rows: [{"harvest_type": "twitter_user_timeline"}]};
      },
      end: function(){}
    };

    let publisherConfig = testUtils.getCorrectRabbitMQPublisherConfig();
    let warcCreatedMessage = testUtils.getCorrectRabbitMQWARCCreatedMessage();
    let correctPublishedMessage = testUtils.getCorrectRabbitMQPublishMessage();

    // WHEN sending a correct warc_created message
    const rabbitmqPublisher = new RabbitMQPublisher({"logger": winston.createLogger({silent: true}), ...publisherConfig}, channelMock, poolMock);
    await rabbitmqPublisher.sendData(warcCreatedMessage);

    // THEN the publish function should be called once
    sinon.assert.calledOnce(channelMock.publish);

    // THEN the publish function should be called correctly with values from the input and DB values
    sinon.assert.calledWith(channelMock.publish, "test_exchange", "test-routing-key", Buffer.from(JSON.stringify(correctPublishedMessage)));


  });

  it('error when DB lookup fails', async function() {
    // GIVEN a mocked message queue channel
    const channelMock = {
      publish: sinon.spy()
    };

    // and GIVEN a mocked PostreSQL db connection returning an error
    const poolMock = {
      query: function(query, values){
        throw "DB Exception";
      },
      end: function(){}
    };

    let publisherConfig = testUtils.getCorrectRabbitMQPublisherConfig();
    let warcCreatedMessage = testUtils.getCorrectRabbitMQWARCCreatedMessage();
    let correctPublishedMessage = testUtils.getCorrectRabbitMQPublishMessage();

    // WHEN sending a correct warc_created message
    const rabbitmqPublisher = new RabbitMQPublisher({"logger": winston.createLogger({silent: true}), ...publisherConfig}, channelMock, poolMock);
    rabbitmqPublisher.sendData(warcCreatedMessage);

    // THEN the publish function should never be called
    sinon.assert.notCalled(channelMock.publish);
  
  });

  it('error when mapping file lookup fails', function() {
    // GIVEN a mocked message queue channel
    const channelMock = {
      publish: sinon.spy()
    };

    // and GIVEN a mocked PostreSQL db connection
    const poolMock = {
      query: function(query, values){
        return { rows: [{"harvest_type": "twitter_user_timeline"}]};
      },
      end: function(){}
    };

    // and GIVEN an incorrect config where the mapping file lookup will fail
    let publisherConfig = testUtils.getIncorrectRabbitMQPublisherConfig();
    let warcCreatedMessage = testUtils.getCorrectRabbitMQWARCCreatedMessage();
    let correctPublishedMessage = testUtils.getCorrectRabbitMQPublishMessage();

    // WHEN sending a correct warc_created message
    const rabbitmqPublisher = new RabbitMQPublisher({"logger": winston.createLogger({silent: true}), ...publisherConfig}, channelMock, poolMock);
    rabbitmqPublisher.sendData(warcCreatedMessage);

    // THEN the publish function should never be called
    sinon.assert.notCalled(channelMock.publish);
 

  });

});
