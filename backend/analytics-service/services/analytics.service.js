/**
 * Analytics service for Analytics Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError, AnalyticsError } = require('../utils/errors');
const logger = require('../config/logger');
const config = require('../config');

/**
 * Analytics service
 */
class AnalyticsService {
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
    this.kpiService = services.kpiService;
  }

  /**
   * Get business overview
   * @param {Object} options - Query options
   * @returns {Object} Business overview
   */
  async getBusinessOverview(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
    } = options;

    // Get date range for the timeframe
    const { startDate, endDate } = this.kpiService.getTimeframeDates(timeframe);
    
    try {
      // Get financial metrics
      const revenue = await this.getMetricByName('total_revenue', { startDate, endDate });
      const expenses = await this.getMetricByName('total_expenses', { startDate, endDate });
      const profit = await this.getMetricByName('net_profit', { startDate, endDate });
      
      // Get sales metrics
      const orderCount = await this.getMetricByName('order_count', { startDate, endDate });
      const averageOrderValue = await this.getMetricByName('average_order_value', { startDate, endDate });
      
      // Get customer metrics
      const customerCount = await this.getMetricByName('customer_count', { startDate, endDate });
      const newCustomers = await this.getMetricByName('new_customer_count', { startDate, endDate });
      
      // Get inventory metrics
      const inventoryValue = await this.getMetricByName('inventory_value', { startDate, endDate });
      const lowStockCount = await this.getMetricByName('low_stock_count', { startDate, endDate });
      
      // Calculate profit margin
      const profitMargin = revenue && revenue.value !== null && revenue.value !== 0
        ? (profit?.value || 0) / revenue.value * 100
        : null;
      
      // Calculate customer acquisition cost
      const marketingExpenses = await this.getMetricByName('marketing_expenses', { startDate, endDate });
      const cac = newCustomers && newCustomers.value !== null && newCustomers.value !== 0
        ? (marketingExpenses?.value || 0) / newCustomers.value
        : null;
      
      return {
        timeframe,
        start_date: startDate,
        end_date: endDate,
        financial: {
          revenue: revenue?.value || null,
          expenses: expenses?.value || null,
          profit: profit?.value || null,
          profit_margin: profitMargin,
        },
        sales: {
          order_count: orderCount?.value || null,
          average_order_value: averageOrderValue?.value || null,
          total_sales: revenue?.value || null,
        },
        customers: {
          customer_count: customerCount?.value || null,
          new_customers: newCustomers?.value || null,
          customer_acquisition_cost: cac,
        },
        inventory: {
          inventory_value: inventoryValue?.value || null,
          low_stock_count: lowStockCount?.value || null,
        },
      };
    } catch (error) {
      logger.error(`Error generating business overview: ${error.message}`);
      throw new AnalyticsError(`Failed to generate business overview: ${error.message}`);
    }
  }

  /**
   * Get sales analytics
   * @param {Object} options - Query options
   * @returns {Object} Sales analytics
   */
  async getSalesAnalytics(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      includeProducts = false,
      includeCategories = false,
      includeCustomers = false,
    } = options;

    // Get date range for the timeframe
    const { startDate, endDate } = this.kpiService.getTimeframeDates(timeframe);
    const period = this.kpiService.getPeriodForTimeframe(timeframe);
    
    try {
      // Get sales metrics
      const salesData = await this.getMetricDataByName('daily_sales', { 
        startDate, 
        endDate,
        period,
      });
      
      const orderCountData = await this.getMetricDataByName('daily_order_count', { 
        startDate, 
        endDate,
        period,
      });
      
      // Calculate totals
      const totalSales = salesData.reduce((sum, d) => sum + d.value, 0);
      const totalOrders = orderCountData.reduce((sum, d) => sum + d.value, 0);
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Get additional data if requested
      let productData = null;
      let categoryData = null;
      let customerData = null;
      
      if (includeProducts) {
        productData = await this.getTopProducts({ startDate, endDate });
      }
      
      if (includeCategories) {
        categoryData = await this.getTopCategories({ startDate, endDate });
      }
      
      if (includeCustomers) {
        customerData = await this.getTopCustomers({ startDate, endDate });
      }
      
      return {
        timeframe,
        start_date: startDate,
        end_date: endDate,
        period,
        total_sales: totalSales,
        total_orders: totalOrders,
        average_order_value: averageOrderValue,
        sales_data: salesData,
        order_count_data: orderCountData,
        products: productData,
        categories: categoryData,
        customers: customerData,
      };
    } catch (error) {
      logger.error(`Error generating sales analytics: ${error.message}`);
      throw new AnalyticsError(`Failed to generate sales analytics: ${error.message}`);
    }
  }

  /**
   * Get financial analytics
   * @param {Object} options - Query options
   * @returns {Object} Financial analytics
   */
  async getFinancialAnalytics(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      includeCategories = false,
      includeAccounts = false,
    } = options;

    // Get date range for the timeframe
    const { startDate, endDate } = this.kpiService.getTimeframeDates(timeframe);
    const period = this.kpiService.getPeriodForTimeframe(timeframe);
    
    try {
      // Get financial metrics
      const revenueData = await this.getMetricDataByName('daily_revenue', { 
        startDate, 
        endDate,
        period,
      });
      
      const expensesData = await this.getMetricDataByName('daily_expenses', { 
        startDate, 
        endDate,
        period,
      });
      
      // Calculate profit data
      const profitData = revenueData.map((d, i) => ({
        date: d.date,
        value: d.value - (expensesData[i]?.value || 0),
        period: d.period,
      }));
      
      // Calculate totals
      const totalRevenue = revenueData.reduce((sum, d) => sum + d.value, 0);
      const totalExpenses = expensesData.reduce((sum, d) => sum + d.value, 0);
      const totalProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      
      // Get additional data if requested
      let expenseCategoriesData = null;
      let revenueCategoriesData = null;
      let accountsData = null;
      
      if (includeCategories) {
        expenseCategoriesData = await this.getExpenseCategories({ startDate, endDate });
        revenueCategoriesData = await this.getRevenueCategories({ startDate, endDate });
      }
      
      if (includeAccounts) {
        accountsData = await this.getAccountsData();
      }
      
      return {
        timeframe,
        start_date: startDate,
        end_date: endDate,
        period,
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        total_profit: totalProfit,
        profit_margin: profitMargin,
        revenue_data: revenueData,
        expenses_data: expensesData,
        profit_data: profitData,
        expense_categories: expenseCategoriesData,
        revenue_categories: revenueCategoriesData,
        accounts: accountsData,
      };
    } catch (error) {
      logger.error(`Error generating financial analytics: ${error.message}`);
      throw new AnalyticsError(`Failed to generate financial analytics: ${error.message}`);
    }
  }

  /**
   * Get inventory analytics
   * @param {Object} options - Query options
   * @returns {Object} Inventory analytics
   */
  async getInventoryAnalytics(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      includeCategories = false,
      includeLowStock = false,
    } = options;

    // Get date range for the timeframe
    const { startDate, endDate } = this.kpiService.getTimeframeDates(timeframe);
    
    try {
      // Get inventory metrics
      const inventoryValue = await this.getMetricByName('inventory_value', { startDate, endDate });
      const inventoryCount = await this.getMetricByName('inventory_count', { startDate, endDate });
      const lowStockCount = await this.getMetricByName('low_stock_count', { startDate, endDate });
      const outOfStockCount = await this.getMetricByName('out_of_stock_count', { startDate, endDate });
      
      // Get inventory turnover
      const inventoryTurnover = await this.getMetricByName('inventory_turnover', { startDate, endDate });
      
      // Get additional data if requested
      let categoryData = null;
      let lowStockItems = null;
      
      if (includeCategories) {
        categoryData = await this.getInventoryCategories();
      }
      
      if (includeLowStock) {
        lowStockItems = await this.getLowStockItems();
      }
      
      return {
        timeframe,
        start_date: startDate,
        end_date: endDate,
        inventory_value: inventoryValue?.value || null,
        inventory_count: inventoryCount?.value || null,
        low_stock_count: lowStockCount?.value || null,
        out_of_stock_count: outOfStockCount?.value || null,
        inventory_turnover: inventoryTurnover?.value || null,
        categories: categoryData,
        low_stock_items: lowStockItems,
      };
    } catch (error) {
      logger.error(`Error generating inventory analytics: ${error.message}`);
      throw new AnalyticsError(`Failed to generate inventory analytics: ${error.message}`);
    }
  }

  /**
   * Get customer analytics
   * @param {Object} options - Query options
   * @returns {Object} Customer analytics
   */
  async getCustomerAnalytics(options = {}) {
    const {
      timeframe = config.kpi.defaultTimeframe,
      includeSegments = false,
      includeRetention = false,
    } = options;

    // Get date range for the timeframe
    const { startDate, endDate } = this.kpiService.getTimeframeDates(timeframe);
    const period = this.kpiService.getPeriodForTimeframe(timeframe);
    
    try {
      // Get customer metrics
      const customerCount = await this.getMetricByName('customer_count', { startDate, endDate });
      const newCustomers = await this.getMetricByName('new_customer_count', { startDate, endDate });
      const activeCustomers = await this.getMetricByName('active_customer_count', { startDate, endDate });
      
      // Get customer acquisition data
      const newCustomerData = await this.getMetricDataByName('daily_new_customers', { 
        startDate, 
        endDate,
        period,
      });
      
      // Get average values
      const averageOrderValue = await this.getMetricByName('average_order_value', { startDate, endDate });
      const customerLifetimeValue = await this.getMetricByName('customer_lifetime_value', { startDate, endDate });
      
      // Get additional data if requested
      let segmentData = null;
      let retentionData = null;
      
      if (includeSegments) {
        segmentData = await this.getCustomerSegments();
      }
      
      if (includeRetention) {
        retentionData = await this.getCustomerRetention({ startDate, endDate });
      }
      
      return {
        timeframe,
        start_date: startDate,
        end_date: endDate,
        period,
        customer_count: customerCount?.value || null,
        new_customers: newCustomers?.value || null,
        active_customers: activeCustomers?.value || null,
        average_order_value: averageOrderValue?.value || null,
        customer_lifetime_value: customerLifetimeValue?.value || null,
        new_customer_data: newCustomerData,
        segments: segmentData,
        retention: retentionData,
      };
    } catch (error) {
      logger.error(`Error generating customer analytics: ${error.message}`);
      throw new AnalyticsError(`Failed to generate customer analytics: ${error.message}`);
    }
  }

  /**
   * Get metric by name
   * @param {string} name - Metric name
   * @param {Object} options - Query options
   * @returns {Object} Metric value
   * @private
   */
  async getMetricByName(name, options) {
    try {
      // Find metric by name
      const metric = await this.Metric.findOne({
        where: { name },
      });
      
      if (!metric) {
        logger.warn(`Metric not found: ${name}`);
        return null;
      }
      
      // Calculate metric value
      return this.metricService.calculateMetricValue(metric.id, options);
    } catch (error) {
      logger.error(`Error getting metric ${name}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get metric data by name
   * @param {string} name - Metric name
   * @param {Object} options - Query options
   * @returns {Array} Metric data
   * @private
   */
  async getMetricDataByName(name, options) {
    try {
      // Find metric by name
      const metric = await this.Metric.findOne({
        where: { name },
      });
      
      if (!metric) {
        logger.warn(`Metric not found: ${name}`);
        return [];
      }
      
      // Get metric data
      return this.metricService.getMetricData(metric.id, options);
    } catch (error) {
      logger.error(`Error getting metric data for ${name}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get top products
   * @param {Object} options - Query options
   * @returns {Array} Top products
   * @private
   */
  async getTopProducts(options) {
    // This would be implemented with a call to the Order service
    // For now, return mock data
    return [
      { id: 'p1', name: 'Product 1', sales: 1200, orders: 120 },
      { id: 'p2', name: 'Product 2', sales: 980, orders: 98 },
      { id: 'p3', name: 'Product 3', sales: 850, orders: 85 },
      { id: 'p4', name: 'Product 4', sales: 720, orders: 72 },
      { id: 'p5', name: 'Product 5', sales: 650, orders: 65 },
    ];
  }

  /**
   * Get top categories
   * @param {Object} options - Query options
   * @returns {Array} Top categories
   * @private
   */
  async getTopCategories(options) {
    // This would be implemented with a call to the Order service
    // For now, return mock data
    return [
      { id: 'c1', name: 'Category 1', sales: 2500, orders: 250 },
      { id: 'c2', name: 'Category 2', sales: 1800, orders: 180 },
      { id: 'c3', name: 'Category 3', sales: 1200, orders: 120 },
      { id: 'c4', name: 'Category 4', sales: 900, orders: 90 },
      { id: 'c5', name: 'Category 5', sales: 600, orders: 60 },
    ];
  }

  /**
   * Get top customers
   * @param {Object} options - Query options
   * @returns {Array} Top customers
   * @private
   */
  async getTopCustomers(options) {
    // This would be implemented with a call to the CRM service
    // For now, return mock data
    return [
      { id: 'cust1', name: 'Customer 1', sales: 5000, orders: 12 },
      { id: 'cust2', name: 'Customer 2', sales: 3500, orders: 8 },
      { id: 'cust3', name: 'Customer 3', sales: 2800, orders: 6 },
      { id: 'cust4', name: 'Customer 4', sales: 2200, orders: 5 },
      { id: 'cust5', name: 'Customer 5', sales: 1800, orders: 4 },
    ];
  }

  /**
   * Get expense categories
   * @param {Object} options - Query options
   * @returns {Array} Expense categories
   * @private
   */
  async getExpenseCategories(options) {
    // This would be implemented with a call to the Finance service
    // For now, return mock data
    return [
      { id: 'ec1', name: 'Operations', amount: 12000 },
      { id: 'ec2', name: 'Marketing', amount: 8500 },
      { id: 'ec3', name: 'Payroll', amount: 25000 },
      { id: 'ec4', name: 'Inventory', amount: 15000 },
      { id: 'ec5', name: 'Rent', amount: 5000 },
    ];
  }

  /**
   * Get revenue categories
   * @param {Object} options - Query options
   * @returns {Array} Revenue categories
   * @private
   */
  async getRevenueCategories(options) {
    // This would be implemented with a call to the Finance service
    // For now, return mock data
    return [
      { id: 'rc1', name: 'Product Sales', amount: 45000 },
      { id: 'rc2', name: 'Services', amount: 15000 },
      { id: 'rc3', name: 'Subscriptions', amount: 8000 },
      { id: 'rc4', name: 'Other', amount: 2000 },
    ];
  }

  /**
   * Get accounts data
   * @returns {Array} Accounts data
   * @private
   */
  async getAccountsData() {
    // This would be implemented with a call to the Finance service
    // For now, return mock data
    return [
      { id: 'a1', name: 'Main Account', balance: 35000 },
      { id: 'a2', name: 'Savings Account', balance: 120000 },
      { id: 'a3', name: 'Petty Cash', balance: 2500 },
    ];
  }

  /**
   * Get inventory categories
   * @returns {Array} Inventory categories
   * @private
   */
  async getInventoryCategories() {
    // This would be implemented with a call to the Inventory service
    // For now, return mock data
    return [
      { id: 'ic1', name: 'Category 1', count: 120, value: 24000 },
      { id: 'ic2', name: 'Category 2', count: 85, value: 17000 },
      { id: 'ic3', name: 'Category 3', count: 65, value: 13000 },
      { id: 'ic4', name: 'Category 4', count: 45, value: 9000 },
      { id: 'ic5', name: 'Category 5', count: 30, value: 6000 },
    ];
  }

  /**
   * Get low stock items
   * @returns {Array} Low stock items
   * @private
   */
  async getLowStockItems() {
    // This would be implemented with a call to the Inventory service
    // For now, return mock data
    return [
      { id: 'p1', name: 'Product 1', stock: 5, threshold: 10 },
      { id: 'p2', name: 'Product 2', stock: 3, threshold: 15 },
      { id: 'p3', name: 'Product 3', stock: 2, threshold: 10 },
      { id: 'p4', name: 'Product 4', stock: 1, threshold: 5 },
      { id: 'p5', name: 'Product 5', stock: 0, threshold: 8 },
    ];
  }

  /**
   * Get customer segments
   * @returns {Array} Customer segments
   * @private
   */
  async getCustomerSegments() {
    // This would be implemented with a call to the CRM service
    // For now, return mock data
    return [
      { id: 's1', name: 'New Customers', count: 120 },
      { id: 's2', name: 'Regular Customers', count: 350 },
      { id: 's3', name: 'VIP Customers', count: 50 },
      { id: 's4', name: 'Inactive Customers', count: 200 },
    ];
  }

  /**
   * Get customer retention
   * @param {Object} options - Query options
   * @returns {Object} Customer retention
   * @private
   */
  async getCustomerRetention(options) {
    // This would be implemented with a call to the CRM service
    // For now, return mock data
    return {
      retention_rate: 75,
      churn_rate: 25,
      cohorts: [
        { month: '2023-01', new_customers: 50, retained_after_1m: 40, retained_after_3m: 35, retained_after_6m: 30 },
        { month: '2023-02', new_customers: 45, retained_after_1m: 38, retained_after_3m: 32, retained_after_6m: null },
        { month: '2023-03', new_customers: 60, retained_after_1m: 48, retained_after_3m: null, retained_after_6m: null },
        { month: '2023-04', new_customers: 55, retained_after_1m: null, retained_after_3m: null, retained_after_6m: null },
      ],
    };
  }
}

module.exports = AnalyticsService;
