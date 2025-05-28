/**
 * Logger configuration for Finance Service
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const path = require('path');
const fs = require('fs');
const config = require('./index');

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create logger
const logger = createLogger({
  level: config.logging.level,
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    // Console transport
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      ),
    }),
    // File transport
    new transports.File({
      filename: config.logging.file,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
