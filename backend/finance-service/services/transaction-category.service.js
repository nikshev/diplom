/**
 * Transaction Category service for Finance Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Transaction Category service
 */
class TransactionCategoryService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.TransactionCategory = db.TransactionCategory;
    this.Transaction = db.Transaction;
  }

  /**
   * Get categories with optional filtering
   * @param {Object} options - Query options
   * @returns {Array} Categories
   */
  async getCategories(options) {
    const {
      type,
      includeInactive = false,
      parentId,
      search,
    } = options;

    const where = {};

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (!includeInactive) {
      where.is_active = true;
    }

    if (parentId !== undefined) {
      where.parent_id = parentId;
    }

    if (search) {
      where.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // Get categories
    const categories = await this.TransactionCategory.findAll({
      where,
      include: [
        {
          model: this.TransactionCategory,
          as: 'parent',
          attributes: ['id', 'name', 'type'],
        },
      ],
      order: [['name', 'ASC']],
    });

    return categories;
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @param {Object} options - Query options
   * @returns {Object} Category
   */
  async getCategoryById(id, options = {}) {
    const { includeTransactions = false, includeSubcategories = false } = options;

    const include = [
      {
        model: this.TransactionCategory,
        as: 'parent',
        attributes: ['id', 'name', 'type'],
      },
    ];

    if (includeTransactions) {
      include.push({
        model: this.Transaction,
        as: 'transactions',
        limit: 10,
        order: [['transaction_date', 'DESC']],
      });
    }

    if (includeSubcategories) {
      include.push({
        model: this.TransactionCategory,
        as: 'subcategories',
        where: { is_active: true },
        required: false,
      });
    }

    const category = await this.TransactionCategory.findByPk(id, {
      include,
    });

    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Create category
   * @param {Object} categoryData - Category data
   * @returns {Object} Created category
   */
  async createCategory(categoryData) {
    // Validate parent category if provided
    if (categoryData.parent_id) {
      const parentCategory = await this.TransactionCategory.findByPk(categoryData.parent_id);
      if (!parentCategory) {
        throw new BadRequestError(`Parent category with ID ${categoryData.parent_id} not found`);
      }

      // Ensure parent category type matches
      if (parentCategory.type !== categoryData.type) {
        throw new BadRequestError(`Parent category type ${parentCategory.type} does not match ${categoryData.type}`);
      }
    }

    // Create category
    const category = await this.TransactionCategory.create(categoryData);

    return this.getCategoryById(category.id);
  }

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Category data
   * @returns {Object} Updated category
   */
  async updateCategory(id, categoryData) {
    const category = await this.TransactionCategory.findByPk(id);
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }

    // Validate parent category if provided
    if (categoryData.parent_id) {
      // Prevent circular reference
      if (categoryData.parent_id === id) {
        throw new BadRequestError('Category cannot be its own parent');
      }

      const parentCategory = await this.TransactionCategory.findByPk(categoryData.parent_id);
      if (!parentCategory) {
        throw new BadRequestError(`Parent category with ID ${categoryData.parent_id} not found`);
      }

      // Ensure parent category type matches
      const type = categoryData.type || category.type;
      if (parentCategory.type !== type) {
        throw new BadRequestError(`Parent category type ${parentCategory.type} does not match ${type}`);
      }

      // Check if parent is a descendant of this category (prevent circular reference)
      const isDescendant = await this.isDescendant(categoryData.parent_id, id);
      if (isDescendant) {
        throw new BadRequestError('Cannot set a descendant as parent (circular reference)');
      }
    }

    // Update category
    await category.update(categoryData);

    return this.getCategoryById(id);
  }

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {boolean} Success
   */
  async deleteCategory(id) {
    const category = await this.TransactionCategory.findByPk(id, {
      include: [
        {
          model: this.TransactionCategory,
          as: 'subcategories',
        },
        {
          model: this.Transaction,
          as: 'transactions',
        },
      ],
    });

    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }

    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      throw new BadRequestError('Cannot delete category with subcategories');
    }

    // Check if category has transactions
    if (category.transactions && category.transactions.length > 0) {
      throw new BadRequestError('Cannot delete category with transactions');
    }

    // Delete category
    await category.destroy();

    return true;
  }

  /**
   * Get category tree
   * @param {string} type - Category type (income or expense)
   * @returns {Array} Category tree
   */
  async getCategoryTree(type) {
    // Get all categories of the specified type
    const where = {};
    if (type) {
      where.type = type;
    }

    where.is_active = true;

    const categories = await this.TransactionCategory.findAll({
      where,
      include: [
        {
          model: this.TransactionCategory,
          as: 'parent',
          attributes: ['id', 'name', 'type'],
        },
      ],
      order: [['name', 'ASC']],
    });

    // Build tree
    const categoryMap = {};
    const rootCategories = [];

    // First pass: create map of categories by ID
    categories.forEach(category => {
      categoryMap[category.id] = {
        ...category.get({ plain: true }),
        subcategories: [],
      };
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      if (category.parent_id) {
        // Add to parent's subcategories
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].subcategories.push(categoryMap[category.id]);
        }
      } else {
        // Root category
        rootCategories.push(categoryMap[category.id]);
      }
    });

    return rootCategories;
  }

  /**
   * Check if a category is a descendant of another category
   * @param {string} categoryId - Category ID
   * @param {string} potentialAncestorId - Potential ancestor ID
   * @returns {boolean} Is descendant
   */
  async isDescendant(categoryId, potentialAncestorId) {
    const category = await this.TransactionCategory.findByPk(categoryId);
    if (!category || !category.parent_id) {
      return false;
    }

    if (category.parent_id === potentialAncestorId) {
      return true;
    }

    return this.isDescendant(category.parent_id, potentialAncestorId);
  }

  /**
   * Get category statistics
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Object} Category statistics
   */
  async getCategoryStats(startDate, endDate, options = {}) {
    const { type } = options;

    const where = {
      is_active: true,
    };

    if (type) {
      where.type = type;
    }

    // Get all categories
    const categories = await this.TransactionCategory.findAll({
      where,
      attributes: ['id', 'name', 'type', 'parent_id'],
    });

    // Get transaction totals by category
    const transactionWhere = {
      transaction_date: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    };

    if (type) {
      transactionWhere.type = type;
    }

    const transactionStats = await this.Transaction.findAll({
      attributes: [
        'category_id',
        [this.db.sequelize.fn('SUM', this.db.sequelize.col('amount')), 'total'],
        [this.db.sequelize.fn('COUNT', this.db.sequelize.col('id')), 'count'],
      ],
      where: transactionWhere,
      group: ['category_id'],
    });

    // Create a map of category stats
    const categoryStats = {};
    categories.forEach(category => {
      categoryStats[category.id] = {
        id: category.id,
        name: category.name,
        type: category.type,
        parent_id: category.parent_id,
        total: 0,
        count: 0,
      };
    });

    // Fill in transaction stats
    transactionStats.forEach(stat => {
      const categoryId = stat.category_id;
      if (categoryStats[categoryId]) {
        categoryStats[categoryId].total = parseFloat(stat.get('total') || 0);
        categoryStats[categoryId].count = parseInt(stat.get('count') || 0, 10);
      }
    });

    // Calculate parent category totals (roll up)
    const rollUpTotals = (categoryId) => {
      const category = categoryStats[categoryId];
      if (!category) return { total: 0, count: 0 };

      // Get direct children
      const children = Object.values(categoryStats).filter(c => c.parent_id === categoryId);
      
      // Recursively calculate children totals
      let childrenTotal = 0;
      let childrenCount = 0;
      
      children.forEach(child => {
        const childStats = rollUpTotals(child.id);
        childrenTotal += childStats.total;
        childrenCount += childStats.count;
      });

      // Add direct transactions to the totals
      const directTotal = category.total;
      const directCount = category.count;

      // Update category stats with combined totals
      category.total = directTotal;
      category.count = directCount;
      category.childrenTotal = childrenTotal;
      category.childrenCount = childrenCount;
      category.combinedTotal = directTotal + childrenTotal;
      category.combinedCount = directCount + childrenCount;

      return {
        total: category.combinedTotal,
        count: category.combinedCount,
      };
    };

    // Calculate totals for root categories
    const rootCategories = Object.values(categoryStats).filter(c => !c.parent_id);
    rootCategories.forEach(category => {
      rollUpTotals(category.id);
    });

    // Calculate overall totals
    const summary = {
      income: {
        total: 0,
        count: 0,
      },
      expense: {
        total: 0,
        count: 0,
      },
    };

    Object.values(categoryStats).forEach(category => {
      if (!category.parent_id) { // Only count root categories to avoid double counting
        if (category.type === 'income') {
          summary.income.total += category.combinedTotal;
          summary.income.count += category.combinedCount;
        } else if (category.type === 'expense') {
          summary.expense.total += category.combinedTotal;
          summary.expense.count += category.combinedCount;
        }
      }
    });

    return {
      startDate,
      endDate,
      categories: Object.values(categoryStats),
      summary,
    };
  }
}

module.exports = TransactionCategoryService;
