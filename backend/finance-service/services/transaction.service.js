/**
 * Transaction service for Finance Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Transaction service
 */
class TransactionService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Transaction = db.Transaction;
    this.TransactionCategory = db.TransactionCategory;
    this.Account = db.Account;
  }

  /**
   * Get transactions with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Object} Transactions with pagination
   */
  async getTransactions(options) {
    const {
      page = 1,
      limit = 10,
      type,
      categoryId,
      accountId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'transaction_date',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (accountId) {
      where.account_id = accountId;
    }

    if (startDate && endDate) {
      where.transaction_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.transaction_date = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      where.transaction_date = {
        [Op.lte]: new Date(endDate),
      };
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};

      if (minAmount !== undefined) {
        where.amount[Op.gte] = minAmount;
      }

      if (maxAmount !== undefined) {
        where.amount[Op.lte] = maxAmount;
      }
    }

    // Get transactions
    const { count, rows } = await this.Transaction.findAndCountAll({
      where,
      include: [
        {
          model: this.TransactionCategory,
          as: 'category',
        },
        {
          model: this.Account,
          as: 'account',
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      transactions: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Object} Transaction
   */
  async getTransactionById(id) {
    const transaction = await this.Transaction.findByPk(id, {
      include: [
        {
          model: this.TransactionCategory,
          as: 'category',
        },
        {
          model: this.Account,
          as: 'account',
        },
      ],
    });

    if (!transaction) {
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Create transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Object} Created transaction
   */
  async createTransaction(transactionData) {
    // Validate category
    const category = await this.TransactionCategory.findByPk(transactionData.category_id);
    if (!category) {
      throw new BadRequestError(`Category with ID ${transactionData.category_id} not found`);
    }

    // Validate account
    const account = await this.Account.findByPk(transactionData.account_id);
    if (!account) {
      throw new BadRequestError(`Account with ID ${transactionData.account_id} not found`);
    }

    // Ensure transaction type matches category type
    if (transactionData.type !== category.type) {
      throw new BadRequestError(`Transaction type ${transactionData.type} does not match category type ${category.type}`);
    }

    // Create transaction
    const transaction = await this.Transaction.create(transactionData);

    // Update account balance
    const amount = transactionData.type === 'income' ? transactionData.amount : -transactionData.amount;
    await account.increment('balance', { by: amount });

    // Reload transaction with associations
    return this.getTransactionById(transaction.id);
  }

  /**
   * Update transaction
   * @param {string} id - Transaction ID
   * @param {Object} transactionData - Transaction data
   * @returns {Object} Updated transaction
   */
  async updateTransaction(id, transactionData) {
    const transaction = await this.Transaction.findByPk(id);
    if (!transaction) {
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }

    // If category is being updated, validate it
    if (transactionData.category_id) {
      const category = await this.TransactionCategory.findByPk(transactionData.category_id);
      if (!category) {
        throw new BadRequestError(`Category with ID ${transactionData.category_id} not found`);
      }

      // Ensure transaction type matches category type
      const type = transactionData.type || transaction.type;
      if (type !== category.type) {
        throw new BadRequestError(`Transaction type ${type} does not match category type ${category.type}`);
      }
    }

    // If account is being updated, validate it
    if (transactionData.account_id) {
      const account = await this.Account.findByPk(transactionData.account_id);
      if (!account) {
        throw new BadRequestError(`Account with ID ${transactionData.account_id} not found`);
      }
    }

    // If amount or type is being updated, adjust account balance
    if (transactionData.amount !== undefined || transactionData.type !== undefined || transactionData.account_id !== undefined) {
      // Get original account
      const originalAccount = await this.Account.findByPk(transaction.account_id);

      // Reverse original transaction effect on balance
      const originalAmount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      await originalAccount.increment('balance', { by: originalAmount });

      // Apply new transaction effect on balance
      const newAccountId = transactionData.account_id || transaction.account_id;
      const newAccount = newAccountId === transaction.account_id ? originalAccount : await this.Account.findByPk(newAccountId);
      const newType = transactionData.type || transaction.type;
      const newAmount = transactionData.amount !== undefined ? transactionData.amount : transaction.amount;
      const adjustmentAmount = newType === 'income' ? newAmount : -newAmount;
      await newAccount.increment('balance', { by: adjustmentAmount });
    }

    // Update transaction
    await transaction.update(transactionData);

    // Reload transaction with associations
    return this.getTransactionById(id);
  }

  /**
   * Delete transaction
   * @param {string} id - Transaction ID
   * @returns {boolean} Success
   */
  async deleteTransaction(id) {
    const transaction = await this.Transaction.findByPk(id);
    if (!transaction) {
      throw new NotFoundError(`Transaction with ID ${id} not found`);
    }

    // Adjust account balance
    const account = await this.Account.findByPk(transaction.account_id);
    const amount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    await account.increment('balance', { by: amount });

    // Delete transaction
    await transaction.destroy();

    return true;
  }

  /**
   * Get transactions by category
   * @param {string} categoryId - Category ID
   * @param {Object} options - Query options
   * @returns {Object} Transactions with pagination
   */
  async getTransactionsByCategory(categoryId, options) {
    const category = await this.TransactionCategory.findByPk(categoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID ${categoryId} not found`);
    }

    return this.getTransactions({
      ...options,
      categoryId,
    });
  }

  /**
   * Get transactions by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Object} Transactions with pagination
   */
  async getTransactionsByDateRange(startDate, endDate, options) {
    return this.getTransactions({
      ...options,
      startDate,
      endDate,
    });
  }

  /**
   * Get transactions by account
   * @param {string} accountId - Account ID
   * @param {Object} options - Query options
   * @returns {Object} Transactions with pagination
   */
  async getTransactionsByAccount(accountId, options) {
    const account = await this.Account.findByPk(accountId);
    if (!account) {
      throw new NotFoundError(`Account with ID ${accountId} not found`);
    }

    return this.getTransactions({
      ...options,
      accountId,
    });
  }

  /**
   * Get transaction statistics
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Object} Transaction statistics
   */
  async getTransactionStats(startDate, endDate, options) {
    const { groupBy = 'category', type, accountId } = options;

    const where = {
      transaction_date: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    };

    if (type) {
      where.type = type;
    }

    if (accountId) {
      where.account_id = accountId;
    }

    let stats;

    switch (groupBy) {
      case 'category':
        stats = await this.Transaction.findAll({
          attributes: [
            'category_id',
            'type',
            [this.db.sequelize.fn('SUM', this.db.sequelize.col('amount')), 'total'],
            [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
          ],
          where,
          include: [
            {
              model: this.TransactionCategory,
              as: 'category',
              attributes: ['id', 'name', 'type'],
            },
          ],
          group: ['category_id', 'type', 'category.id'],
          order: [['type', 'ASC'], [this.db.sequelize.literal('total'), 'DESC']],
        });
        break;

      case 'day':
        stats = await this.Transaction.findAll({
          attributes: [
            [this.db.sequelize.fn('DATE', this.db.sequelize.col('transaction_date')), 'date'],
            'type',
            [this.db.sequelize.fn('SUM', this.db.sequelize.col('amount')), 'total'],
            [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
          ],
          where,
          group: [this.db.sequelize.fn('DATE', this.db.sequelize.col('transaction_date')), 'type'],
          order: [[this.db.sequelize.fn('DATE', this.db.sequelize.col('transaction_date')), 'ASC'], ['type', 'ASC']],
        });
        break;

      case 'week':
        stats = await this.Transaction.findAll({
          attributes: [
            [this.db.sequelize.fn('DATE_TRUNC', 'week', this.db.sequelize.col('transaction_date')), 'week'],
            'type',
            [this.db.sequelize.fn('SUM', this.db.sequelize.col('amount')), 'total'],
            [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
          ],
          where,
          group: [this.db.sequelize.fn('DATE_TRUNC', 'week', this.db.sequelize.col('transaction_date')), 'type'],
          order: [[this.db.sequelize.fn('DATE_TRUNC', 'week', this.db.sequelize.col('transaction_date')), 'ASC'], ['type', 'ASC']],
        });
        break;

      case 'month':
        stats = await this.Transaction.findAll({
          attributes: [
            [this.db.sequelize.fn('DATE_TRUNC', 'month', this.db.sequelize.col('transaction_date')), 'month'],
            'type',
            [this.db.sequelize.fn('SUM', this.db.sequelize.col('amount')), 'total'],
            [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
          ],
          where,
          group: [this.db.sequelize.fn('DATE_TRUNC', 'month', this.db.sequelize.col('transaction_date')), 'type'],
          order: [[this.db.sequelize.fn('DATE_TRUNC', 'month', this.db.sequelize.col('transaction_date')), 'ASC'], ['type', 'ASC']],
        });
        break;

      default:
        throw new BadRequestError(`Invalid groupBy parameter: ${groupBy}`);
    }

    // Calculate summary
    const summary = {
      income: {
        total: 0,
        count: 0,
      },
      expense: {
        total: 0,
        count: 0,
      },
      net: 0,
    };

    stats.forEach((stat) => {
      const statType = stat.type || (stat.category ? stat.category.type : null);
      if (statType) {
        summary[statType].total += parseFloat(stat.get('total') || 0);
        summary[statType].count += parseInt(stat.get('count') || 0, 10);
      }
    });

    summary.net = summary.income.total - summary.expense.total;

    return {
      startDate,
      endDate,
      groupBy,
      stats,
      summary,
    };
  }
}

module.exports = TransactionService;
