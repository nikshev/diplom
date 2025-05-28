/**
 * Permission service for Auth Service
 */

const { Op } = require('sequelize');
const db = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');

const Permission = db.Permission;

/**
 * Create a new permission
 * @param {Object} permissionData - Permission data
 * @returns {Promise<Object>} Created permission
 */
const createPermission = async (permissionData) => {
  // Check if permission with name already exists
  const existingPermission = await Permission.findOne({ where: { name: permissionData.name } });
  if (existingPermission) {
    throw new ConflictError('Permission with this name already exists');
  }

  // Create permission
  const permission = await Permission.create({
    name: permissionData.name,
    description: permissionData.description,
    resource: permissionData.resource,
    action: permissionData.action,
  });

  logger.info(`Permission created: ${permission.id}`);
  
  return permission;
};

/**
 * Get permission by ID
 * @param {string} id - Permission ID
 * @returns {Promise<Object>} Permission
 */
const getPermissionById = async (id) => {
  const permission = await Permission.findByPk(id, {
    include: [{
      model: db.Role,
      as: 'roles',
      through: { attributes: [] },
    }],
  });
  
  if (!permission) {
    throw new NotFoundError('Permission not found');
  }
  
  return permission;
};

/**
 * Get permission by name
 * @param {string} name - Permission name
 * @returns {Promise<Object>} Permission
 */
const getPermissionByName = async (name) => {
  const permission = await Permission.findOne({ 
    where: { name },
    include: [{
      model: db.Role,
      as: 'roles',
      through: { attributes: [] },
    }],
  });
  
  if (!permission) {
    throw new NotFoundError('Permission not found');
  }
  
  return permission;
};

/**
 * Get all permissions with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Permissions and pagination info
 */
const getPermissions = async (options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const offset = (page - 1) * limit;
  
  // Build filter conditions
  const where = {};
  
  if (options.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${options.search}%` } },
      { description: { [Op.iLike]: `%${options.search}%` } },
      { resource: { [Op.iLike]: `%${options.search}%` } },
      { action: { [Op.iLike]: `%${options.search}%` } },
    ];
  }
  
  if (options.resource) {
    where.resource = options.resource;
  }
  
  if (options.action) {
    where.action = options.action;
  }
  
  // Query permissions
  const { count, rows } = await Permission.findAndCountAll({
    where,
    limit,
    offset,
    order: [['resource', 'ASC'], ['action', 'ASC']],
  });
  
  return {
    permissions: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  };
};

/**
 * Update permission
 * @param {string} id - Permission ID
 * @param {Object} permissionData - Permission data to update
 * @returns {Promise<Object>} Updated permission
 */
const updatePermission = async (id, permissionData) => {
  const permission = await Permission.findByPk(id);
  
  if (!permission) {
    throw new NotFoundError('Permission not found');
  }
  
  // Check if name is being changed and if it's already in use
  if (permissionData.name && permissionData.name !== permission.name) {
    const existingPermission = await Permission.findOne({ where: { name: permissionData.name } });
    if (existingPermission) {
      throw new ConflictError('Permission with this name already exists');
    }
  }
  
  // Update permission fields
  const updateData = {};
  
  if (permissionData.name) updateData.name = permissionData.name;
  if (permissionData.description !== undefined) updateData.description = permissionData.description;
  if (permissionData.resource) updateData.resource = permissionData.resource;
  if (permissionData.action) updateData.action = permissionData.action;
  
  // Update permission
  await permission.update(updateData);
  
  logger.info(`Permission updated: ${permission.id}`);
  
  // Return updated permission
  return permission;
};

/**
 * Delete permission
 * @param {string} id - Permission ID
 * @returns {Promise<boolean>} Success
 */
const deletePermission = async (id) => {
  const permission = await Permission.findByPk(id);
  
  if (!permission) {
    throw new NotFoundError('Permission not found');
  }
  
  // Prevent deletion of built-in permissions
  const builtInPermissions = [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'roles:read', 'roles:create', 'roles:update', 'roles:delete',
    'permissions:read', 'permissions:assign',
  ];
  
  if (builtInPermissions.includes(permission.name)) {
    throw new ConflictError('Cannot delete built-in permission');
  }
  
  await permission.destroy();
  
  logger.info(`Permission deleted: ${id}`);
  
  return true;
};

/**
 * Get unique resources
 * @returns {Promise<Array>} Unique resources
 */
const getResources = async () => {
  const resources = await Permission.findAll({
    attributes: ['resource'],
    group: ['resource'],
    order: [['resource', 'ASC']],
  });
  
  return resources.map(r => r.resource);
};

/**
 * Get unique actions
 * @returns {Promise<Array>} Unique actions
 */
const getActions = async () => {
  const actions = await Permission.findAll({
    attributes: ['action'],
    group: ['action'],
    order: [['action', 'ASC']],
  });
  
  return actions.map(a => a.action);
};

module.exports = {
  createPermission,
  getPermissionById,
  getPermissionByName,
  getPermissions,
  updatePermission,
  deletePermission,
  getResources,
  getActions,
};
