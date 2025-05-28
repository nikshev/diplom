require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const winston = require('winston');

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// Auth middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
// Auth Service
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL || 'http://auth-service:8001'));

// Order Service (protected routes)
app.use('/api/orders', verifyToken, proxy(process.env.ORDER_SERVICE_URL || 'http://order-service:8002'));

// CRM Service (protected routes)
app.use('/api/crm', verifyToken, proxy(process.env.CRM_SERVICE_URL || 'http://crm-service:8003'));

// Inventory Service (protected routes)
app.use('/api/inventory', verifyToken, proxy(process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:8004'));

// Finance Service (protected routes)
app.use('/api/finance', verifyToken, proxy(process.env.FINANCE_SERVICE_URL || 'http://finance-service:8005'));

// Analytics Service (protected routes)
app.use('/api/analytics', verifyToken, proxy(process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:8006'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});
