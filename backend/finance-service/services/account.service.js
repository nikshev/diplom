/**
 * Account service for Finance Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Account service
 */
class AccountService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Account = db.Account;
    this.Transaction = db.Transaction;
    this.TransactionCategory = db.TransactionCategory;
  }

  /**
   * Get accounts with optional filtering
   * @param {Object} options - Query options
   * @returns {Array} Accounts
   */
  async getAccounts(options) {
    const {
      includeInactive = false,
      type,
      search,
      includeBalance = true,
    } = options;

    const where = {};

    // Apply filters
    if (!includeInactive) {
      where.is_active = true;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Get accounts
    const accounts = await this.Account.findAll({
      where,
      order: [['name', 'ASC']],
    });

    // If balance is not needed, return accounts as is
    if (!includeBalance) {
      return accounts;
    }

    // Get account balances
    const accountIds = accounts.map(account => account.id);
    const balances = await this.getAccountsBalance(accountIds);

    // Merge balances with accounts
    return accounts.map(account => {
      const accountData = account.get({ plain: true });
      const balance = balances[account.id] || {
        balance: account.balance || 0,
        available: account.balance || 0,
        reserved: 0,
      };

      return {
        ...accountData,
        balance: balance.balance,
        available: balance.available,
        reserved: balance.reserved,
      };
    });
  }

  /**
   * Get account by ID
   * @param {string} id - Account ID
   * @param {Object} options - Query options
   * @returns {Object} Account
   */
  async getAccountById(id, options = {}) {
    const { includeTransactions = false } = options;

    const include = [];

    if (includeTransactions) {
      include.push({
        model: this.Transaction,
        as: 'transactions',
        limit: 10,
        order: [['transaction_date', 'DESC']],
        include: [
          {
            model: this.TransactionCategory,
            as: 'category',
          },
        ],
      });
    }

    const account = await this.Account.findByPk(id, {
      include,
    });

    if (!account) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }

    // Get account balance
    const balance = await this.getAccountBalance(id);

    // Merge balance with account
    const accountData = account.get({ plain: true });
    return {
      ...accountData,
      balance: balance.balance,
      available: balance.available,
      reserved: balance.reserved,
    };
  }

  /**
   * Create account
   * @param {Object} accountData - Account data
   * @returns {Object} Created account
   */
  async createAccount(accountData) {
    // Create account
    const account = await this.Account.create({
      ...accountData,
      balance: accountData.initial_balance || 0,
    });

    // If initial balance is provided, create a transaction
    if (accountData.initial_balance && accountData.initial_balance > 0) {
      // Find or create initial balance category
      let category = await this.TransactionCategory.findOne({
        where: {
          name: 'Initial Balance',
          type: 'income',
        },
      });

      if (!category) {
        category = await this.TransactionCategory.create({
          name: 'Initial Balance',
          type: 'income',
          is_active: true,
        });
      }

      // Create transaction
      await this.Transaction.create({
        type: 'income',
        amount: accountData.initial_balance,
        currency: accountData.currency,
        category_id: category.id,
        account_id: account.id,
        description: 'Initial balance',
        transaction_date: new Date(),
      });
    }

    return this.getAccountById(account.id);
  }

  /**
   * Update account
   * @param {string} id - Account ID
   * @param {Object} accountData - Account data
   * @returns {Object} Updated account
   */
  async updateAccount(id, accountData) {
    const account = await this.Account.findByPk(id);
    if (!account) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }

    // Update account
    await account.update(accountData);

    return this.getAccountById(id);
  }

  /**
   * Delete account
   * @param {string} id - Account ID
   * @returns {boolean} Success
   */
  async deleteAccount(id) {
    const account = await this.Account.findByPk(id, {
      include: [
        {
          model: this.Transaction,
          as: 'transactions',
        },
      ],
    });

    if (!account) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }

    // Check if account has transactions
    if (account.transactions && account.transactions.length > 0) {
      throw new BadRequestError('Cannot delete account with transactions');
    }

    // Delete account
    await account.destroy();

    return true;
  }

  /**
   * Get account balance
   * @param {string} id - Account ID
   * @returns {Object} Account balance
   */
  async getAccountBalance(id) {
    const account = await this.Account.findByPk(id);
    if (!account) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }

    // Get reserved amount (e.g., for pending transactions)
    const reservedAmount = 0; // Implement reserved amount logic if needed

    return {
      balance: account.balance || 0,
      available: (account.balance || 0) - reservedAmount,
      reserved: reservedAmount,
    };
  }

  /**
   * Get balances for multiple accounts
   * @param {Array} accountIds - Account IDs
   * @returns {Object} Account balances
   */
  async getAccountsBalance(accountIds) {
    const accounts = await this.Account.findAll({
      where: {
        id: {
          [Op.in]: accountIds,
        },
      },
    });

    const balances = {};
    accounts.forEach(account => {
      balances[account.id] = {
        balance: account.balance || 0,
        available: account.balance || 0, // Implement reserved amount logic if needed
        reserved: 0,
      };
    });

    return balances;
  }

  /**
   * Get account transactions
   * @param {string} id - Account ID
   * @param {Object} options - Query options
   * @returns {Object} Transactions with pagination
   */
  async getAccountTransactions(id, options) {
    const account = await this.Account.findByPk(id);
    if (!account) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }

    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      type,
      categoryId,
      sortBy = 'transaction_date',
      sortOrder = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {
      account_id: id,
    };

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.category_id = categoryId;
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

    // Get transactions
    const { count, rows } = await this.Transaction.findAndCountAll({
      where,
      include: [
        {
          model: this.TransactionCategory,
          as: 'category',
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
   * Transfer funds between accounts
   * @param {string} sourceAccountId - Source account ID
   * @param {string} targetAccountId - Target account ID
   * @param {number} amount - Amount to transfer
   * @param {string} userId - User ID
   * @param {string} description - Transfer description
   * @returns {Object} Transfer result
   */
  async transferFunds(sourceAccountId, targetAccountId, amount, userId, description) {
    // Validate accounts
    const sourceAccount = await this.Account.findByPk(sourceAccountId);
    if (!sourceAccount) {
      throw new NotFoundError(`Source account with ID ${sourceAccountId} not found`);
    }

    const targetAccount = await this.Account.findByPk(targetAccountId);
    if (!targetAccount) {
      throw new NotFoundError(`Target account with ID ${targetAccountId} not found`);
    }

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestError('Amount must be positive');
    }

    // Check if source account has sufficient funds
    if (sourceAccount.balance < amount) {
      throw new BadRequestError('Insufficient funds');
    }

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Find or create transfer categories
      let transferOutCategory = await this.TransactionCategory.findOne({
        where: {
          name: 'Transfer Out',
          type: 'expense',
        },
      });

      if (!transferOutCategory) {
        transferOutCategory = await this.TransactionCategory.create({
          name: 'Transfer Out',
          type: 'expense',
          is_active: true,
        }, { transaction: t });
      }

      let transferInCategory = await this.TransactionCategory.findOne({
        where: {
          name: 'Transfer In',
          type: 'income',
        },
      });

      if (!transferInCategory) {
        transferInCategory = await this.TransactionCategory.create({
          name: 'Transfer In',
          type: 'income',
          is_active: true,
        }, { transaction: t });
      }

      // Create expense transaction for source account
      const sourceTransaction = await this.Transaction.create({
        type: 'expense',
        amount,
        currency: sourceAccount.currency,
        category_id: transferOutCategory.id,
        account_id: sourceAccountId,
        description: description || `Transfer to ${targetAccount.name}`,
        transaction_date: new Date(),
        reference_id: targetAccountId,
        reference_type: 'account',
        created_by: userId,
      }, { transaction: t });

      // Create income transaction for target account
      const targetTransaction = await this.Transaction.create({
        type: 'income',
        amount,
        currency: targetAccount.currency,
        category_id: transferInCategory.id,
        account_id: targetAccountId,
        description: description || `Transfer from ${sourceAccount.name}`,
        transaction_date: new Date(),
        reference_id: sourceAccountId,
        reference_type: 'account',
        created_by: userId,
      }, { transaction: t });

      // Update account balances
      await sourceAccount.decrement('balance', { by: amount, transaction: t });
      await targetAccount.increment('balance', { by: amount, transaction: t });

      // Commit transaction
      await t.commit();

      return {
        sourceTransaction,
        targetTransaction,
        sourceAccount: await this.getAccountById(sourceAccountId),
        targetAccount: await this.getAccountById(targetAccountId),
      };
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get account statistics
   * @param {string} id - Account ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Object} Account statistics
   */
  async getAccountStats(id, startDate, endDate) {
    const account = await this.Account.findByPk(id);
    if (!account) {
      throw new NotFoundError(`Account with ID ${id} not found`);
    }

    // Get transactions for the period
    const transactions = await this.Transaction.findAll({
      where: {
        account_id: id,
        transaction_date: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      include: [
        {
          model: this.TransactionCategory,
          as: 'category',
        },
      ],
      order: [['transaction_date', 'ASC']],
    });

    // Calculate statistics
    const stats = {
      income: {
        total: 0,
        count: 0,
        byCategory: {},
      },
      expense: {
        total: 0,
        count: 0,
        byCategory: {},
      },
      net: 0,
      startBalance: 0,
      endBalance: account.balance,
      transactions: transactions.length,
    };

    // Calculate start balance by subtracting all transactions in the period
    let periodTotal = 0;

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const type = transaction.type;
      const categoryId = transaction.category_id;
      const categoryName = transaction.category ? transaction.category.name : 'Uncategorized';

      // Update type totals
      stats[type].total += amount;
      stats[type].count += 1;

      // Update category totals
      if (!stats[type].byCategory[categoryId]) {
        stats[type].byCategory[categoryId] = {
          id: categoryId,
          name: categoryName,
          total: 0,
          count: 0,
        };
      }

      stats[type].byCategory[categoryId].total += amount;
      stats[type].byCategory[categoryId].count += 1;

      // Update period total
      periodTotal += type === 'income' ? amount : -amount;
    });

    // Calculate net and start balance
    stats.net = stats.income.total - stats.expense.total;
    stats.startBalance = account.balance - periodTotal;

    // Convert byCategory objects to arrays
    stats.income.byCategory = Object.values(stats.income.byCategory).sort((a, b) => b.total - a.total);
    stats.expense.byCategory = Object.values(stats.expense.byCategory).sort((a, b) => b.total - a.total);

    return {
      account: {
        id: account.id,
        name: account.name,
        type: account.type,
        currency: account.currency,
      },
      startDate,
      endDate,
      stats,
    };
  }
}

module.exports = AccountService;
