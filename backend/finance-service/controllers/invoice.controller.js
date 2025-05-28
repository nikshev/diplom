/**
 * Invoice controller for Finance Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Invoice controller
 */
class InvoiceController {
  /**
   * Constructor
   * @param {Object} invoiceService - Invoice service
   */
  constructor(invoiceService) {
    this.invoiceService = invoiceService;
    
    // Bind methods to this instance
    this.getInvoices = this.getInvoices.bind(this);
    this.getInvoiceById = this.getInvoiceById.bind(this);
    this.createInvoice = this.createInvoice.bind(this);
    this.updateInvoice = this.updateInvoice.bind(this);
    this.deleteInvoice = this.deleteInvoice.bind(this);
    this.getInvoicesByCustomer = this.getInvoicesByCustomer.bind(this);
    this.getInvoicesByStatus = this.getInvoicesByStatus.bind(this);
    this.getInvoicesByDateRange = this.getInvoicesByDateRange.bind(this);
    this.markInvoiceAsPaid = this.markInvoiceAsPaid.bind(this);
    this.markInvoiceAsCancelled = this.markInvoiceAsCancelled.bind(this);
    this.addInvoicePayment = this.addInvoicePayment.bind(this);
    this.getInvoicePayments = this.getInvoicePayments.bind(this);
    this.generateInvoicePdf = this.generateInvoicePdf.bind(this);
    this.sendInvoiceEmail = this.sendInvoiceEmail.bind(this);
  }

  /**
   * Get invoices with pagination and filtering
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInvoices(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        customerId: req.query.customerId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.invoiceService.getInvoices(options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getInvoices controller:', error);
      next(error);
    }
  }

  /**
   * Get invoice by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInvoiceById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        includeItems: req.query.includeItems !== 'false',
        includePayments: req.query.includePayments !== 'false',
        includeCustomer: req.query.includeCustomer !== 'false',
      };

      const invoice = await this.invoiceService.getInvoiceById(id, options);

      res.status(StatusCodes.OK).json(invoice);
    } catch (error) {
      logger.error(`Error in getInvoiceById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create invoice
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createInvoice(req, res, next) {
    try {
      const invoiceData = req.body;
      const userId = req.user.id;
      
      // Add user ID to invoice data
      invoiceData.created_by = userId;
      
      const invoice = await this.invoiceService.createInvoice(invoiceData);

      res.status(StatusCodes.CREATED).json(invoice);
    } catch (error) {
      logger.error('Error in createInvoice controller:', error);
      next(error);
    }
  }

  /**
   * Update invoice
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const invoiceData = req.body;
      const invoice = await this.invoiceService.updateInvoice(id, invoiceData);

      res.status(StatusCodes.OK).json(invoice);
    } catch (error) {
      logger.error(`Error in updateInvoice controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete invoice
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteInvoice(req, res, next) {
    try {
      const { id } = req.params;
      await this.invoiceService.deleteInvoice(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteInvoice controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get invoices by customer
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInvoicesByCustomer(req, res, next) {
    try {
      const { customerId } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const result = await this.invoiceService.getInvoicesByCustomer(customerId, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getInvoicesByCustomer controller for customer ID ${req.params.customerId}:`, error);
      next(error);
    }
  }

  /**
   * Get invoices by status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInvoicesByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        customerId: req.query.customerId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const result = await this.invoiceService.getInvoicesByStatus(status, options);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in getInvoicesByStatus controller for status ${req.params.status}:`, error);
      next(error);
    }
  }

  /**
   * Get invoices by date range
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInvoicesByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Start date and end date are required',
        });
      }
      
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        customerId: req.query.customerId,
      };

      const result = await this.invoiceService.getInvoicesByDateRange(
        startDate,
        endDate,
        options
      );

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error('Error in getInvoicesByDateRange controller:', error);
      next(error);
    }
  }

  /**
   * Mark invoice as paid
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async markInvoiceAsPaid(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentMethod, paymentDate, notes } = req.body;
      const userId = req.user.id;

      const invoice = await this.invoiceService.markInvoiceAsPaid(
        id,
        {
          paymentMethod,
          paymentDate: paymentDate || new Date(),
          notes,
          userId,
        }
      );

      res.status(StatusCodes.OK).json(invoice);
    } catch (error) {
      logger.error(`Error in markInvoiceAsPaid controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Mark invoice as cancelled
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async markInvoiceAsCancelled(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const invoice = await this.invoiceService.markInvoiceAsCancelled(
        id,
        reason || 'No reason provided',
        userId
      );

      res.status(StatusCodes.OK).json(invoice);
    } catch (error) {
      logger.error(`Error in markInvoiceAsCancelled controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Add invoice payment
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async addInvoicePayment(req, res, next) {
    try {
      const { id } = req.params;
      const paymentData = req.body;
      const userId = req.user.id;
      
      // Add user ID to payment data
      paymentData.created_by = userId;
      
      const payment = await this.invoiceService.addInvoicePayment(id, paymentData);

      res.status(StatusCodes.CREATED).json(payment);
    } catch (error) {
      logger.error(`Error in addInvoicePayment controller for invoice ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Get invoice payments
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getInvoicePayments(req, res, next) {
    try {
      const { id } = req.params;
      const payments = await this.invoiceService.getInvoicePayments(id);

      res.status(StatusCodes.OK).json(payments);
    } catch (error) {
      logger.error(`Error in getInvoicePayments controller for invoice ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Generate invoice PDF
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async generateInvoicePdf(req, res, next) {
    try {
      const { id } = req.params;
      const pdf = await this.invoiceService.generateInvoicePdf(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
      res.status(StatusCodes.OK).send(pdf);
    } catch (error) {
      logger.error(`Error in generateInvoicePdf controller for invoice ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Send invoice email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async sendInvoiceEmail(req, res, next) {
    try {
      const { id } = req.params;
      const { email, subject, message } = req.body;

      if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Email is required',
        });
      }

      const result = await this.invoiceService.sendInvoiceEmail(
        id,
        email,
        subject || 'Your Invoice',
        message || 'Please find your invoice attached.'
      );

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      logger.error(`Error in sendInvoiceEmail controller for invoice ID ${req.params.id}:`, error);
      next(error);
    }
  }
}

module.exports = InvoiceController;
