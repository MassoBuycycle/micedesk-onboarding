const serverless = require('serverless-http');
const appModule = require('../backend/dist/server.js');
const app = appModule.default || appModule;

module.exports = serverless(app); 