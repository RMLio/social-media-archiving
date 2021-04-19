#!/usr/bin/env node
/*
 * (c) 2021 Sven Lieber
 * IDLab Ghent - Ghent University - IMEC
 *
 * This example script queries a Social Feed Manager PostgreSQL database for WARC files
 * and generates JSON messages which are then send to a RabbitMQ exchange.
 */

const amqp = require('amqplib/callback_api');
const Pool = require('pg').Pool


const dbUser = 'user';
const dbHost = 'host';
const dbName = 'dbName';
const dbPw = 'dbPassword';
const dbPort = '5432';

const mqUser = 'mqUser';
const mqPw = 'mqPassword';
const mqHost = 'mqHost';
const mqPort = '5672';

// Connect to DB via SSH tunnel
const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPw,
  port: dbPort,
});


amqp.connect("amqp://" + mqUser + ":" +  mqPw + "@" + mqHost + ":" +  mqPort, function(error0, connection) {
  if (error0) {
    throw error0;
  }
  console.log("connection created!");

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    console.log("channel created!");
    var exchange = 'kg_generation';

    // In this example WARC files from the collection with id 2 are selected"
    pool.query("select w.warc_id, w.path, h.harvest_id from ui_warc w join ui_harvest h on w.harvest_id=h.id where h.collection_id=2",(dbError, results) => {
      if(dbError){
	      console.log("DB error");
	      console.log(dbError);
        throw dbError;
      }
      console.log("process " + results.rows.length + " warc files");
      for(var i in results.rows){
        let row = results.rows[i]
        let generationMsg = {};

        generationMsg['id'] = row['harvest_id'];
        generationMsg['type'] = 'rml_mapping';
        generationMsg['input_path'] = row['path'];
        generationMsg['output_path'] = '/sfm-kg-data/' + row['warc_id'] + '.nq';
        generationMsg['input_type'] = 'application/warc';
        generationMsg['input_mapping'] = '/sfm-collection-set-data/json-twitter-warc-mapping.rml.ttl';
        generationMsg['warc'] = { 'id': row['warc_id'] };
        console.log(generationMsg);

        channel.publish(exchange, '', Buffer.from(JSON.stringify(generationMsg)));
        console.log(" [x] Sent ");
      }
      console.log("processed " + results.rows.length + " warc files");
    });
  });

  setTimeout(function() {
    connection.close();
    process.exit(0);
  }, 500);
});
