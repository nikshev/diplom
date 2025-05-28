/**
 * Inventory service for integration with Inventory Service
 */

const axios = require('axios');
const logger = require('../config/logger');
const config = require('../config');
const { ServiceUnavailableError } = require('../utils/errors');

/**
 * Inventory service
 */
class InventoryService {
  /**
   * Constructor
   */
  constructor() {
    this.baseUrl = config.services.inventory.url;
    this.timeout = config.services.inventory.timeout;
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Check product availability
   * @param {Array} items - Order items
   * @returns {Promise<Object>} Availability result
   */
  async checkProductAvailability(items) {
    try {
      const productIds = items.map(item => item.product_id);
      
      const response = await this.api.post('/api/inventory/check-availability', {
        products: items.map(item => ({
          id: item.product_id,
          quantity: item.quantity,
        })),
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error checking product availability:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new ServiceUnavailableError(
          `Inventory service error: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new ServiceUnavailableError('Inventory service is unavailable');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new ServiceUnavailableError(`Error: ${error.message}`);
      }
    }
  }

  /**
   * Reserve products for order
   * @param {string} orderId - Order ID
   * @param {Array} items - Order items
   * @returns {Promise<Object>} Reservation result
   */
  async reserveProducts(orderId, items) {
    try {
      const response = await this.api.post('/api/inventory/reserve', {
        order_id: orderId,
        products: items.map(item => ({
          id: item.product_id,
          quantity: item.quantity,
        })),
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error reserving products for order ${orderId}:`, error);
      
      if (error.response) {
        throw new ServiceUnavailableError(
          `Inventory service error: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        throw new ServiceUnavailableError('Inventory service is unavailable');
      } else {
        throw new ServiceUnavailableError(`Error: ${error.message}`);
      }
    }
  }

  /**
   * Release product reservation
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Release result
   */
  async releaseReservation(orderId) {
    try {
      const response = await this.api.post('/api/inventory/release-reservation', {
        order_id: orderId,
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error releasing reservation for order ${orderId}:`, error);
      
      if (error.response) {
        throw new ServiceUnavailableError(
          `Inventory service error: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        throw new ServiceUnavailableError('Inventory service is unavailable');
      } else {
        throw new ServiceUnavailableError(`Error: ${error.message}`);
      }
    }
  }

  /**
   * Complete order (reduce inventory)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Completion result
   */
  async completeOrder(orderId) {
    try {
      const response = await this.api.post('/api/inventory/complete-order', {
        order_id: orderId,
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error completing order ${orderId} in inventory:`, error);
      
      if (error.response) {
        throw new ServiceUnavailableError(
          `Inventory service error: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        throw new ServiceUnavailableError('Inventory service is unavailable');
      } else {
        throw new ServiceUnavailableError(`Error: ${error.message}`);
      }
    }
  }

  /**
   * Get product details
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product details
   */
  async getProductDetails(productId) {
    try {
      const response = await this.api.get(`/api/products/${productId}`);
      
      return response.data;
    } catch (error) {
      logger.error(`Error getting product details for ${productId}:`, error);
      
      if (error.response) {
        throw new ServiceUnavailableError(
          `Inventory service error: ${error.response.data.message || error.message}`
        );
      } else if (error.request) {
        throw new ServiceUnavailableError('Inventory service is unavailable');
      } else {
        throw new ServiceUnavailableError(`Error: ${error.message}`);
      }
    }
  }
}

module.exports = InventoryService;
