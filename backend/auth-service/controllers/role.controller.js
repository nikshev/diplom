/**
 * Role controller for Auth Service
 */

const roleService = require('../services/role.service');
const { BadRequestError } = require('../utils/errors');

/**
 * Get all roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRoles = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    
    const result = await roleService.getRoles({
      page,
      limit,
      search,
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const role = await roleService.getRoleById(id);
    
    res.status(200).json({ role });
  } catch (error) {
    next(error);
  }
};

/**
 * Create role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createRole = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      throw new BadRequestError('Role name is required');
    }
    
    const role = await roleService.createRole({
      name,
      description,
    });
    
    res.status(201).json({ role });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const role = await roleService.updateRole(id, {
      name,
      description,
    });
    
    res.status(200).json({ role });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await roleService.deleteRole(id);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Assign permissions to role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const assignPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;
    
    if (!Array.isArray(permissionIds)) {
      throw new BadRequestError('Permission IDs must be an array');
    }
    
    const role = await roleService.assignPermissionsToRole(id, permissionIds);
    
    res.status(200).json({ role });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
};
