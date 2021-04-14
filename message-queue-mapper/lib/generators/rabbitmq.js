/*
 * (c) 2021 Dylan Van Assche
 * IDLab Ghent - Ghent University - IMEC
 */
const amqp = require('amqplib/callback_api');

const defaultOptions = {
  exchange: 'the-transporter',
  routingKey: '#' // all messages
}

/**
 * This class creates a RabbitMQConsumer generator.
 */
class RabbitMQConsumer {

  /**
   * This constructor creates an instance of an RabbitMQConsumer generator with the given options.
   * @param options An object of options.
   * @param {string} options.url URL to access the RabbitMQ instance.
   * @param {string} options.exchange The RabbitMQ exchange name. Default 'the-transporter'
   * @param {string} options.routingKey The RabbitMQ routing key for the exchange. Default 'message'
   */
  constructor(options = {}) {
    this.options = {...defaultOptions, ...options};
    this.receivedMessages = [];
    this.hasConsumer = false;
    if(!'url' in this.options) {
        console.error ('No URL provided, cannot publish to RabbitMQ exchange!');
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
      console.log("connection established!");
      if (error0) {
        throw error0;
      }
      connection.createChannel((error1, channel) => {
	console.log("channel created!");
        if (error1) {
          throw error1;
        }
        channel.assertExchange(klass.options.exchange, 'topic', {
          durable: true
        });

        channel.assertQueue('the-transporter-listener-2', {
          exclusive: true
        }, (error2, q) => {
	  console.log("queue asserted!");
          if (error2) {
            throw error2;
          }
          channel.bindQueue(q.queue, klass.options.exchange, klass.options.routingKey);

          channel.consume(q.queue, (msg) => {
	    let content = msg.content.toString();
	    try {
	      let json = JSON.parse(content);
	      klass.receivedMessages.push(json);
	    }
            catch (e) {
              console.error(`Unable to parse JSON: ${content}`);
	    }
          }, { noAck: true });
          console.log('RabbitMQ consumer initialized');
        });
      });
    });
    this.hasConsumer = true;
  }

  /**
   * This method receives a RabbitMQ message and starts generating
   * @returns {Promise<void>}
   */
  async generate(){
    this._startConsumer(); 
    const temp = this.receivedMessages;
    this.receivedMessages = [];
    return temp;
  }
}

module.exports = RabbitMQConsumer;
