/*
 * (c) 2021 Dylan Van Assche
 * (c) 2021 Sven Lieber
 * IDLab Ghent - Ghent University - IMEC
 */
const amqp = require('amqplib/callback_api');
const fs = require('fs');
const zlib = require('zlib');
const child_process = require('child_process');
// recordIterator only exported if async iteration on readable streams is available
const { AutoWARCParser } = require('node-warc')
const path = require('path');


class WARCGenerator {
  /*
   * This constructor creates an WARCGenerator instance with the given options.
   * @param options: A JS object of producer specific options
   */
  constructor(options) {
    this.logger = options.logger;
    this.options = options;
    this.receivedMessages = [];
    if(!'url' in this.options) {
      this.options.logger.error('No URL provided, cannot fetch data from RabbitMQ');
    }
  }

  /*
   * Starts a RabbitMQ consumer if no consumer is running yet.
   */
  _startConsumer() {
    if (this.hasConsumer) { 
	    return 
    };
    let klass = this;
    amqp.connect(klass.options.url, (error0, connection) => {
      if (error0) {
        throw error0;
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          throw error1;
        }
        channel.assertExchange(klass.options.exchange, 'topic', {
          durable: true
        });

        channel.assertQueue('the-transporter-listener', {
          exclusive: true
        }, (error2, q) => {
          if (error2) {
            throw error2;
          }
          channel.bindQueue(q.queue, klass.options.exchange, klass.options.routingKey);

          channel.consume(q.queue, (msg) => {
	    klass.receivedMessages.push(JSON.parse(msg.content.toString()));
          }, { noAck: true });
          this.logger.info('RabbitMQ consumer initialized');
        });
      });
    });
    this.hasConsumer = true;
  }

  _extractUUID(value) {
      return value.substring(10, value.length-1);
  }

  // --------------------------------------------------------------------------
  /*
   * Processing WARC recors with the type 'response'.
   */
  async _processWARCResponse(record, warcRecordHeader, emitMsg, dataKey) {

     // Handle responses which are JSON
     if (record.httpInfo !== null && record.httpInfo.headers['content-type'].includes('application/json')) {
		  
         let content;
	 if (record.httpInfo.headers['content-encoding'] === 'gzip') {
             /*
	      * Dylan:
              * zlib cannot parse the gzip response as there's garbadge in it somewhere.
              * sync functions are necessary to pass the stdin.
              *
              * Sven:
              * increased buffer to 50 MB as otherwise content gets cut off
              */
              const gunzip = child_process.spawnSync("gunzip", ["-c"],                       
                                                   {                                       
                                                     input: record.content,
                                                     maxBuffer: 52428800,
                                                     encoding: "utf-8",                    
                                                     stdio: "pipe"                         
                                                   });                                     
              content = gunzip.output[1];
	  } else {
              content = record.content.toString();
	  }

	  /*
	   * Sven:
	   * We encountered broken JSON in the past, thus better a try catch and logging.
	   */
           try {
	       let jsonContent = JSON.parse(content);
	       if (Array.isArray(jsonContent)) {
	           // This seems to be a an array of JSON object: append the header to all of them and add them to the result
                   let annotatedObjects = [];
                   for( const obj of jsonContent) {
		       let copy = obj;
		       copy['warc-header'] = warcRecordHeader;
                       annotatedObjects.push(copy);
		   }
                   emitMsg[dataKey] = annotatedObjects;
                 
	       } else {
	           // This seems to be a single JSON object: append the header to it and add it to the result (it will be the only element)
                   jsonContent['warc-header'] = warcRecordHeader;
                   emitMsg[dataKey] = [jsonContent];
	       }
	   } catch (error) {
               
	       this.logger.error(`JSON parsing error, WARC-ID: ${warcRecordHeader['warc-id']}, WARC-RECORD-ID: ${warcRecordHeader['warc-record-id']}`);

	       var dateString = (new Date()).toISOString().slice(0,10).replace(/-/g,"");
	       var filenamePrefix = "json-error-" + dateString + "-" + warcRecordHeader['warc-record-id'];
	       try {
	           fs.writeFileSync(filenamePrefix + "-compressed.json.gz", record.content, {encoding: "utf8", flag: "w"});
	           fs.writeFileSync(filenamePrefix + "-uncompressed.json", content, {encoding: "utf8", flag: "w"});
	       } catch (errorFileError) {
                   this.logger.error("Could not write to error files with prefix '" + filenamePrefix + "'");
                   this.logger.error(errorFileError);
	       }
               throw(error);
           }

       }
       // This 'else branch' currently covers all other content-types content which we take as is
       else {
           emitMsg[dataKey] = [{'warc-header': warcRecordHeader, 'content': record.content.toString()}];
       }
 
  }


  // --------------------------------------------------------------------------
  /*
   * Pre-process WARC files by parsing the content and create arrays for each record containing the content.
   */
  async _processWARC(msg, data) {
        /*
         * A WARC file contains of several records, each record is a http request or response.
         * In case it is a response and it comes from Twitter
         * it may contain several hundred tweets gzipped in the response.
         */
        for await (const record of new AutoWARCParser(msg['input_path'])) {
          let warcRecordHeader = {};


          this.logger.debug(`Unpacking WARC record: ${record.warcRecordID}`);

          warcRecordHeader['warc-id'] = msg['warc']['id']; 
          warcRecordHeader['warc-date'] = record.warcDate;
          warcRecordHeader['warc-type'] = record.warcType;
          warcRecordHeader['warc-target-uri'] = record.warcTargetURI;
          warcRecordHeader['warc-record-id'] = this._extractUUID(record.warcRecordID);
          warcRecordHeader['warc-content-type'] = record.warcContentType;
          warcRecordHeader['warc-content-length'] = record.warcContentLength;
          if(record.warcType === 'request') {
              warcRecordHeader['warc-concurrent-to'] = this._extractUUID(record.warcConcurrentTo);
          }

          /* Sven:
           * we use the same structure for the created message as for the input message.
           * The only difference is that we append `_input_data` for each WARC record.
           * Therefore we end up with a message for each WARC record
           * compared to the single input message of a WARC file.
           * We need to make a deep copy.
           */
          let emitMsg = JSON.parse(JSON.stringify(msg));
          let dataKey = '_input_data';

          // since we possibly multiply the message for each record we attach the unique record ID
          emitMsg['warc-record-id'] = this._extractUUID(record.warcRecordID);
          emitMsg['warc-type'] = record.warcType;

          if (record.content) {

              // Also attach http header information if present
	    if(record.httpInfo !== null) {
                warcRecordHeader['http-version'] = record['httpInfo']['httpVersion'];
                warcRecordHeader['http-status-code'] = record['httpInfo']['statusCode'];
                warcRecordHeader['http-headers'] = record['httpInfo']['headers'];
	    }

	    // Handle HTTP requests: only pass an object with the header information
	    if (record.warcType === 'request') {
                emitMsg[dataKey] = [{'warc-header': warcRecordHeader}];
	    }
	    /* Sven:
	     * Handle HTTP responses: in case it is a JSON array, flatten it and append the header information to each object
	     * Because jsonpath in the rml mapping later cannot access fields higher in the hierarchy
	     */
            else if (record.warcType === 'response') {
                try {
                    await this._processWARCResponse(record, warcRecordHeader, emitMsg, dataKey);
                } catch(responseError) {
                     this.logger.debug("Catched error for a WARC response record and continue with next record");
                    // since this whole record seems to be broken we should not forward it to the target
                    continue;
                }
           }
            // WARC Info headers, one per WARC file
            else if (record.warcType === 'warcinfo') {
              let warcInfoContent = {}
              // Split headers and convert to object
              for (let line of (await record.content.toString()).split('\n')) {
                line = line.split(': ')
                if (line != '') {
                    warcInfoContent[line[0].trim()] = line[1].trim()
                }
              }
              emitMsg[dataKey] = {'warc-header': warcRecordHeader, 'content': warcInfoContent};
           }
            /*
             * Print error if we don't handle the warc type. 
             * Request type doesn't have any warcRecord so supress these error.
             */
            else {
              this.logger.error(`Unknown warc-type ${record.warcType}, unable to handle content of WARC record ${record.warcRecordID}`);
            }
          } else {
            this.logger.error("This should not happen, a record without content field");
            this.logger.error(record);
          }
         /* saving preprocessed json file for the purpose of reuse it somewhere else as test data
	  fs.writeFileSync(
            path.join(
                '/home/default-user/Downloads/',
                emitMsg['warc']['id'] + '-' + emitMsg['warc-type'] + '-' + emitMsg['warc-record-id'] + "-processed.json"
            ),
            JSON.stringify(emitMsg[dataKey]),
            {encoding: "utf8", flag: "w"});
           */
          data.push(emitMsg);
        }


  }

  /*
   * RabbitMQ data generation function
   * @returns: A JS object of the generated data
  */
  async generate() {
    this._startConsumer();

    // Convert each WARC record into JSON
    let data = []
    //for (let msg of this.receivedMessages) {
    // Nothing to do
    if (this.receivedMessages.length == 0) {
	//this.logger.info('No messages available, checking again soon');
	return [];
    }

    // get the next message and remove it from receivedMessages
    let msg = this.receivedMessages.shift();

    if('input_path' in msg && 'input_mapping' in msg && 'output_path' in msg && 'type' in msg && 'input_type' in msg) {
        // if we run outside docker we do not have access to the specified path
        // thus we manually adapt
        msg['input_path'] = msg['input_path'].replace('/sfm-collection-set-data', '/mnt/cental_sfm_ssh');
        msg['input_mapping'] = msg['input_mapping'].replace('/sfm-collection-set-data', '/mnt/cental_sfm_ssh');
        //msg['output_path'] = msg['output_path'].replace('/sfm-kg-data', '/mnt/cental_sfm_ssh');
        //msg['input_path'] = msg['input_path'].replace('/sfm-collection-set-data', '/home/default-user/raw-data-backup-for-mapping');
        //msg['input_mapping'] = msg['input_mapping'].replace('/sfm-collection-set-data', '/home/default-user/raw-data-backup-for-mapping');
        msg['output_path'] = msg['output_path'].replace('/sfm-kg-data', '/home/default-user/2021-08-05-kg-data');

        if(msg['type'] === 'rml_mapping') {

            this.logger.info(`Received an RML mapping request for file '${msg['input_path']}' with mapping '${msg['input_mapping']}'`);

            if(msg['input_type'] === 'application/warc') {
                this.logger.info('Input file is a WARC, start pre processing');
                await this._processWARC(msg, data)
            } else {
                this.logger.info('Not implemented yet: no preprocessing, emit message to the targets');
            }
        }
    } else {
        this.logger.error(`Received a message which does not appear to be a mapping request`);
        this.logger.error(msg);
    }

    // Messages processed, clear them
    //this.receivedMessages = [];
    return data;
  }
}

module.exports = WARCGenerator;
