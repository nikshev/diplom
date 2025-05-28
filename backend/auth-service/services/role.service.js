/**
 * Role service for Auth Service
 */

const { Op } = require('sequelize');
const db = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');

const Role = db.Role;
const Permission = db.Permission;
const RolePermission = db.RolePermission;

/**
 * Create a new role
 * @param {Object} roleData - Role data
 * @returns {Promise<Object>} Created role
 */
const createRole = async (roleData) => {
  // Check if role with name already exists
  const existingRole = await Role.findOne({ where: { name: roleData.name } });
  if (existingRole) {
    throw new ConflictError('Role with this name already exists');
  }

  // Create role
  const role = await Role.create({
    name: roleData.name,
    description: roleData.description,
  });

  logger.info(`Role created: ${role.id}`);
  
  return role;
};

/**
 * Get role by ID
 * @param {string} id - Role ID
 * @returns {Promise<Object>} Role
 */
const getRoleById = async (id) => {
  const role = await Role.findByPk(id, {
    include: [{
      model: Permission,
      as: 'permissions',
      through: { attributes: [] },
    }],
  });
  
  if (!role) {
    throw new NotFoundError('Role not found');
  }
  
  return role;
};

/**
 * Get role by name
 * @param {string} name - Role name
 * @returns {Promise<Object>} Role
 */
const getRoleByName = async (name) => {
  const role = await Role.findOne({ 
    where: { name },
    include: [{
      model: Permission,
      as: 'permissions',
      through: { attributes: [] },
    }],
  });
  
  if (!role) {
    throw new NotFoundError('Role not found');
  }
  
  return role;
};

/**
 * Get all roles with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Roles and pagination info
 */
const getRoles = async (options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const offset = (page - 1) * limit;
  
  // Build filter conditions
  const where = {};
  
  if (options.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${options.search}%` } },
      { description: { [Op.iLike]: `%${options.search}%` } },
    ];
  }
  
  // Query roles
  const { count, rows } = await Role.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
    include: [{
      model: Permission,
      as: 'permissions',
      through: { attributes: [] },
    }],
  });
  
  return {
    roles: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  };
};

/**
 * Update role
 * @param {string} id - Role ID
 * @param {Object} roleData - Role data to update
 * @returns {Promise<Object>} Updated role
 */
const updateRole = async (id, roleData) => {
  const role = await Role.findByPk(id);
  
  if (!role) {
    throw new NotFoundError('Role not found');
  }
  
  // Check if name is being changed and if it's already in use
  if (roleData.name && roleData.name !== role.name) {
    const existingRole = await Role.findOne({ where: { name: roleData.name } });
    if (existingRole) {
      throw new ConflictError('Role with this name already exists');
    }
  }
  
  // Update role fields
  const updateData = {};
  
  if (roleData.name) updateData.name = roleData.name;
  if (roleData.description !== undefined) updateData.description = roleData.description;
  
  // Update role
  await role.update(updateData);
  
  logger.info(`Role updated: ${role.id}`);
  
  // Return updated role with permissions
  const updatedRole = await Role.findByPk(id, {
    include: [{
      model: Permission,
      as: 'permissions',
      through: { attributes: [] },
    }],
  });
  
  return updatedRole;
};

/**
 * Delete role
 * @param {string} id - Role ID
 * @returns {Promise<boolean>} Success
 */
const deleteRole = async (id) => {
  const role = await Role.findByPk(id);
  
  if (!role) {
    throw new NotFoundError('Role not found');
  }
  
  // Prevent deletion of built-in roles
  if (['admin', 'manager', 'employee'].includes(role.name)) {
    throw new ConflictError('Cannot delete built-in role');
  }
  
  await role.destroy();
  
  logger.info(`Role deleted: ${id}`);
  
  return true;
};

/**
 * Assign permissions to role
 * @param {string} roleId - Role ID
 * @param {Array} permissionIds - Permission IDs
 * @returns {Promise<Object>} Updated role with permissions
 */
const assignPermissionsToRole = async (roleId, permissionIds) => {
  const role = await Role.findByPk(roleId);
  
  if (!role) {
    throw new NotFoundError('Role not found');
  }
  
  // Validate permissions
  const permissions = await Permission.findAll({
    where: {
      id: {
        [Op.in]: permissionIds,
      },
    },
  });
  
  if (permissions.length !== permissionIds.length) {
    throw new NotFoundError('One or more permissions not found');
  }
  
  // Clear existing permissions
  await RolePermission.destroy({
    where: {
      role_id: roleId,
    },
  });
  
  // Assign new permissions
  await role.setPermissions(permissions);
  
  logger.info(`Permissions assigned to role: ${roleId}`);
  
  // Return updated role with permissions
  const updatedRole = await Role.findByPk(roleId, {
    include: [{
      model: Permission,
      as: 'permissions',
      through: { attributes: [] },
    }],
  });
  
  return updatedRole;
};

module.exports = {
  createRole,
  getRoleById,
  getRoleByName,
  getRoles,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
};
