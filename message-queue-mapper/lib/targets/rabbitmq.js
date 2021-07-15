/*
 * (c) 2021 Dylan Van Assche
 * (c) 2021 Sven Lieber
 * IDLab Ghent - Ghent University - IMEC
 */
const amqp = require('amqplib/callback_api');
const Pool = require('pg').Pool;

const defaultOptions = {
  exchange: 'the-transporter',
  routingKey: 'message'
}

/**
 * This class creates a RabbitMQPublisher target.
 */
class RabbitMQPublisher {

  /**
   * This constructor creates an instance of an RabbitMQPublisher target with the given options.
   * @param options An object of options.
   * @param {string} options.url URL to access the RabbitMQ instance.
   * @param {string} options.exchange The RabbitMQ exchange name. Default 'the-transporter'
   * @param {string} options.routingKey The RabbitMQ routing key for the exchange. Default 'message'
   * @param {Object} mqChannel An initialized RabbitMQ channel (injected dependency)
   * @param {Object} pool An initialized PostgreSQL connection (injected dependency)
   */
  constructor(options = {}, mqChannel, pool) {
    this.logger = options.logger;
    this.options = {...defaultOptions, ...options};

    this.channel = mqChannel;
    this.pool = pool;
  }

  async _lookupContentInWARCMetadata(warcID){
    // default: twitter user_timeline
    try{
      const result = await this.pool.query(
        'SELECT h.harvest_type FROM ui_warc w JOIN ui_harvest h ON w.harvest_id=h.id WHERE w.warc_id=$1',
        [warcID]
      );

      let contentType = result.rows[0]['harvest_type'];
      this.pool.end();
      return contentType;

    } catch (err) {
      this.logger.error("Could not fetch social media content type for warc '" + warcID + "'");
      this.logger.error("Using the default '" + contentType + "'");
      this.logger.error(err);
      this.pool.end();
      throw "LookupSocialMediaTypeInWARC";
    }
  }

  _lookupMappingFilePath(socialMediaType){
    let lookupObject = this.options.mappingFileLookup;
 
    if(socialMediaType in lookupObject){
      return lookupObject[socialMediaType];
    } else {
      this.logger.error("Could not find a mapping file for'" + socialMediaType + "' in the provided config");
      throw "LookupMappingFileInConfig";
    }
  }

  /**
   * This method receives a warc_created message, does some PostgreSQL lookups and emits a new rml_mapping message on the message queue.
   * @param data The data received through the warc_created message
   * @returns {Promise<void>}
   */
  async sendData(data){
    let generationMsg = {};

    try{
     // lookup which social media content is supposed to be in the WARC, e.g. twitter_search
      let socialMediaType = await this._lookupContentInWARCMetadata(data['warc']['id']);

      // lookup which RML mapping should be used based on the social media type in the WARC
      let mappingFilePath = this._lookupMappingFilePath(socialMediaType);
    
      // prepare rml_mapping message which should be emitted
      generationMsg['id'] = data['harvest']['id'];
      generationMsg['type'] = 'rml_mapping';
      generationMsg['input_path'] = data['warc']['path'];
      generationMsg['output_path'] = '/sfm-kg-data/';
      generationMsg['input_type'] = 'application/warc';
      generationMsg['input_mapping'] = mappingFilePath;
      generationMsg['collection_set'] = data['collection_set'];
      generationMsg['collection'] = data['collection'];
      generationMsg['warc'] = { 'id': data['warc']['id'] };
      this.logger.debug (`Publishing RabbitMQ message ${JSON.stringify(generationMsg, null, 4)} to ${this.options.exchange} (${this.options.routingKey})`);
      this.channel.publish(this.options.exchange, this.options.routingKey, Buffer.from(JSON.stringify(generationMsg)));
    } catch(err){
      this.logger.error(`Error in preparing a 'rml_mapping' request for the WARC file ${data['warc']['id']} (thus NOT sent to ${this.options.exchange})`);
      this.logger.error(err);
    }
  }
}

module.exports = RabbitMQPublisher;
