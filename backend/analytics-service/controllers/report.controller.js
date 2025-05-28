/**
 * Report controller for Analytics Service
 */

const { ValidationError } = require('../utils/errors');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

/**
 * Report controller
 */
class ReportController {
  /**
   * Constructor
   * @param {Object} services - Services
   */
  constructor(services) {
    this.reportService = services.reportService;
  }

  /**
   * Get reports
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getReports(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        type: req.query.type,
        isScheduled: req.query.isScheduled,
        search: req.query.search,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'ASC',
      };

      const result = await this.reportService.getReports(options);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get report by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getReportById(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        includeExecutions: req.query.includeExecutions === 'true',
      };

      const report = await this.reportService.getReportById(id, options);

      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async createReport(req, res, next) {
    try {
      const reportData = req.body;
      
      // Add created_by if user is authenticated
      if (req.user) {
        reportData.created_by = req.user.id;
      }

      const report = await this.reportService.createReport(reportData);

      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateReport(req, res, next) {
    try {
      const { id } = req.params;
      const reportData = req.body;
      
      // Add updated_by if user is authenticated
      if (req.user) {
        reportData.updated_by = req.user.id;
      }

      const report = await this.reportService.updateReport(id, reportData);

      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async deleteReport(req, res, next) {
    try {
      const { id } = req.params;
      await this.reportService.deleteReport(id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get report executions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getReportExecutions(req, res, next) {
    try {
      const { id } = req.params;
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        status: req.query.status,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC',
      };

      const result = await this.reportService.getReportExecutions(id, options);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async generateReport(req, res, next) {
    try {
      const { id } = req.params;
      const parameters = req.body;
      const options = {
        userId: req.user ? req.user.id : null,
      };

      const result = await this.reportService.generateReport(id, parameters, options);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download report file
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async downloadReportFile(req, res, next) {
    try {
      const { id, executionId } = req.params;
      const fileInfo = await this.reportService.getReportFile(id, executionId);

      // Set content type based on format
      let contentType = 'application/octet-stream';
      switch (fileInfo.format) {
        case 'pdf':
          contentType = 'application/pdf';
          break;
        case 'excel':
        case 'xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          contentType = 'text/csv';
          break;
      }

      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
      res.setHeader('Content-Length', fileInfo.fileSize);

      // Stream file
      const fileStream = fs.createReadStream(fileInfo.filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Schedule report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async scheduleReport(req, res, next) {
    try {
      const { id } = req.params;
      const scheduleConfig = req.body;

      const report = await this.reportService.scheduleReport(id, scheduleConfig);

      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unschedule report
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async unscheduleReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = await this.reportService.unscheduleReport(id);

      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get report types
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async getReportTypes(req, res, next) {
    try {
      const types = await this.reportService.getReportTypes();

      res.status(200).json(types);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
