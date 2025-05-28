/**
 * User controller for Auth Service
 */

const userService = require('../services/user.service');
const { BadRequestError } = require('../utils/errors');

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, isActive } = req.query;
    
    const result = await userService.getUsers({
      page,
      limit,
      search,
      role,
      isActive,
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Create user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role, isActive } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      throw new BadRequestError('Email, password, first name, and last name are required');
    }
    
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      isActive,
    });
    
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, phone, role, isActive } = req.body;
    
    const user = await userService.updateUser(id, {
      email,
      firstName,
      lastName,
      phone,
      role,
      isActive,
    });
    
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await userService.deleteUser(id);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current password and new password are required');
    }
    
    await userService.changePassword(id, currentPassword, newPassword);
    
    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getUserPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const permissions = await userService.getUserPermissions(id);
    
    res.status(200).json({ permissions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getUserPermissions,
};
