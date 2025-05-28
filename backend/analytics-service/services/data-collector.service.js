/**
 * Data Collector service for Analytics Service
 */

const axios = require('axios');
const { DataCollectionError } = require('../utils/errors');
const logger = require('../config/logger');
const config = require('../config');

/**
 * Data Collector service
 */
class DataCollectorService {
  /**
   * Constructor
   * @param {Object} db - Database models
   * @param {Object} services - Services
   */
  constructor(db, services) {
    this.db = db;
    this.Metric = db.Metric;
    this.MetricData = db.MetricData;
    this.metricService = services.metricService;
    
    // Initialize HTTP clients for each service
    this.serviceClients = {
      auth: axios.create({ baseURL: config.services.auth }),
      crm: axios.create({ baseURL: config.services.crm }),
      inventory: axios.create({ baseURL: config.services.inventory }),
      finance: axios.create({ baseURL: config.services.finance }),
      order: axios.create({ baseURL: config.services.order }),
    };
    
    // Add response interceptor to each client
    Object.values(this.serviceClients).forEach(client => {
      client.interceptors.response.use(
        response => response.data,
        error => {
          logger.error(`Service request error: ${error.message}`, {
            service: error.config?.baseURL,
            url: error.config?.url,
            method: error.config?.method,
          });
          throw error;
        }
      );
    });
  }

  /**
   * Collect data for all active metrics
   * @returns {Object} Collection results
   */
  async collectAllMetrics() {
    logger.info('Starting data collection for all active metrics');
    
    // Get all active metrics
    const metrics = await this.Metric.findAll({
      where: { is_active: true },
    });
    
    logger.info(`Found ${metrics.length} active metrics to collect`);
    
    // Collect data for each metric
    const results = {
      total: metrics.length,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };
    
    for (const metric of metrics) {
      try {
        await this.collectMetricData(metric.id);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          metric_id: metric.id,
          metric_name: metric.name,
          error: error.message,
        });
        
        logger.error(`Error collecting data for metric ${metric.name}`, {
          metric_id: metric.id,
          error: error.message,
        });
      }
    }
    
    logger.info('Data collection completed', results);
    
    return results;
  }

  /**
   * Collect data for a specific metric
   * @param {string} id - Metric ID
   * @returns {Object} Collected data
   */
  async collectMetricData(id) {
    // Get metric
    const metric = await this.Metric.findByPk(id);
    
    if (!metric) {
      throw new DataCollectionError(`Metric with ID ${id} not found`);
    }
    
    if (!metric.is_active) {
      throw new DataCollectionError(`Metric ${metric.name} is not active`);
    }
    
    logger.info(`Collecting data for metric: ${metric.name}`, {
      metric_id: id,
      data_source: metric.data_source,
    });
    
    // Get data based on the metric's data source
    let sourceData;
    try {
      sourceData = await this.fetchSourceData(metric);
    } catch (error) {
      throw new DataCollectionError(`Failed to fetch source data: ${error.message}`, metric.data_source);
    }
    
    // Calculate metric value
    const value = await this.calculateMetricValue(metric, sourceData);
    
    // Determine period dates
    const now = new Date();
    const { periodStart, periodEnd } = this.getPeriodDates(metric.aggregation_period, now);
    
    // Check if data point already exists for this period
    const existingDataPoint = await this.MetricData.findOne({
      where: {
        metric_id: id,
        period: metric.aggregation_period,
        period_start: periodStart,
        period_end: periodEnd,
      },
    });
    
    if (existingDataPoint) {
      // Update existing data point
      await existingDataPoint.update({
        value,
        date: now,
        source_data: sourceData,
      });
      
      logger.info(`Updated existing data point for metric ${metric.name}`, {
        metric_id: id,
        value,
        period: metric.aggregation_period,
      });
      
      return existingDataPoint;
    } else {
      // Create new data point
      const dataPoint = await this.MetricData.create({
        metric_id: id,
        value,
        date: now,
        period: metric.aggregation_period,
        period_start: periodStart,
        period_end: periodEnd,
        source_data: sourceData,
        is_forecasted: false,
      });
      
      logger.info(`Created new data point for metric ${metric.name}`, {
        metric_id: id,
        value,
        period: metric.aggregation_period,
      });
      
      return dataPoint;
    }
  }

  /**
   * Fetch source data for a metric
   * @param {Object} metric - Metric object
   * @returns {Object} Source data
   * @private
   */
  async fetchSourceData(metric) {
    const dataSource = metric.data_source.toLowerCase();
    
    // Check if we have a client for this data source
    if (!this.serviceClients[dataSource]) {
      throw new DataCollectionError(`Unknown data source: ${dataSource}`);
    }
    
    // Fetch data based on metric category
    switch (metric.category.toLowerCase()) {
      case 'financial':
        return this.fetchFinancialData(metric);
      case 'inventory':
        return this.fetchInventoryData(metric);
      case 'order':
        return this.fetchOrderData(metric);
      case 'customer':
        return this.fetchCustomerData(metric);
      default:
        throw new DataCollectionError(`Unknown metric category: ${metric.category}`);
    }
  }

  /**
   * Fetch financial data
   * @param {Object} metric - Metric object
   * @returns {Object} Financial data
   * @private
   */
  async fetchFinancialData(metric) {
    const client = this.serviceClients.finance;
    const now = new Date();
    const { periodStart, periodEnd } = this.getPeriodDates(metric.aggregation_period, now);
    
    // Determine endpoint based on metric name
    const metricName = metric.name.toLowerCase();
    
    if (metricName.includes('revenue') || metricName.includes('income')) {
      // Get transactions data
      return client.get('/api/transactions', {
        params: {
          type: 'income',
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('expense') || metricName.includes('cost')) {
      // Get transactions data
      return client.get('/api/transactions', {
        params: {
          type: 'expense',
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('profit') || metricName.includes('margin')) {
      // Get all transactions data
      return client.get('/api/transactions', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('invoice') || metricName.includes('payment')) {
      // Get invoices data
      return client.get('/api/invoices', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('account') || metricName.includes('balance')) {
      // Get accounts data
      return client.get('/api/accounts');
    } else {
      throw new DataCollectionError(`Unknown financial metric: ${metric.name}`);
    }
  }

  /**
   * Fetch inventory data
   * @param {Object} metric - Metric object
   * @returns {Object} Inventory data
   * @private
   */
  async fetchInventoryData(metric) {
    const client = this.serviceClients.inventory;
    const now = new Date();
    const { periodStart, periodEnd } = this.getPeriodDates(metric.aggregation_period, now);
    
    // Determine endpoint based on metric name
    const metricName = metric.name.toLowerCase();
    
    if (metricName.includes('stock') || metricName.includes('inventory_value')) {
      // Get products data
      return client.get('/api/products');
    } else if (metricName.includes('low_stock') || metricName.includes('out_of_stock')) {
      // Get products data with stock filter
      return client.get('/api/products', {
        params: {
          stockStatus: metricName.includes('out_of_stock') ? 'out' : 'low',
        },
      });
    } else if (metricName.includes('movement') || metricName.includes('turnover')) {
      // Get inventory movements data
      return client.get('/api/inventory/movements', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else {
      throw new DataCollectionError(`Unknown inventory metric: ${metric.name}`);
    }
  }

  /**
   * Fetch order data
   * @param {Object} metric - Metric object
   * @returns {Object} Order data
   * @private
   */
  async fetchOrderData(metric) {
    const client = this.serviceClients.order;
    const now = new Date();
    const { periodStart, periodEnd } = this.getPeriodDates(metric.aggregation_period, now);
    
    // Determine endpoint based on metric name
    const metricName = metric.name.toLowerCase();
    
    if (metricName.includes('order') || metricName.includes('sales')) {
      // Get orders data
      return client.get('/api/orders', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('cart') || metricName.includes('abandoned')) {
      // Get abandoned carts data
      return client.get('/api/carts/abandoned', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('fulfillment') || metricName.includes('shipping')) {
      // Get fulfillment data
      return client.get('/api/fulfillment', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else {
      throw new DataCollectionError(`Unknown order metric: ${metric.name}`);
    }
  }

  /**
   * Fetch customer data
   * @param {Object} metric - Metric object
   * @returns {Object} Customer data
   * @private
   */
  async fetchCustomerData(metric) {
    const client = this.serviceClients.crm;
    const now = new Date();
    const { periodStart, periodEnd } = this.getPeriodDates(metric.aggregation_period, now);
    
    // Determine endpoint based on metric name
    const metricName = metric.name.toLowerCase();
    
    if (metricName.includes('customer') || metricName.includes('client')) {
      // Get customers data
      return client.get('/api/customers', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('retention') || metricName.includes('churn')) {
      // Get retention data
      return client.get('/api/customers/retention', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
    } else if (metricName.includes('acquisition') || metricName.includes('new')) {
      // Get new customers data
      return client.get('/api/customers', {
        params: {
          startDate: periodStart,
          endDate: periodEnd,
          isNew: true,
        },
      });
    } else if (metricName.includes('ltv') || metricName.includes('lifetime_value')) {
      // Get customer lifetime value data
      return client.get('/api/customers/ltv');
    } else {
      throw new DataCollectionError(`Unknown customer metric: ${metric.name}`);
    }
  }

  /**
   * Calculate metric value from source data
   * @param {Object} metric - Metric object
   * @param {Object} sourceData - Source data
   * @returns {number} Calculated value
   * @private
   */
  async calculateMetricValue(metric, sourceData) {
    // Handle different calculation methods based on metric
    const metricName = metric.name.toLowerCase();
    const calculationMethod = metric.calculation_method.toLowerCase();
    
    // Financial metrics
    if (metric.category.toLowerCase() === 'financial') {
      if (metricName.includes('revenue') || metricName.includes('income')) {
        // Sum of income transactions
        return this.sumTransactions(sourceData.transactions || sourceData);
      } else if (metricName.includes('expense') || metricName.includes('cost')) {
        // Sum of expense transactions
        return this.sumTransactions(sourceData.transactions || sourceData);
      } else if (metricName.includes('profit')) {
        // Revenue - Expenses
        const transactions = sourceData.transactions || sourceData;
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return income - expenses;
      } else if (metricName.includes('margin')) {
        // (Revenue - Expenses) / Revenue * 100
        const transactions = sourceData.transactions || sourceData;
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return income > 0 ? ((income - expenses) / income) * 100 : 0;
      } else if (metricName.includes('invoice')) {
        // Count or sum of invoices
        const invoices = sourceData.invoices || sourceData;
        return calculationMethod === 'count'
          ? invoices.length
          : invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      } else if (metricName.includes('account') || metricName.includes('balance')) {
        // Sum of account balances
        const accounts = sourceData.accounts || sourceData;
        return accounts.reduce((sum, acc) => sum + acc.balance, 0);
      }
    }
    
    // Inventory metrics
    else if (metric.category.toLowerCase() === 'inventory') {
      if (metricName.includes('stock') || metricName.includes('inventory_value')) {
        // Sum of product stock values
        const products = sourceData.products || sourceData;
        return products.reduce((sum, p) => sum + (p.stock_quantity * p.price), 0);
      } else if (metricName.includes('low_stock')) {
        // Count of low stock products
        const products = sourceData.products || sourceData;
        return products.length;
      } else if (metricName.includes('out_of_stock')) {
        // Count of out of stock products
        const products = sourceData.products || sourceData;
        return products.length;
      } else if (metricName.includes('movement') || metricName.includes('turnover')) {
        // Sum of movement quantities
        const movements = sourceData.movements || sourceData;
        return movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      }
    }
    
    // Order metrics
    else if (metric.category.toLowerCase() === 'order') {
      if (metricName.includes('order_count') || metricName.includes('sales_count')) {
        // Count of orders
        const orders = sourceData.orders || sourceData;
        return orders.length;
      } else if (metricName.includes('order_value') || metricName.includes('sales_value')) {
        // Sum of order values
        const orders = sourceData.orders || sourceData;
        return orders.reduce((sum, o) => sum + o.total_amount, 0);
      } else if (metricName.includes('average_order_value') || metricName.includes('aov')) {
        // Average order value
        const orders = sourceData.orders || sourceData;
        return orders.length > 0
          ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length
          : 0;
      } else if (metricName.includes('cart_abandonment')) {
        // Abandoned carts / (Abandoned carts + Completed orders) * 100
        const carts = sourceData.carts || sourceData;
        const abandonedCount = carts.length;
        
        // Get completed orders count from the same period
        const completedCount = await this.getCompletedOrdersCount(
          metric.aggregation_period
        );
        
        return completedCount + abandonedCount > 0
          ? (abandonedCount / (completedCount + abandonedCount)) * 100
          : 0;
      }
    }
    
    // Customer metrics
    else if (metric.category.toLowerCase() === 'customer') {
      if (metricName.includes('customer_count') || metricName.includes('client_count')) {
        // Count of customers
        const customers = sourceData.customers || sourceData;
        return customers.length;
      } else if (metricName.includes('new_customer') || metricName.includes('acquisition')) {
        // Count of new customers
        const customers = sourceData.customers || sourceData;
        return customers.length;
      } else if (metricName.includes('retention')) {
        // Retention rate
        return sourceData.retention_rate || 0;
      } else if (metricName.includes('churn')) {
        // Churn rate
        return sourceData.churn_rate || 0;
      } else if (metricName.includes('ltv') || metricName.includes('lifetime_value')) {
        // Average customer lifetime value
        const customers = sourceData.customers || sourceData;
        return customers.length > 0
          ? customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / customers.length
          : 0;
      }
    }
    
    // Default: return 0 if no calculation method matched
    logger.warn(`No specific calculation method found for metric: ${metric.name}`);
    return 0;
  }

  /**
   * Sum transactions
   * @param {Array} transactions - Transactions array
   * @returns {number} Sum
   * @private
   */
  sumTransactions(transactions) {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get completed orders count
   * @param {string} period - Period
   * @returns {number} Count
   * @private
   */
  async getCompletedOrdersCount(period) {
    const now = new Date();
    const { periodStart, periodEnd } = this.getPeriodDates(period, now);
    
    try {
      const response = await this.serviceClients.order.get('/api/orders', {
        params: {
          status: 'completed',
          startDate: periodStart,
          endDate: periodEnd,
        },
      });
      
      return (response.orders || response).length;
    } catch (error) {
      logger.error(`Error getting completed orders count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get period start and end dates
   * @param {string} period - Period type
   * @param {Date} date - Reference date
   * @returns {Object} Period dates
   * @private
   */
  getPeriodDates(period, date) {
    const periodStart = new Date(date);
    const periodEnd = new Date(date);
    
    switch (period.toLowerCase()) {
      case 'daily':
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const day = periodStart.getDay();
        const diff = periodStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        periodStart.setDate(diff);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setDate(periodStart.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setMonth(periodStart.getMonth() + 1);
        periodEnd.setDate(0);
        periodEnd.setHours(23, 59, 59, 999);
        break;
      case 'quarterly':
        const quarter = Math.floor(periodStart.getMonth() / 3);
        periodStart.setMonth(quarter * 3);
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setMonth(quarter * 3 + 3);
        periodEnd.setDate(0);
        periodEnd.setHours(23, 59, 59, 999);
        break;
      case 'yearly':
        periodStart.setMonth(0);
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setMonth(12);
        periodEnd.setDate(0);
        periodEnd.setHours(23, 59, 59, 999);
        break;
      default:
        // Default to daily
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
    }
    
    return {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
    };
  }

  /**
   * Clean up old metric data
   * @returns {Object} Cleanup results
   */
  async cleanupOldData() {
    const retentionDays = config.dataCollection.retention;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    logger.info(`Cleaning up metric data older than ${retentionDays} days`);
    
    // Delete old data
    const deleted = await this.MetricData.destroy({
      where: {
        date: {
          [this.db.Sequelize.Op.lt]: cutoffDate,
        },
        is_forecasted: false, // Don't delete forecasted data
      },
    });
    
    logger.info(`Deleted ${deleted} old metric data points`);
    
    return {
      deleted,
      cutoffDate,
      retentionDays,
    };
  }
}

module.exports = DataCollectorService;
