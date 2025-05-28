/**
 * Main application file for Analytics Service
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const config = require('./config');
const logger = require('./config/logger');
const db = require('./models');
const errorHandler = require('./middlewares/error-handler');

// Import services
const MetricService = require('./services/metric.service');
const DashboardService = require('./services/dashboard.service');
const ReportService = require('./services/report.service');
const DataCollectorService = require('./services/data-collector.service');
const KPIService = require('./services/kpi.service');
const AnalyticsService = require('./services/analytics.service');

// Import controllers
const MetricController = require('./controllers/metric.controller');
const DashboardController = require('./controllers/dashboard.controller');
const ReportController = require('./controllers/report.controller');
const KPIController = require('./controllers/kpi.controller');
const AnalyticsController = require('./controllers/analytics.controller');

// Import routes
const initRoutes = require('./routes');

/**
 * Initialize Express application
 * @returns {Object} Express application
 */
function initApp() {
  const app = express();

  // Set up middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Add request ID middleware
  app.use((req, res, next) => {
    req.id = uuidv4();
    next();
  });

  // Set up logging
  if (config.server.env !== 'test') {
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }));
  }

  // Set up static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Set up Swagger documentation
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Analytics Service API',
        version: '1.0.0',
        description: 'API documentation for Analytics Service',
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./routes/*.js'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Initialize services
  const services = initServices();

  // Initialize controllers
  const controllers = initControllers(services);

  // Set up routes
  app.use(initRoutes(controllers));

  // Set up error handling
  app.use(errorHandler);

  return app;
}

/**
 * Initialize services
 * @returns {Object} Services
 */
function initServices() {
  const metricService = new MetricService(db);
  const dataCollectorService = new DataCollectorService(db, { metricService });
  const kpiService = new KPIService(db, { metricService, dataCollectorService });
  const dashboardService = new DashboardService(db, { metricService });
  const reportService = new ReportService(db, { metricService });
  const analyticsService = new AnalyticsService(db, { metricService, kpiService });

  return {
    metricService,
    dashboardService,
    reportService,
    dataCollectorService,
    kpiService,
    analyticsService,
  };
}

/**
 * Initialize controllers
 * @param {Object} services - Services
 * @returns {Object} Controllers
 */
function initControllers(services) {
  return {
    metricController: new MetricController(services),
    dashboardController: new DashboardController(services),
    reportController: new ReportController(services),
    kpiController: new KPIController(services),
    analyticsController: new AnalyticsController(services),
  };
}

module.exports = initApp;
