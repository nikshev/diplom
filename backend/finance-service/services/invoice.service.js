/**
 * Invoice service for Finance Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const PDFDocument = require('pdfkit');

/**
 * Invoice service
 */
class InvoiceService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Invoice = db.Invoice;
    this.InvoiceItem = db.InvoiceItem;
    this.InvoicePayment = db.InvoicePayment;
    this.Account = db.Account;
    this.Transaction = db.Transaction;
    this.TransactionCategory = db.TransactionCategory;
  }

  /**
   * Get invoices with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Object} Invoices with pagination
   */
  async getInvoices(options) {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customer_id = customerId;
    }

    if (startDate && endDate) {
      where.issue_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.issue_date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.issue_date = {
        [Op.lte]: new Date(endDate),
      };
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.total_amount = {};

      if (minAmount !== undefined) {
        where.total_amount[Op.gte] = minAmount;
      }

      if (maxAmount !== undefined) {
        where.total_amount[Op.lte] = maxAmount;
      }
    }

    // Get invoices
    const { count, rows } = await this.Invoice.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      invoices: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get invoice by ID
   * @param {string} id - Invoice ID
   * @param {Object} options - Query options
   * @returns {Object} Invoice
   */
  async getInvoiceById(id, options = {}) {
    const {
      includeItems = true,
      includePayments = true,
      includeCustomer = true,
    } = options;

    const include = [];

    if (includeItems) {
      include.push({
        model: this.InvoiceItem,
        as: 'items',
      });
    }

    if (includePayments) {
      include.push({
        model: this.InvoicePayment,
        as: 'payments',
      });
    }

    // Note: Customer is assumed to be in a different service, so we're not including it directly
    // In a real implementation, you might want to fetch customer data from the CRM service

    const invoice = await this.Invoice.findByPk(id, {
      include,
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // If customer details are requested and not included in the invoice model,
    // fetch them from the CRM service
    let customerDetails = null;
    if (includeCustomer && invoice.customer_id) {
      // This would be implemented with an API call to the CRM service
      // For now, we'll just return the customer ID
      customerDetails = {
        id: invoice.customer_id,
        // Other customer details would be fetched from CRM service
      };
    }

    const invoiceData = invoice.get({ plain: true });

    // Calculate totals
    if (includeItems && invoiceData.items) {
      let subtotal = 0;
      let tax = 0;
      let discount = 0;

      invoiceData.items.forEach(item => {
        const itemSubtotal = item.quantity * item.unit_price;
        const itemTax = itemSubtotal * (item.tax_rate || 0) / 100;
        const itemDiscount = itemSubtotal * (item.discount || 0) / 100;

        item.subtotal = itemSubtotal;
        item.tax_amount = itemTax;
        item.discount_amount = itemDiscount;
        item.total = itemSubtotal + itemTax - itemDiscount;

        subtotal += itemSubtotal;
        tax += itemTax;
        discount += itemDiscount;
      });

      invoiceData.subtotal = subtotal;
      invoiceData.tax = tax;
      invoiceData.discount = discount;
      invoiceData.total = subtotal + tax - discount;
    }

    // Calculate payments
    if (includePayments && invoiceData.payments) {
      let totalPaid = 0;

      invoiceData.payments.forEach(payment => {
        totalPaid += payment.amount;
      });

      invoiceData.total_paid = totalPaid;
      invoiceData.balance_due = (invoiceData.total || invoiceData.total_amount) - totalPaid;
    }

    // Add customer details if requested
    if (includeCustomer && customerDetails) {
      invoiceData.customer = customerDetails;
    }

    return invoiceData;
  }

  /**
   * Create invoice
   * @param {Object} invoiceData - Invoice data
   * @returns {Object} Created invoice
   */
  async createInvoice(invoiceData) {
    // Validate customer
    // In a real implementation, you would validate the customer ID with the CRM service

    // Validate items
    if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
      throw new BadRequestError('Invoice must have at least one item');
    }

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Calculate totals
      let subtotal = 0;
      let tax = 0;
      let discount = 0;

      invoiceData.items.forEach(item => {
        const itemSubtotal = item.quantity * item.unit_price;
        const itemTax = itemSubtotal * (item.tax_rate || 0) / 100;
        const itemDiscount = itemSubtotal * (item.discount || 0) / 100;

        subtotal += itemSubtotal;
        tax += itemTax;
        discount += itemDiscount;
      });

      const totalAmount = subtotal + tax - discount;

      // Generate invoice number if not provided
      if (!invoiceData.invoice_number) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        // Get the count of invoices for this month
        const invoiceCount = await this.Invoice.count({
          where: {
            invoice_number: {
              [Op.like]: `INV-${year}${month}-%`,
            },
          },
        });
        
        // Generate invoice number
        const sequenceNumber = String(invoiceCount + 1).padStart(4, '0');
        invoiceData.invoice_number = `INV-${year}${month}-${sequenceNumber}`;
      }

      // Set default values
      if (!invoiceData.issue_date) {
        invoiceData.issue_date = new Date();
      }

      if (!invoiceData.status) {
        invoiceData.status = 'draft';
      }

      if (!invoiceData.currency) {
        invoiceData.currency = 'UAH';
      }

      // Create invoice
      const invoice = await this.Invoice.create({
        ...invoiceData,
        subtotal_amount: subtotal,
        tax_amount: tax,
        discount_amount: discount,
        total_amount: totalAmount,
      }, { transaction: t });

      // Create invoice items
      const items = await Promise.all(
        invoiceData.items.map(item => this.InvoiceItem.create({
          ...item,
          invoice_id: invoice.id,
          subtotal: item.quantity * item.unit_price,
          tax_amount: (item.quantity * item.unit_price) * (item.tax_rate || 0) / 100,
          discount_amount: (item.quantity * item.unit_price) * (item.discount || 0) / 100,
          total: (item.quantity * item.unit_price) * (1 + (item.tax_rate || 0) / 100) * (1 - (item.discount || 0) / 100),
        }, { transaction: t }))
      );

      // Commit transaction
      await t.commit();

      // Return invoice with items
      return this.getInvoiceById(invoice.id);
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Update invoice
   * @param {string} id - Invoice ID
   * @param {Object} invoiceData - Invoice data
   * @returns {Object} Updated invoice
   */
  async updateInvoice(id, invoiceData) {
    const invoice = await this.Invoice.findByPk(id, {
      include: [
        {
          model: this.InvoiceItem,
          as: 'items',
        },
        {
          model: this.InvoicePayment,
          as: 'payments',
        },
      ],
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // Check if invoice can be updated
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      throw new BadRequestError(`Cannot update invoice with status ${invoice.status}`);
    }

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Update invoice
      await invoice.update(invoiceData, { transaction: t });

      // Update items if provided
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        // Delete existing items
        await this.InvoiceItem.destroy({
          where: {
            invoice_id: id,
          },
          transaction: t,
        });

        // Create new items
        await Promise.all(
          invoiceData.items.map(item => this.InvoiceItem.create({
            ...item,
            invoice_id: id,
            subtotal: item.quantity * item.unit_price,
            tax_amount: (item.quantity * item.unit_price) * (item.tax_rate || 0) / 100,
            discount_amount: (item.quantity * item.unit_price) * (item.discount || 0) / 100,
            total: (item.quantity * item.unit_price) * (1 + (item.tax_rate || 0) / 100) * (1 - (item.discount || 0) / 100),
          }, { transaction: t }))
        );

        // Recalculate totals
        let subtotal = 0;
        let tax = 0;
        let discount = 0;

        invoiceData.items.forEach(item => {
          const itemSubtotal = item.quantity * item.unit_price;
          const itemTax = itemSubtotal * (item.tax_rate || 0) / 100;
          const itemDiscount = itemSubtotal * (item.discount || 0) / 100;

          subtotal += itemSubtotal;
          tax += itemTax;
          discount += itemDiscount;
        });

        const totalAmount = subtotal + tax - discount;

        // Update invoice totals
        await invoice.update({
          subtotal_amount: subtotal,
          tax_amount: tax,
          discount_amount: discount,
          total_amount: totalAmount,
        }, { transaction: t });
      }

      // Commit transaction
      await t.commit();

      // Return updated invoice
      return this.getInvoiceById(id);
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Delete invoice
   * @param {string} id - Invoice ID
   * @returns {boolean} Success
   */
  async deleteInvoice(id) {
    const invoice = await this.Invoice.findByPk(id, {
      include: [
        {
          model: this.InvoicePayment,
          as: 'payments',
        },
      ],
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // Check if invoice can be deleted
    if (invoice.status === 'paid') {
      throw new BadRequestError('Cannot delete paid invoice');
    }

    if (invoice.payments && invoice.payments.length > 0) {
      throw new BadRequestError('Cannot delete invoice with payments');
    }

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Delete invoice items
      await this.InvoiceItem.destroy({
        where: {
          invoice_id: id,
        },
        transaction: t,
      });

      // Delete invoice
      await invoice.destroy({ transaction: t });

      // Commit transaction
      await t.commit();

      return true;
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get invoices by customer
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Object} Invoices with pagination
   */
  async getInvoicesByCustomer(customerId, options) {
    // Validate customer
    // In a real implementation, you would validate the customer ID with the CRM service

    return this.getInvoices({
      ...options,
      customerId,
    });
  }

  /**
   * Get invoices by status
   * @param {string} status - Invoice status
   * @param {Object} options - Query options
   * @returns {Object} Invoices with pagination
   */
  async getInvoicesByStatus(status, options) {
    return this.getInvoices({
      ...options,
      status,
    });
  }

  /**
   * Get invoices by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Object} Invoices with pagination
   */
  async getInvoicesByDateRange(startDate, endDate, options) {
    return this.getInvoices({
      ...options,
      startDate,
      endDate,
    });
  }

  /**
   * Mark invoice as paid
   * @param {string} id - Invoice ID
   * @param {Object} paymentData - Payment data
   * @returns {Object} Updated invoice
   */
  async markInvoiceAsPaid(id, paymentData) {
    const invoice = await this.Invoice.findByPk(id, {
      include: [
        {
          model: this.InvoiceItem,
          as: 'items',
        },
        {
          model: this.InvoicePayment,
          as: 'payments',
        },
      ],
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // Check if invoice can be marked as paid
    if (invoice.status === 'paid') {
      throw new BadRequestError('Invoice is already paid');
    }

    if (invoice.status === 'cancelled') {
      throw new BadRequestError('Cannot mark cancelled invoice as paid');
    }

    // Calculate total paid
    let totalPaid = 0;
    if (invoice.payments) {
      invoice.payments.forEach(payment => {
        totalPaid += payment.amount;
      });
    }

    // Calculate remaining amount
    const remainingAmount = invoice.total_amount - totalPaid;

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Create payment
      const payment = await this.InvoicePayment.create({
        invoice_id: id,
        amount: remainingAmount,
        payment_method: paymentData.paymentMethod || 'other',
        payment_date: paymentData.paymentDate || new Date(),
        notes: paymentData.notes || 'Full payment',
        created_by: paymentData.userId,
      }, { transaction: t });

      // Update invoice status
      await invoice.update({
        status: 'paid',
        paid_date: payment.payment_date,
      }, { transaction: t });

      // Create transaction if account is specified
      if (paymentData.accountId) {
        // Find or create income category for invoice payments
        let category = await this.TransactionCategory.findOne({
          where: {
            name: 'Invoice Payment',
            type: 'income',
          },
        });

        if (!category) {
          category = await this.TransactionCategory.create({
            name: 'Invoice Payment',
            type: 'income',
            is_active: true,
          }, { transaction: t });
        }

        // Create transaction
        await this.Transaction.create({
          type: 'income',
          amount: remainingAmount,
          currency: invoice.currency,
          category_id: category.id,
          account_id: paymentData.accountId,
          description: `Payment for invoice ${invoice.invoice_number}`,
          transaction_date: payment.payment_date,
          reference_id: id,
          reference_type: 'invoice',
          created_by: paymentData.userId,
        }, { transaction: t });

        // Update account balance
        const account = await this.Account.findByPk(paymentData.accountId);
        if (account) {
          await account.increment('balance', { by: remainingAmount, transaction: t });
        }
      }

      // Commit transaction
      await t.commit();

      // Return updated invoice
      return this.getInvoiceById(id);
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Mark invoice as cancelled
   * @param {string} id - Invoice ID
   * @param {string} reason - Cancellation reason
   * @param {string} userId - User ID
   * @returns {Object} Updated invoice
   */
  async markInvoiceAsCancelled(id, reason, userId) {
    const invoice = await this.Invoice.findByPk(id, {
      include: [
        {
          model: this.InvoicePayment,
          as: 'payments',
        },
      ],
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // Check if invoice can be cancelled
    if (invoice.status === 'cancelled') {
      throw new BadRequestError('Invoice is already cancelled');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestError('Cannot cancel paid invoice');
    }

    if (invoice.payments && invoice.payments.length > 0) {
      throw new BadRequestError('Cannot cancel invoice with payments');
    }

    // Update invoice
    await invoice.update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_by: userId,
      cancelled_at: new Date(),
    });

    // Return updated invoice
    return this.getInvoiceById(id);
  }

  /**
   * Add invoice payment
   * @param {string} id - Invoice ID
   * @param {Object} paymentData - Payment data
   * @returns {Object} Created payment
   */
  async addInvoicePayment(id, paymentData) {
    const invoice = await this.Invoice.findByPk(id, {
      include: [
        {
          model: this.InvoicePayment,
          as: 'payments',
        },
      ],
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    // Check if invoice can receive payments
    if (invoice.status === 'cancelled') {
      throw new BadRequestError('Cannot add payment to cancelled invoice');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestError('Invoice is already paid');
    }

    // Calculate total paid
    let totalPaid = 0;
    if (invoice.payments) {
      invoice.payments.forEach(payment => {
        totalPaid += payment.amount;
      });
    }

    // Calculate remaining amount
    const remainingAmount = invoice.total_amount - totalPaid;

    // Validate payment amount
    if (paymentData.amount > remainingAmount) {
      throw new BadRequestError(`Payment amount exceeds remaining amount (${remainingAmount})`);
    }

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Create payment
      const payment = await this.InvoicePayment.create({
        invoice_id: id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method || 'other',
        payment_date: paymentData.payment_date || new Date(),
        reference: paymentData.reference,
        notes: paymentData.notes,
        created_by: paymentData.created_by,
      }, { transaction: t });

      // Update total paid
      totalPaid += paymentData.amount;

      // Check if invoice is fully paid
      if (totalPaid >= invoice.total_amount) {
        await invoice.update({
          status: 'paid',
          paid_date: payment.payment_date,
        }, { transaction: t });
      } else {
        await invoice.update({
          status: 'partial',
        }, { transaction: t });
      }

      // Create transaction if account is specified
      if (paymentData.account_id) {
        // Find or create income category for invoice payments
        let category = await this.TransactionCategory.findOne({
          where: {
            name: 'Invoice Payment',
            type: 'income',
          },
        });

        if (!category) {
          category = await this.TransactionCategory.create({
            name: 'Invoice Payment',
            type: 'income',
            is_active: true,
          }, { transaction: t });
        }

        // Create transaction
        await this.Transaction.create({
          type: 'income',
          amount: paymentData.amount,
          currency: invoice.currency,
          category_id: category.id,
          account_id: paymentData.account_id,
          description: `Payment for invoice ${invoice.invoice_number}`,
          transaction_date: payment.payment_date,
          reference_id: id,
          reference_type: 'invoice',
          created_by: paymentData.created_by,
        }, { transaction: t });

        // Update account balance
        const account = await this.Account.findByPk(paymentData.account_id);
        if (account) {
          await account.increment('balance', { by: paymentData.amount, transaction: t });
        }
      }

      // Commit transaction
      await t.commit();

      return payment;
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get invoice payments
   * @param {string} id - Invoice ID
   * @returns {Array} Payments
   */
  async getInvoicePayments(id) {
    const invoice = await this.Invoice.findByPk(id);
    if (!invoice) {
      throw new NotFoundError(`Invoice with ID ${id} not found`);
    }

    const payments = await this.InvoicePayment.findAll({
      where: {
        invoice_id: id,
      },
      order: [['payment_date', 'DESC']],
    });

    return payments;
  }

  /**
   * Generate invoice PDF
   * @param {string} id - Invoice ID
   * @returns {Buffer} PDF buffer
   */
  async generateInvoicePdf(id) {
    const invoice = await this.getInvoiceById(id, {
      includeItems: true,
      includePayments: true,
      includeCustomer: true,
    });

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    
    // Add content to PDF
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoice_number}`);
    doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status.toUpperCase()}`);
    doc.moveDown();
    
    // Customer details
    doc.text('Bill To:');
    if (invoice.customer) {
      doc.text(`Customer ID: ${invoice.customer.id}`);
      // Add more customer details if available
    } else {
      doc.text(`Customer ID: ${invoice.customer_id}`);
    }
    doc.moveDown();
    
    // Items table
    doc.text('Items:', { underline: true });
    doc.moveDown(0.5);
    
    // Table headers
    const tableTop = doc.y;
    const itemX = 50;
    const descriptionX = 100;
    const quantityX = 280;
    const priceX = 350;
    const amountX = 450;
    
    doc.font('Helvetica-Bold');
    doc.text('Item', itemX, tableTop);
    doc.text('Description', descriptionX, tableTop);
    doc.text('Qty', quantityX, tableTop);
    doc.text('Price', priceX, tableTop);
    doc.text('Amount', amountX, tableTop);
    doc.moveDown();
    
    // Table rows
    doc.font('Helvetica');
    let tableY = doc.y;
    
    invoice.items.forEach((item, i) => {
      const y = tableY + i * 20;
      doc.text(i + 1, itemX, y);
      doc.text(item.description, descriptionX, y);
      doc.text(item.quantity.toString(), quantityX, y);
      doc.text(item.unit_price.toFixed(2), priceX, y);
      doc.text(item.total.toFixed(2), amountX, y);
    });
    
    doc.moveDown(invoice.items.length * 0.8 + 1);
    
    // Totals
    const totalsX = 350;
    let totalsY = doc.y;
    
    doc.text('Subtotal:', totalsX, totalsY);
    doc.text(invoice.subtotal.toFixed(2), amountX, totalsY);
    totalsY += 20;
    
    doc.text('Tax:', totalsX, totalsY);
    doc.text(invoice.tax.toFixed(2), amountX, totalsY);
    totalsY += 20;
    
    doc.text('Discount:', totalsX, totalsY);
    doc.text(invoice.discount.toFixed(2), amountX, totalsY);
    totalsY += 20;
    
    doc.font('Helvetica-Bold');
    doc.text('Total:', totalsX, totalsY);
    doc.text(invoice.total.toFixed(2), amountX, totalsY);
    totalsY += 20;
    
    if (invoice.payments && invoice.payments.length > 0) {
      doc.font('Helvetica');
      doc.text('Paid:', totalsX, totalsY);
      doc.text(invoice.total_paid.toFixed(2), amountX, totalsY);
      totalsY += 20;
      
      doc.font('Helvetica-Bold');
      doc.text('Balance Due:', totalsX, totalsY);
      doc.text(invoice.balance_due.toFixed(2), amountX, totalsY);
    }
    
    doc.moveDown(3);
    
    // Payment information
    doc.font('Helvetica');
    doc.text('Payment Information:', { underline: true });
    doc.text('Please include the invoice number with your payment.');
    doc.moveDown();
    
    // Thank you note
    doc.text('Thank you for your business!', { align: 'center' });
    
    // Finalize PDF
    doc.end();
    
    return Buffer.concat(buffers);
  }

  /**
   * Send invoice email
   * @param {string} id - Invoice ID
   * @param {string} email - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @returns {Object} Result
   */
  async sendInvoiceEmail(id, email, subject, message) {
    const invoice = await this.getInvoiceById(id);
    
    // Generate PDF
    const pdfBuffer = await this.generateInvoicePdf(id);
    
    // In a real implementation, you would send an email with the PDF attachment
    // For now, we'll just return a success message
    
    return {
      success: true,
      message: `Invoice ${invoice.invoice_number} sent to ${email}`,
      invoice_id: id,
      email,
    };
  }
}

module.exports = InvoiceService;
