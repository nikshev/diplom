/**
 * Seed service for Auth Service
 * Creates default roles, permissions, and admin user
 */

const bcrypt = require('bcrypt');
const db = require('../models');
const config = require('../config');
const logger = require('../config/logger');

const User = db.User;
const Role = db.Role;
const Permission = db.Permission;
const RolePermission = db.RolePermission;

/**
 * Seed default data
 * @returns {Promise<void>}
 */
const seedData = async () => {
  try {
    // Create default roles if they don't exist
    for (const roleData of config.defaultRoles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: {
          description: roleData.description,
        },
      });

      if (created) {
        logger.info(`Created default role: ${role.name}`);
      }
    }

    // Create default permissions if they don't exist
    for (const permissionData of config.defaultPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permissionData.name },
        defaults: {
          description: permissionData.description,
          resource: permissionData.resource,
          action: permissionData.action,
        },
      });

      if (created) {
        logger.info(`Created default permission: ${permission.name}`);
      }
    }

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(config.rolePermissions)) {
      const role = await Role.findOne({ where: { name: roleName } });
      
      if (!role) {
        logger.warn(`Role not found for permission assignment: ${roleName}`);
        continue;
      }
      
      const permissions = await Permission.findAll({
        where: {
          name: permissionNames,
        },
      });
      
      if (permissions.length > 0) {
        await role.setPermissions(permissions);
        logger.info(`Assigned ${permissions.length} permissions to role: ${role.name}`);
      }
    }

    // Create default admin user if it doesn't exist
    const [admin, created] = await User.findOrCreate({
      where: { email: config.defaultAdmin.email },
      defaults: {
        password_hash: await bcrypt.hash(config.defaultAdmin.password, 10),
        first_name: config.defaultAdmin.firstName,
        last_name: config.defaultAdmin.lastName,
        role: 'admin',
        is_active: true,
      },
    });

    if (created) {
      logger.info(`Created default admin user: ${admin.email}`);
    }

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = {
  seedData,
};
