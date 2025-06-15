require('dotenv').config();

// Delegate to the main server implementation
const startServer = require('./server');

startServer();
