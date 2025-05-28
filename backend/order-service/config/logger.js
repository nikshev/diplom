/**
 * Logger configuration for Order Service
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('./index');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), config.logging.directory);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

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
  defaultMeta: { service: 'order-service' },
  transports: [
    // Write logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

// If we're not in production, log to the console with a simpler format
if (config.server.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Stream for Morgan
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
