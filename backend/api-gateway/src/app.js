/**
 * API Gateway application setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');

const config = require('./config');
const logger = require('./config/logger');
const routes = require('./routes');
const { correlationId } = require('./middlewares/correlation');
const { collectMetrics } = require('./middlewares/metrics');
const { recordError } = require('./utils/metrics');
const { contentSecurityPolicy, preventClickjacking, securityHeaders, preventAttacks } = require('./middlewares/security');

// Create Express app
const app = express();

// Add correlation ID to all requests
app.use(correlationId());

// Collect metrics for all requests
app.use(collectMetrics());

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigins,
  credentials: true,
}));

// Additional security middleware
app.use(contentSecurityPolicy());
app.use(preventClickjacking());
app.use(securityHeaders());
app.use(preventAttacks());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: StatusCodes.TOO_MANY_REQUESTS,
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Custom morgan token for correlation ID
morgan.token('correlation-id', (req) => req.correlationId || 'unknown');

// Logging with correlation ID
app.use(morgan(':method :url :status :response-time ms - :correlation-id', { stream: logger.stream }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    correlationId: req.correlationId,
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: StatusCodes.NOT_FOUND,
    message: 'Resource not found',
    correlationId: req.correlationId,
  });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  
  // Log error with correlation ID
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${req.correlationId}`);
  
  // Record error in metrics
  recordError(err.name || 'UnknownError');
  
  // Don't expose stack trace in production
  const response = {
    status: statusCode,
    message,
    correlationId: req.correlationId,
    ...(config.server.env !== 'production' && { stack: err.stack }),
  };
  
  res.status(statusCode).json(response);
});

module.exports = app;
