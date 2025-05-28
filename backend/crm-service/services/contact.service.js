/**
 * Contact service for CRM Service
 */

const { Op } = require('sequelize');
const logger = require('../config/logger');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Contact service
 */
class ContactService {
  /**
   * Constructor
   * @param {Object} db - Database models
   */
  constructor(db) {
    this.db = db;
    this.Contact = db.Contact;
    this.Customer = db.Customer;
  }

  /**
   * Get contacts by customer ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Contacts
   */
  async getContactsByCustomerId(customerId) {
    // Check if customer exists
    const customer = await this.Customer.findByPk(customerId);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }

    const contacts = await this.Contact.findAll({
      where: { customer_id: customerId },
      order: [['is_primary', 'DESC'], ['created_at', 'DESC']],
    });

    return contacts;
  }

  /**
   * Get contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise<Object>} Contact
   */
  async getContactById(id) {
    const contact = await this.Contact.findByPk(id, {
      include: [
        {
          model: this.Customer,
          as: 'customer',
        },
      ],
    });

    if (!contact) {
      throw new NotFoundError(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  /**
   * Create contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact
   */
  async createContact(contactData) {
    const { customer_id } = contactData;

    // Check if customer exists
    const customer = await this.Customer.findByPk(customer_id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customer_id} not found`);
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Create contact
      const contact = await this.Contact.create(contactData, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return contact with customer
      return this.getContactById(contact.id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error('Error creating contact:', error);
      throw error;
    }
  }

  /**
   * Update contact
   * @param {string} id - Contact ID
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Updated contact
   */
  async updateContact(id, contactData) {
    const contact = await this.getContactById(id);

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Update contact
      await contact.update(contactData, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return updated contact
      return this.getContactById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete contact
   * @param {string} id - Contact ID
   * @returns {Promise<boolean>} Success
   */
  async deleteContact(id) {
    const contact = await this.getContactById(id);

    // Check if contact is primary
    if (contact.is_primary) {
      // Find another contact to make primary
      const anotherContact = await this.Contact.findOne({
        where: {
          customer_id: contact.customer_id,
          id: { [Op.ne]: id },
        },
        order: [['created_at', 'ASC']],
      });

      // If there's another contact, make it primary
      if (anotherContact) {
        await anotherContact.update({ is_primary: true });
      }
    }

    // Delete contact
    await contact.destroy();

    return true;
  }

  /**
   * Set contact as primary
   * @param {string} id - Contact ID
   * @returns {Promise<Object>} Updated contact
   */
  async setPrimaryContact(id) {
    const contact = await this.getContactById(id);

    // If already primary, nothing to do
    if (contact.is_primary) {
      return contact;
    }

    // Start transaction
    const transaction = await this.db.sequelize.transaction();

    try {
      // Set all contacts for this customer as non-primary
      await this.Contact.update(
        { is_primary: false },
        {
          where: { customer_id: contact.customer_id },
          transaction,
        }
      );

      // Set this contact as primary
      await contact.update({ is_primary: true }, { transaction });

      // Commit transaction
      await transaction.commit();

      // Return updated contact
      return this.getContactById(id);
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      logger.error(`Error setting primary contact ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search contacts
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching contacts
   */
  async searchContacts(query, options = {}) {
    const { limit = 10, customerId } = options;

    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    const where = {
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${query}%` } },
        { last_name: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { phone: { [Op.iLike]: `%${query}%` } },
        { position: { [Op.iLike]: `%${query}%` } },
      ],
    };

    // Filter by customer ID if provided
    if (customerId) {
      where.customer_id = customerId;
    }

    const contacts = await this.Contact.findAll({
      where,
      include: [
        {
          model: this.Customer,
          as: 'customer',
        },
      ],
      limit,
    });

    return contacts;
  }
}

module.exports = ContactService;
