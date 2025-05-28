/**
 * Logger configuration for Auth Service
 */

const winston = require('winston');
const config = require('./index');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Write logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      dirname: 'logs',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      dirname: 'logs',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console
if (config.server.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Create a stream object with a 'write' function that will be used by morgan
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  },
};

module.exports = logger;
