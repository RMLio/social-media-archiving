#!/usr/bin/env node
/*
 * (c) 2019-2020 Pieter Heyvaert
 * (c) 2020 Dylan Van Assche
 * (c) 2021 Sven Lieber
 * IDLab Ghent - Ghent University - IMEC
 */

const fs = require('fs');
const program = require('commander');
const createTarget = require('../lib/targets/target-factory');
const winston = require('winston');
const path = require('path');

require('dotenv').config();
/*
 * Handle CLI arguments.
 */
const version = require('../package').version;
program.version(version);

program
  .requiredOption('-c, --config <string>',
                  'Path to JSON config file.')
  .option('-v, --verbose',
          'Enable verbose logging (info level).')
  .option('-d, --debug',
          'Enable debug logging.')
  .option('-l, --logfile <file>',
          'The logfile path.');

program.parse(process.argv);

let logLevel = 'error';

if (program.verbose) {
  logLevel = 'info';
} else if(program.debug) {
  logLevel = 'debug';
}

let winstonConfig = {
  level: logLevel,
  transports: [
    new winston.transports.Console({format: winston.format.simple()})
  ],
};

if (program.logfile) {
  winstonConfig.transports.push(new winston.transports.File({
      filename: program.logfile,
      format:  winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }));

}

const logger = winston.createLogger(winstonConfig);

logger.info('Using the following options:');
logger.info(`\tConfigFile: ${program.config}\n`);

let config = fs.readFileSync(program.config, "utf8");

let populatedConfig = config;
let reVars = /.*?(\${.*?}).*?/gm;
let usedEnvVariables = config.matchAll(reVars);
let nonFoundVars = [];
for(let match of usedEnvVariables) {
  let found = match[1];
  // extract var name, e.g. DB_HOST from ${DB_HOST} so we can compare with env variables
  let varName = found.substring(2, (found.length -1) );

  if(varName in process.env){
    // split-join solution because of behavior of replaceAll and global flag, see Stackoverflow: https://stackoverflow.com/a/542305
    populatedConfig = populatedConfig.split(found).join(process.env[varName]);
  } else {
    nonFoundVars.push(varName);
  }
}

if(nonFoundVars.length > 0) {
  logger.warn(`No value set for the following used environment variables: ${nonFoundVars}`);
}
config = JSON.parse(populatedConfig);

const configDir = path.dirname(program.config);
/*
 * Create targets from config.
 */
const targets = [];

config.targets.forEach(async targetOpts => {
  targetOpts.logger = logger;
  targets.push(await createTarget(targetOpts));
});

logger.debug("The following targets were created:");
logger.debug(targets);
/*
 * Start data generators.
 */
const runningGenerators = [];

config.generators.forEach(generatorOptions => {
  const GeneratorClass = require(path.resolve(configDir, generatorOptions.generator));
  generatorOptions.options.logger = logger;
  const generator = new GeneratorClass(generatorOptions.options);

  const generateFn = async () => {
    const dataArray = await generator.generate();

    targets.forEach( async target => {
      logger.debug(`Check target: ${target.name}`);
      for (const data of dataArray) {
        logger.debug(`${generatorOptions.name}: ${JSON.stringify(data)}`);
        await target.sendData(data);
      }
    });
  };

  generateFn(); // Run at least once.

  if (generatorOptions.interval) {
    runningGenerators.push(setInterval(generateFn, generatorOptions.interval));
  }
});

/*
 * Graceful exit.
 */
logger.info('Running, press CTRL + C to exit');
process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  runningGenerators.forEach((timer) => {
    clearInterval(timer);
  });
  process.exit(0);
});
