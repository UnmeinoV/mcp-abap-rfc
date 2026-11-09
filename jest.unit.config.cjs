// Unit checks never run the SAP-authenticating integration globalSetup.
const { jest: base } = require('./package.json');
const { globalSetup, ...config } = base;
module.exports = config;
