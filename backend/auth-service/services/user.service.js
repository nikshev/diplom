/**
 * User service for Auth Service
 */

const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const db = require('../models');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');
const logger = require('../config/logger');

const User = db.User;
const Role = db.Role;
const Permission = db.Permission;

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async (userData) => {
  // Check if user with email already exists
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    email: userData.email,
    password_hash: userData.password, // Will be hashed by model hook
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone: userData.phone,
    role: userData.role || 'employee',
    is_active: userData.isActive !== undefined ? userData.isActive : true,
  });

  logger.info(`User created: ${user.id}`);
  
  // Return user without password
  const userWithoutPassword = user.toJSON();
  delete userWithoutPassword.password_hash;
  
  return userWithoutPassword;
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User
 */
const getUserById = async (id) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Return user without password
  const userWithoutPassword = user.toJSON();
  delete userWithoutPassword.password_hash;
  
  return userWithoutPassword;
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User
 */
const getUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  return user; // Return with password for authentication
};

/**
 * Get all users with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Users and pagination info
 */
const getUsers = async (options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const offset = (page - 1) * limit;
  
  // Build filter conditions
  const where = {};
  
  if (options.search) {
    where[Op.or] = [
      { email: { [Op.iLike]: `%${options.search}%` } },
      { first_name: { [Op.iLike]: `%${options.search}%` } },
      { last_name: { [Op.iLike]: `%${options.search}%` } },
    ];
  }
  
  if (options.role) {
    where.role = options.role;
  }
  
  if (options.isActive !== undefined) {
    where.is_active = options.isActive === 'true';
  }
  
  // Query users
  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    attributes: { exclude: ['password_hash'] },
  });
  
  return {
    users: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
    },
  };
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Check if email is being changed and if it's already in use
  if (userData.email && userData.email !== user.email) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
  }
  
  // Update user fields
  const updateData = {};
  
  if (userData.email) updateData.email = userData.email;
  if (userData.firstName) updateData.first_name = userData.firstName;
  if (userData.lastName) updateData.last_name = userData.lastName;
  if (userData.phone !== undefined) updateData.phone = userData.phone;
  if (userData.role) updateData.role = userData.role;
  if (userData.isActive !== undefined) updateData.is_active = userData.isActive;
  
  // Update user
  await user.update(updateData);
  
  logger.info(`User updated: ${user.id}`);
  
  // Return updated user without password
  const updatedUser = await User.findByPk(id);
  const userWithoutPassword = updatedUser.toJSON();
  delete userWithoutPassword.password_hash;
  
  return userWithoutPassword;
};

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise<boolean>} Success
 */
const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  await user.destroy();
  
  logger.info(`User deleted: ${id}`);
  
  return true;
};

/**
 * Change user password
 * @param {string} id - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success
 */
const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Validate current password
  const isPasswordValid = await user.validatePassword(currentPassword);
  if (!isPasswordValid) {
    throw new BadRequestError('Current password is incorrect');
  }
  
  // Update password
  user.password_hash = newPassword; // Will be hashed by model hook
  await user.save();
  
  logger.info(`Password changed for user: ${id}`);
  
  return true;
};

/**
 * Reset user password
 * @param {string} id - User ID
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success
 */
const resetPassword = async (id, newPassword) => {
  const user = await User.findByPk(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Update password
  user.password_hash = newPassword; // Will be hashed by model hook
  await user.save();
  
  logger.info(`Password reset for user: ${id}`);
  
  return true;
};

/**
 * Get user permissions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User permissions
 */
const getUserPermissions = async (userId) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Get role
  const role = await Role.findOne({ where: { name: user.role } });
  
  if (!role) {
    return [];
  }
  
  // Get permissions for role
  const permissions = await role.getPermissions({
    attributes: ['name', 'resource', 'action', 'description'],
  });
  
  return permissions;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getUsers,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
  getUserPermissions,
};
