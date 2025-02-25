const { , validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'Athena',
  location: 'asia-east1'
};
exports.connectorConfig = connectorConfig;

