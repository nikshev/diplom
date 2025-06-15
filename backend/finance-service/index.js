require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const Decimal = require('decimal.js');

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'finance-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8005;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'erp_finance',
  process.env.DB_USER || 'admin',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// Define Transaction model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  referenceId: {
    type: DataTypes.STRING
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'completed'
  }
});

// Define Invoice model
const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  orderId: {
    type: DataTypes.UUID
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  tax: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  issueDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'draft'
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Define Budget model
const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  }
});

// Sync models with database
sequelize.sync({ alter: true })
  .then(() => {
    logger.info('Database synchronized');
  })
  .catch(err => {
    logger.error('Error synchronizing database:', err);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'finance-service' });
});

// Create transaction endpoint
app.post('/api/transactions', async (req, res) => {
  try {
    const { type, amount, category, description, referenceId, paymentMethod } = req.body;
    
    // Create transaction
    const transaction = await Transaction.create({
      type,
      amount,
      category,
      description,
      referenceId,
      paymentMethod
    });
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    logger.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all transactions endpoint
app.get('/api/transactions', async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    
    // Build query conditions
    const whereConditions = {};
    
    if (startDate && endDate) {
      whereConditions.date = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.date = {
        [Sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.date = {
        [Sequelize.Op.lte]: new Date(endDate)
      };
    }
    
    if (type) {
      whereConditions.type = type;
    }
    
    if (category) {
      whereConditions.category = category;
    }
    
    const transactions = await Transaction.findAll({
      where: whereConditions,
      order: [['date', 'DESC']]
    });
    
    res.status(200).json({ transactions });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create invoice endpoint
app.post('/api/invoices', async (req, res) => {
  try {
    const { customerId, orderId, amount, tax, dueDate, notes } = req.body;
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Calculate total amount
    const taxAmount = new Decimal(tax || 0);
    const invoiceAmount = new Decimal(amount);
    const totalAmount = invoiceAmount.plus(taxAmount);
    
    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      customerId,
      orderId,
      amount,
      tax: tax || 0,
      totalAmount: totalAmount.toNumber(),
      dueDate,
      notes
    });
    
    res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all invoices endpoint
app.get('/api/invoices', async (req, res) => {
  try {
    const { status, customerId } = req.query;
    
    // Build query conditions
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (customerId) {
      whereConditions.customerId = customerId;
    }
    
    const invoices = await Invoice.findAll({
      where: whereConditions,
      order: [['issueDate', 'DESC']]
    });
    
    res.status(200).json({ invoices });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update invoice status endpoint
app.patch('/api/invoices/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const invoice = await Invoice.findOne({ where: { id } });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    invoice.status = status;
    await invoice.save();
    
    // If status is 'paid', create a transaction
    if (status === 'paid') {
      await Transaction.create({
        type: 'income',
        amount: invoice.totalAmount,
        category: 'Sales',
        description: `Payment for invoice ${invoice.invoiceNumber}`,
        referenceId: invoice.id,
        status: 'completed'
      });
    }
    
    res.status(200).json({
      message: 'Invoice status updated successfully',
      invoice
    });
  } catch (error) {
    logger.error('Error updating invoice status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create budget endpoint
app.post('/api/budgets', async (req, res) => {
  try {
    const { name, category, amount, startDate, endDate, notes } = req.body;
    
    // Create budget
    const budget = await Budget.create({
      name,
      category,
      amount,
      startDate,
      endDate,
      notes
    });
    
    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    logger.error('Error creating budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get financial summary endpoint
app.get('/api/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to current month if no dates provided
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const start = startDate ? new Date(startDate) : firstDayOfMonth;
    const end = endDate ? new Date(endDate) : lastDayOfMonth;
    
    // Get all transactions in date range
    const transactions = await Transaction.findAll({
      where: {
        date: {
          [Sequelize.Op.between]: [start, end]
        }
      }
    });
    
    // Calculate totals
    let totalIncome = new Decimal(0);
    let totalExpense = new Decimal(0);
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome = totalIncome.plus(transaction.amount);
      } else {
        totalExpense = totalExpense.plus(transaction.amount);
      }
    });
    
    const netIncome = totalIncome.minus(totalExpense);
    
    // Get unpaid invoices
    const unpaidInvoices = await Invoice.findAll({
      where: {
        status: {
          [Sequelize.Op.in]: ['sent', 'overdue']
        }
      }
    });
    
    let totalReceivable = new Decimal(0);
    unpaidInvoices.forEach(invoice => {
      totalReceivable = totalReceivable.plus(invoice.totalAmount);
    });
    
    res.status(200).json({
      summary: {
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        income: totalIncome.toNumber(),
        expense: totalExpense.toNumber(),
        netIncome: netIncome.toNumber(),
        receivable: totalReceivable.toNumber(),
        transactionCount: transactions.length,
        unpaidInvoiceCount: unpaidInvoices.length
      }
    });
  } catch (error) {
    logger.error('Error generating financial summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    // Run migrations first
    const { migrate } = require('./migrations');
    await migrate();
    logger.info('Migrations completed successfully');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Finance Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
