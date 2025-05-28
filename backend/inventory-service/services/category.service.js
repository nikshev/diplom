/**
 * Category service for Inventory Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Category service
 */
class CategoryService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Category = db.Category;
    this.Product = db.Product;
  }

  /**
   * Get all categories with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Categories
   */
  async getCategories(options = {}) {
    const { 
      includeInactive = false,
      parentId = null,
      includeProducts = false,
      search = null 
    } = options;

    const where = {};
    
    if (!includeInactive) {
      where.is_active = true;
    }
    
    if (parentId === 'root') {
      where.parent_id = null;
    } else if (parentId) {
      where.parent_id = parentId;
    }
    
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const include = [];
    
    if (includeProducts) {
      include.push({
        model: this.Product,
        as: 'products',
        required: false,
        where: includeInactive ? {} : { is_active: true },
      });
    }

    const categories = await this.Category.findAll({
      where,
      include,
      order: [['name', 'ASC']],
    });

    return categories;
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Category
   */
  async getCategoryById(id, options = {}) {
    const { includeProducts = false, includeSubcategories = false } = options;
    
    const include = [];
    
    if (includeProducts) {
      include.push({
        model: this.Product,
        as: 'products',
        required: false,
      });
    }
    
    if (includeSubcategories) {
      include.push({
        model: this.Category,
        as: 'subcategories',
        required: false,
      });
    }
    
    const category = await this.Category.findByPk(id, {
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
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    const { parent_id } = categoryData;
    
    // Validate parent category if provided
    if (parent_id) {
      const parentCategory = await this.Category.findByPk(parent_id);
      if (!parentCategory) {
        throw new NotFoundError(`Parent category with ID ${parent_id} not found`);
      }
    }
    
    // Create category
    const category = await this.Category.create(categoryData);
    
    return this.getCategoryById(category.id);
  }

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, categoryData) {
    const category = await this.getCategoryById(id);
    const { parent_id } = categoryData;
    
    // Prevent setting category as its own parent
    if (parent_id && parent_id === id) {
      throw new BadRequestError('Category cannot be its own parent');
    }
    
    // Validate parent category if provided
    if (parent_id) {
      const parentCategory = await this.Category.findByPk(parent_id);
      if (!parentCategory) {
        throw new NotFoundError(`Parent category with ID ${parent_id} not found`);
      }
      
      // Prevent circular references
      if (await this.isDescendantOf(parent_id, id)) {
        throw new BadRequestError('Circular reference detected: a category cannot be a parent of one of its ancestors');
      }
    }
    
    // Update category
    await category.update(categoryData);
    
    return this.getCategoryById(id);
  }

  /**
   * Delete category
   * @param {string} id - Category ID
   * @returns {Promise<boolean>} Success
   */
  async deleteCategory(id) {
    const category = await this.getCategoryById(id, { includeSubcategories: true, includeProducts: true });
    
    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      throw new BadRequestError('Cannot delete category with subcategories');
    }
    
    // Check if category has products
    if (category.products && category.products.length > 0) {
      throw new BadRequestError('Cannot delete category with products');
    }
    
    // Delete category
    await category.destroy();
    
    return true;
  }

  /**
   * Get category tree
   * @param {string} rootId - Root category ID (optional)
   * @returns {Promise<Array>} Category tree
   */
  async getCategoryTree(rootId = null) {
    const where = rootId ? { parent_id: rootId } : { parent_id: null };
    
    const categories = await this.Category.findAll({
      where,
      include: [
        {
          model: this.Category,
          as: 'subcategories',
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });
    
    // Recursively build tree
    const buildTree = async (cats) => {
      const result = [];
      
      for (const cat of cats) {
        const node = cat.toJSON();
        
        if (node.subcategories && node.subcategories.length > 0) {
          node.subcategories = await buildTree(node.subcategories);
        } else {
          // Load subcategories if not already loaded
          const subcategories = await this.Category.findAll({
            where: { parent_id: cat.id },
            order: [['name', 'ASC']],
          });
          
          if (subcategories.length > 0) {
            node.subcategories = await buildTree(subcategories);
          } else {
            node.subcategories = [];
          }
        }
        
        // Count products in this category
        node.product_count = await this.Product.count({
          where: { category_id: cat.id },
        });
        
        result.push(node);
      }
      
      return result;
    };
    
    return buildTree(categories);
  }

  /**
   * Check if a category is a descendant of another category
   * @param {string} categoryId - Category ID
   * @param {string} potentialAncestorId - Potential ancestor ID
   * @returns {Promise<boolean>} True if categoryId is a descendant of potentialAncestorId
   */
  async isDescendantOf(categoryId, potentialAncestorId) {
    const category = await this.Category.findByPk(categoryId);
    
    if (!category || !category.parent_id) {
      return false;
    }
    
    if (category.parent_id === potentialAncestorId) {
      return true;
    }
    
    return this.isDescendantOf(category.parent_id, potentialAncestorId);
  }

  /**
   * Get category breadcrumbs
   * @param {string} id - Category ID
   * @returns {Promise<Array>} Breadcrumbs
   */
  async getCategoryBreadcrumbs(id) {
    const breadcrumbs = [];
    let currentId = id;
    
    while (currentId) {
      const category = await this.Category.findByPk(currentId, {
        attributes: ['id', 'name', 'parent_id'],
      });
      
      if (!category) break;
      
      breadcrumbs.unshift({
        id: category.id,
        name: category.name,
      });
      
      currentId = category.parent_id;
    }
    
    return breadcrumbs;
  }
}

module.exports = CategoryService;
