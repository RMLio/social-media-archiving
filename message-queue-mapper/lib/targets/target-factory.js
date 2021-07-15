const RMLMapper = require('./rmlmapper');
const RabbitMQPublisher = require('./rabbitmq');

const amqp = require('amqplib');
const Pool = require('pg').Pool;

async function createTarget(options) {
  if (options.type === 'rmlmapper') {
    return new RMLMapper(options);
  } else if (options.type === 'rabbitmq') {

    try {
      const mqConnection = await amqp.connect(options.url);
      const mqChannel    = await mqConnection.createChannel();

      mqChannel.assertExchange(options.exchange, 'topic', { durable: true });

      // the channel is established, now focus on the DB connection
      let pool = new Pool({
        user: options.dbUser,
        host: options.dbHost,
        port: options.dbPort,
        database: options.dbDatabase,
        password: options.dbPassword
      });

      return new RabbitMQPublisher(options, mqChannel, pool);
    } catch (err) {
      console.error("Could not initialize RabbitMQPublisher");
      console.error(err);
    }
  } else {
    console.error(`ERROR: Unknown target type: ${options.type}`)
  }
}

module.exports = createTarget;
