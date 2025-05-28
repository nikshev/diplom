/**
 * Contact controller for CRM Service
 */

const { StatusCodes } = require('http-status-codes');
const logger = require('../config/logger');

/**
 * Contact controller
 */
class ContactController {
  /**
   * Constructor
   * @param {Object} contactService - Contact service
   */
  constructor(contactService) {
    this.contactService = contactService;
    
    // Bind methods to this instance
    this.getContactsByCustomerId = this.getContactsByCustomerId.bind(this);
    this.getContactById = this.getContactById.bind(this);
    this.createContact = this.createContact.bind(this);
    this.updateContact = this.updateContact.bind(this);
    this.deleteContact = this.deleteContact.bind(this);
    this.setPrimaryContact = this.setPrimaryContact.bind(this);
    this.searchContacts = this.searchContacts.bind(this);
  }

  /**
   * Get contacts by customer ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getContactsByCustomerId(req, res, next) {
    try {
      const { customerId } = req.params;
      const contacts = await this.contactService.getContactsByCustomerId(customerId);

      res.status(StatusCodes.OK).json(contacts);
    } catch (error) {
      logger.error(`Error in getContactsByCustomerId controller for customer ID ${req.params.customerId}:`, error);
      next(error);
    }
  }

  /**
   * Get contact by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getContactById(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await this.contactService.getContactById(id);

      res.status(StatusCodes.OK).json(contact);
    } catch (error) {
      logger.error(`Error in getContactById controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create contact
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createContact(req, res, next) {
    try {
      const contactData = req.body;
      const contact = await this.contactService.createContact(contactData);

      res.status(StatusCodes.CREATED).json(contact);
    } catch (error) {
      logger.error('Error in createContact controller:', error);
      next(error);
    }
  }

  /**
   * Update contact
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateContact(req, res, next) {
    try {
      const { id } = req.params;
      const contactData = req.body;
      const contact = await this.contactService.updateContact(id, contactData);

      res.status(StatusCodes.OK).json(contact);
    } catch (error) {
      logger.error(`Error in updateContact controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete contact
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteContact(req, res, next) {
    try {
      const { id } = req.params;
      await this.contactService.deleteContact(id);

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      logger.error(`Error in deleteContact controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Set contact as primary
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async setPrimaryContact(req, res, next) {
    try {
      const { id } = req.params;
      const contact = await this.contactService.setPrimaryContact(id);

      res.status(StatusCodes.OK).json(contact);
    } catch (error) {
      logger.error(`Error in setPrimaryContact controller for ID ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Search contacts
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async searchContacts(req, res, next) {
    try {
      const { query, customerId } = req.query;
      const options = {
        limit: parseInt(req.query.limit, 10) || 10,
        customerId,
      };

      const contacts = await this.contactService.searchContacts(query, options);

      res.status(StatusCodes.OK).json(contacts);
    } catch (error) {
      logger.error('Error in searchContacts controller:', error);
      next(error);
    }
  }
}

module.exports = ContactController;
