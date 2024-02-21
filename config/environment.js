if (!process.env.NODE_ENV) {
  throw new Error('Missing NODE_ENV environment variable');
}

const path = require('path');

const envPath = path.join(__dirname, `./environments/${process.env.NODE_ENV}.json`);
const environmentVariables = require(envPath);

module.exports = environmentVariables;
