/**
 * Permission controller for Auth Service
 */

const permissionService = require('../services/permission.service');
const { BadRequestError } = require('../utils/errors');

/**
 * Get all permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPermissions = async (req, res, next) => {
  try {
    const { page, limit, search, resource, action } = req.query;
    
    const result = await permissionService.getPermissions({
      page,
      limit,
      search,
      resource,
      action,
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get permission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPermissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const permission = await permissionService.getPermissionById(id);
    
    res.status(200).json({ permission });
  } catch (error) {
    next(error);
  }
};

/**
 * Create permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createPermission = async (req, res, next) => {
  try {
    const { name, description, resource, action } = req.body;
    
    if (!name || !resource || !action) {
      throw new BadRequestError('Name, resource, and action are required');
    }
    
    const permission = await permissionService.createPermission({
      name,
      description,
      resource,
      action,
    });
    
    res.status(201).json({ permission });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, resource, action } = req.body;
    
    const permission = await permissionService.updatePermission(id, {
      name,
      description,
      resource,
      action,
    });
    
    res.status(200).json({ permission });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete permission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deletePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await permissionService.deletePermission(id);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get unique resources
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getResources = async (req, res, next) => {
  try {
    const resources = await permissionService.getResources();
    
    res.status(200).json({ resources });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unique actions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getActions = async (req, res, next) => {
  try {
    const actions = await permissionService.getActions();
    
    res.status(200).json({ actions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getResources,
  getActions,
};
