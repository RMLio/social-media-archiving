/*
 * (c) 2021 Dylan Van Assche
 * (c) 2021 Sven Lieber
 * (c) 2021 Gertjan De Mulder
 * IDLab Ghent - Ghent University - IMEC
 */
const RMLMapperWrapper = require('@rmlio/rmlmapper-java-wrapper');
const fs = require('fs');
const N3 = require('n3');
const { Writer } = N3;
const rmlmapperPath = './rmlmapper.jar';
const tempFolderPath = './tmp';
const path = require('path');
const wrapper = new RMLMapperWrapper(rmlmapperPath, tempFolderPath, false);

const defaultOptions = {
  contentKey: 'content',
  mappingKey: 'mapping',
  serialization: 'turtle'
}

/**
 * This class creates a RMLMapper target.
 */
class RMLMapper {

  /**
   * This constructor creates an instance of an RMLMapper with the given options.
   * @param options An object of options.
   * @param {string} options.contentKey The key holding the content in the data structure. Default 'content'
   * @param {string} options.mappingKey The key holding the mapping path in the data structure. Default 'mapping'
   * @param {string} options.serialization RDF serialization format. Default 'turtle'
   */
  constructor(options = {}) {
    this.logger = options.logger;
    this.options = {...defaultOptions, ...options};
  }


  async _mapGeneric(data) {

    // Read mapping path from data
    const rml = fs.readFileSync(data['input_mapping'], 'utf-8');

    // Read data as source
    const sources = {
        'message.json': JSON.stringify(data['_input_data'])
    };

    try {
        // Execute RMLMapper
        const result = await wrapper.execute(rml, { sources,
                                                generateMetadata: false,
                                                asQuads: true,
                                                serialization: this.options.serialization });

        this.logger.debug("Mapping finished");
        if(result['output'].length == 0) {
            this.logger.info("empty mapping result");
            //fs.writeFileSync("empty-mapping-result-input-" + data['warc-record-id'] + ".json",
            //                 JSON.stringify(data['_input_data']), {encoding: "utf8", flag: "w"});
        }
        // Write triples to disk
        const outputStream = fs.createWriteStream(path.join(data['output_path'], data['warc']['id'] + '.nq'), {flags: 'a'});
        const writer = new Writer(outputStream, { format: 'N-Triples' });

        outputStream.on('error', function(err){
            this.logger.error("Error while writing mapping results");
            this.logger.error(err);
            outputStream.end();
        });
        writer.addQuads(result['output']);
        writer.end();

    } catch (mappingError) {
        this.logger.error("Error while mapping");
	this.logger.error(mappingError);
    }

  }

  async _mapWARC(data) {

    let klass = this;
    //fs.writeFileSync(`msg-${data['warc-type']}-${data['warc-record-id']}.json`, JSON.stringify(data['_input_data']), {encoding: "utf8", flag: "w"});
    // If it is a warcinfo record we do not have to map
    if(data['warc-type'] === 'warcinfo') {
        klass.logger.info(`Skipping warcinfo record ${data['warc-record-id']} of WARC ${data['warc']['id']}`);
        return;
    } else {

        // If there is no data we do not have to map
        if(data['_input_data'].length == 0) {
            klass.logger.info(`Empty input data for WARC record ${data['warc-record-id']} of WARC ${data['warc']['id']}`);
            return;
        } else {
            klass.logger.info(`Mapping WARC ${data['warc-type']} record ${data['warc-record-id']} of WARC ${data['warc']['id']}`);
        }
    }

    // Read mapping path from data
    const rml = fs.readFileSync(data['input_mapping'], 'utf-8');

    // Read data as source
    const sources = {
        'message.json': JSON.stringify(data['_input_data'])
    };

    // FnO
    const pathsFunctionDescriptions = [
        './function/functions_besocial.ttl',
        './function/functions_idlab.ttl',
        './function/functions_grel.ttl',
        './function/grel_java_mapping.ttl'
    ];


    const readFunctionDescriptionFilesAsRDFGraph = (pathsFunctionDescriptions) => {
        const parser = new N3.Parser();
        const store = new N3.Store();
        
        pathsFunctionDescriptions.forEach(fpath => {
            try {
                const data = fs.readFileSync(fpath,{encoding:'utf-8'});
                const quads = parser.parse(data);
                store.addQuads(quads);
            }catch (err) {
                klass.logger.error(`Error while reading/parsing ${fpath}.\n`, err)
            }
            
        });        
        return store;
    };

    // Create RDFGraph from function description files
    const store = readFunctionDescriptionFilesAsRDFGraph(pathsFunctionDescriptions);

    // If the function description graph is not empty, write the graph to a string
    const ttlWriter = new N3.Writer({format:'text/turtle'});
    const fno = store.countQuads() ? ttlWriter.quadsToString(store.getQuads()):undefined;
    
    try {
        // Execute RMLMapper
        const options = { 
            sources,
            generateMetadata: false,
            asQuads: true,
            serialization: klass.options.serialization,
            fno
        }
        const result = await wrapper.execute(rml, options);

        klass.logger.debug(`Mapping finished for WARC record ${data['warc-record-id']} of WARC ${data['warc']['id']}`);
        if(result['output'].length == 0) {
            klass.logger.info(`empty mapping result for WARC record ${data['warc-record-id']} of WARC ${data['warc']['id']}`);
            //fs.writeFileSync("empty-mapping-result-input-" + data['warc-record-id'] + ".json",
            //                 JSON.stringify(data['_input_data']), {encoding: "utf8", flag: "w"});
        }
        // Write triples to disk
        fs.mkdirSync(path.dirname(data['output_path']), {recursive: true});
        const outputStream = fs.createWriteStream(data['output_path'], {flags: 'a'});
        const writer = new Writer(outputStream, { format: 'N-Triples' });

        outputStream.on('error', function(err){
            klass.logger.error(`Error while writing mapping results for WARC record ${data['warc-record-id']} of WARC ${data['warc']['id']}`);
            klass.logger.error(err);
            outputStream.end();
        });
        writer.addQuads(result['output']);
        writer.end();

    } catch (mappingError) {
        klass.logger.error(`Error while mapping WARC record ${data['warc-record-id']} of WARC ${data['warc']['id']}`);
	klass.logger.error(mappingError);
	var dateString = (new Date()).toISOString().slice(0,10).replace(/-/g,"");
	var filenamePrefix = "error-" + dateString + "-" + data['warc-record-id'];
	try {
	    fs.writeFileSync(filenamePrefix + "-" + "mapping.log", rml, {encoding: "utf8", flag: "w"});
	    fs.writeFileSync(filenamePrefix + "-" + "data.log", JSON.stringify(data['_input_data']), {encoding: "utf8", flag: "w"});
	} catch (errorFileError) {
            klass.logger.error("Could not write to error files with prefix '" + filenamePrefix + "'");
            klass.logger.error(errorFileError);
	}
    }



  }

  /**
   * This method send data to a file and runs the external command on it
   * @param data The data to be sent.
   * @returns {Promise<void>}
   */
  async sendData(data){

    if(data['input_type'] === 'application/warc') {
        await this._mapWARC(data);
    } else {
        this.logger.info("Unknown input type, execute default mapping");
    }

  }
}

module.exports = RMLMapper;
