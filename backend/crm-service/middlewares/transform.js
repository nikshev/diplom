/**
 * Data transformation middleware for customer requests
 */

/**
 * Transform customer data from frontend format to backend format
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function transformCustomerData(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const { body } = req;
    
    // Transform 'name' field to 'first_name' and 'last_name'
    if (body.name && !body.first_name && !body.last_name) {
      const nameParts = body.name.trim().split(' ');
      body.first_name = nameParts[0] || '';
      body.last_name = nameParts.slice(1).join(' ') || '';
      delete body.name;
    }
    
    // Transform 'company' field to 'company_name'
    if (body.company && !body.company_name) {
      body.company_name = body.company;
      delete body.company;
    }
    
    // Ensure address is a string (it should already be, but just in case)
    if (body.address && typeof body.address === 'object') {
      body.address = JSON.stringify(body.address);
    }
    
    // Set default values for required fields if missing
    if (!body.first_name) {
      body.first_name = 'Unknown';
    }
    if (!body.last_name) {
      body.last_name = 'Customer';
    }
  }
  
  next();
}

module.exports = {
  transformCustomerData
};
