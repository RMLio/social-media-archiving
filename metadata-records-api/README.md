# Metadata records API

We use the tool [Walder](https://github.com/KNowledgeOnWebScale/walder) to set up an API on top of our Knowledge Graph.
This tool can be configured to read RDF files in different serializations, from SPARQL endpoints or triple stores.
When the tool is tarted the API is availale at localhost, by default under port `3000`.


## Usage
The following code installs the javascript tool *Walder* from the node package manager (NPM).

```bash
npm i walder
```

The API can be started with the following command:

```bash
walder --config config.yml
```

