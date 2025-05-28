/**
 * Report service for Analytics Service
 */

const { Op } = require('sequelize');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');

/**
 * Report service
 */
class ReportService {
  /**
   * Constructor
   * @param {Object} db - Database models
   * @param {Object} services - Services
   */
  constructor(db, services) {
    this.db = db;
    this.Report = db.Report;
    this.ReportExecution = db.ReportExecution;
    this.metricService = services.metricService;
    
    // Create reports directory if it doesn't exist
    this.reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Get reports with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Object} Reports with pagination
   */
  async getReports(options) {
    const {
      page = 1,
      limit = 10,
      type,
      isScheduled,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (type) {
      where.type = type;
    }

    if (isScheduled !== undefined) {
      where.is_scheduled = isScheduled === 'true' || isScheduled === true;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Get reports
    const { count, rows } = await this.Report.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      reports: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get report by ID
   * @param {string} id - Report ID
   * @param {Object} options - Query options
   * @returns {Object} Report
   */
  async getReportById(id, options = {}) {
    const { includeExecutions = false } = options;

    const include = [];

    if (includeExecutions) {
      include.push({
        model: this.ReportExecution,
        as: 'executions',
        limit: 5,
        order: [['created_at', 'DESC']],
      });
    }

    const report = await this.Report.findByPk(id, {
      include,
    });

    if (!report) {
      throw new NotFoundError(`Report with ID ${id} not found`);
    }

    return report;
  }

  /**
   * Create report
   * @param {Object} reportData - Report data
   * @returns {Object} Created report
   */
  async createReport(reportData) {
    // Create report
    const report = await this.Report.create(reportData);

    return report;
  }

  /**
   * Update report
   * @param {string} id - Report ID
   * @param {Object} reportData - Report data
   * @returns {Object} Updated report
   */
  async updateReport(id, reportData) {
    const report = await this.getReportById(id);

    // Update report
    await report.update(reportData);

    return report;
  }

  /**
   * Delete report
   * @param {string} id - Report ID
   * @returns {boolean} Success
   */
  async deleteReport(id) {
    const report = await this.getReportById(id);

    // Start transaction
    const t = await this.db.sequelize.transaction();

    try {
      // Delete executions
      await this.ReportExecution.destroy({
        where: { report_id: id },
        transaction: t,
      });

      // Delete report
      await report.destroy({ transaction: t });

      // Commit transaction
      await t.commit();

      return true;
    } catch (error) {
      // Rollback transaction
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get report executions
   * @param {string} id - Report ID
   * @param {Object} options - Query options
   * @returns {Object} Executions with pagination
   */
  async getReportExecutions(id, options) {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = options;

    // Validate report
    await this.getReportById(id);

    const offset = (page - 1) * limit;
    const where = { report_id: id };

    // Apply filters
    if (status) {
      where.status = status;
    }

    // Get executions
    const { count, rows } = await this.ReportExecution.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      executions: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Generate report
   * @param {string} id - Report ID
   * @param {Object} parameters - Report parameters
   * @param {Object} options - Generation options
   * @returns {Object} Report execution
   */
  async generateReport(id, parameters = {}, options = {}) {
    const { userId } = options;

    // Validate report
    const report = await this.getReportById(id);

    // Create execution record
    const execution = await this.ReportExecution.create({
      report_id: id,
      status: 'processing',
      parameters,
      start_time: new Date(),
      is_scheduled: false,
      created_by: userId,
    });

    try {
      // Get report data
      const reportData = await this.getReportData(report, parameters);

      // Generate report file
      const filePath = await this.generateReportFile(report, reportData, execution.id);

      // Get file size
      const stats = fs.statSync(filePath);

      // Update execution record
      const endTime = new Date();
      await execution.update({
        status: 'completed',
        end_time: endTime,
        duration: endTime - execution.start_time,
        file_path: filePath,
        file_size: stats.size,
      });

      return {
        ...execution.get(),
        file_url: `/reports/${path.basename(filePath)}`,
      };
    } catch (error) {
      // Update execution record with error
      await execution.update({
        status: 'failed',
        end_time: new Date(),
        error: error.message,
      });

      logger.error(`Error generating report: ${error.message}`, { reportId: id, executionId: execution.id });
      throw error;
    }
  }

  /**
   * Get report data
   * @param {Object} report - Report object
   * @param {Object} parameters - Report parameters
   * @returns {Object} Report data
   * @private
   */
  async getReportData(report, parameters) {
    const reportTemplate = report.template || {};
    const reportParams = { ...report.parameters, ...parameters };

    // Default date range if not provided
    if (!reportParams.startDate) {
      const today = new Date();
      const startDate = new Date();
      startDate.setMonth(today.getMonth() - 1);
      reportParams.startDate = startDate.toISOString().split('T')[0];
    }

    if (!reportParams.endDate) {
      reportParams.endDate = new Date().toISOString().split('T')[0];
    }

    // Get metrics data
    const metricsData = {};
    if (reportTemplate.metrics && Array.isArray(reportTemplate.metrics)) {
      await Promise.all(
        reportTemplate.metrics.map(async (metricConfig) => {
          const metricId = metricConfig.id;
          const period = metricConfig.period || 'daily';

          // Get metric data
          const data = await this.metricService.getMetricData(metricId, {
            startDate: reportParams.startDate,
            endDate: reportParams.endDate,
            period,
            includeForecasts: false,
          });

          // Calculate metric value
          const metricValue = await this.metricService.calculateMetricValue(metricId, {
            startDate: reportParams.startDate,
            endDate: reportParams.endDate,
            period,
          });

          metricsData[metricId] = {
            config: metricConfig,
            data,
            value: metricValue,
          };
        })
      );
    }

    // Get KPIs data
    const kpisData = {};
    if (reportTemplate.kpis && Array.isArray(reportTemplate.kpis)) {
      await Promise.all(
        reportTemplate.kpis.map(async (kpiConfig) => {
          const kpiId = kpiConfig.id;
          const period = kpiConfig.period || 'daily';

          // Calculate KPI value
          const kpiValue = await this.metricService.calculateMetricValue(kpiId, {
            startDate: reportParams.startDate,
            endDate: reportParams.endDate,
            period,
          });

          kpisData[kpiId] = {
            config: kpiConfig,
            value: kpiValue,
          };
        })
      );
    }

    return {
      report,
      parameters: reportParams,
      metrics: metricsData,
      kpis: kpisData,
    };
  }

  /**
   * Generate report file
   * @param {Object} report - Report object
   * @param {Object} data - Report data
   * @param {string} executionId - Execution ID
   * @returns {string} File path
   * @private
   */
  async generateReportFile(report, data, executionId) {
    const format = report.format || 'pdf';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${report.name.replace(/\s+/g, '_')}_${timestamp}_${executionId}.${format}`;
    const filePath = path.join(this.reportsDir, fileName);

    switch (format) {
      case 'pdf':
        await this.generatePdfReport(filePath, report, data);
        break;
      case 'excel':
        await this.generateExcelReport(filePath, report, data);
        break;
      case 'csv':
        await this.generateCsvReport(filePath, report, data);
        break;
      default:
        throw new BadRequestError(`Unsupported report format: ${format}`);
    }

    return filePath;
  }

  /**
   * Generate PDF report
   * @param {string} filePath - File path
   * @param {Object} report - Report object
   * @param {Object} data - Report data
   * @returns {Promise} Promise
   * @private
   */
  async generatePdfReport(filePath, report, data) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      // Handle stream events
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);

      // Pipe document to stream
      doc.pipe(stream);

      // Add content to PDF
      this.addPdfReportContent(doc, report, data);

      // Finalize document
      doc.end();
    });
  }

  /**
   * Add content to PDF report
   * @param {Object} doc - PDF document
   * @param {Object} report - Report object
   * @param {Object} data - Report data
   * @private
   */
  addPdfReportContent(doc, report, data) {
    const { parameters, metrics, kpis } = data;

    // Header
    doc.fontSize(24).text(report.name, { align: 'center' });
    doc.moveDown();

    // Description
    if (report.description) {
      doc.fontSize(12).text(report.description);
      doc.moveDown();
    }

    // Parameters
    doc.fontSize(14).text('Report Parameters', { underline: true });
    doc.fontSize(12).text(`Date Range: ${parameters.startDate} to ${parameters.endDate}`);
    doc.moveDown();

    // KPIs
    if (Object.keys(kpis).length > 0) {
      doc.fontSize(14).text('Key Performance Indicators', { underline: true });
      doc.moveDown(0.5);

      Object.values(kpis).forEach((kpi) => {
        const { value } = kpi;
        doc.fontSize(12).text(`${value.display_name}: ${value.value !== null ? value.value.toFixed(2) : 'N/A'} ${value.unit || ''}`);
        
        if (value.target_value !== null && value.target_achievement !== null) {
          doc.text(`Target: ${value.target_value.toFixed(2)} ${value.unit || ''} (${value.target_achievement.toFixed(2)}% achievement)`);
        }
        
        doc.moveDown(0.5);
      });

      doc.moveDown();
    }

    // Metrics
    if (Object.keys(metrics).length > 0) {
      doc.fontSize(14).text('Metrics', { underline: true });
      doc.moveDown(0.5);

      Object.values(metrics).forEach((metric) => {
        const { value, data: metricData } = metric;
        doc.fontSize(12).text(`${value.display_name}`);
        doc.text(`Value: ${value.value !== null ? value.value.toFixed(2) : 'N/A'} ${value.unit || ''}`);
        doc.text(`Period: ${value.period}, Data Points: ${value.data_points}`);
        doc.moveDown(0.5);
      });
    }

    // Footer
    doc.fontSize(10).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
  }

  /**
   * Generate Excel report
   * @param {string} filePath - File path
   * @param {Object} report - Report object
   * @param {Object} data - Report data
   * @returns {Promise} Promise
   * @private
   */
  async generateExcelReport(filePath, report, data) {
    const workbook = new ExcelJS.Workbook();
    const { parameters, metrics, kpis } = data;

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Add title
    summarySheet.addRow([report.name]);
    summarySheet.getRow(1).font = { size: 16, bold: true };
    summarySheet.addRow([]);
    
    // Add description
    if (report.description) {
      summarySheet.addRow([report.description]);
      summarySheet.addRow([]);
    }
    
    // Add parameters
    summarySheet.addRow(['Report Parameters']);
    summarySheet.getRow(summarySheet.rowCount).font = { bold: true };
    summarySheet.addRow(['Date Range', `${parameters.startDate} to ${parameters.endDate}`]);
    summarySheet.addRow([]);
    
    // Add KPIs
    if (Object.keys(kpis).length > 0) {
      summarySheet.addRow(['Key Performance Indicators']);
      summarySheet.getRow(summarySheet.rowCount).font = { bold: true };
      
      // Add headers
      summarySheet.addRow(['KPI', 'Value', 'Unit', 'Target', 'Achievement']);
      
      // Add KPI data
      Object.values(kpis).forEach((kpi) => {
        const { value } = kpi;
        summarySheet.addRow([
          value.display_name,
          value.value !== null ? value.value.toFixed(2) : 'N/A',
          value.unit || '',
          value.target_value !== null ? value.target_value.toFixed(2) : 'N/A',
          value.target_achievement !== null ? `${value.target_achievement.toFixed(2)}%` : 'N/A',
        ]);
      });
      
      summarySheet.addRow([]);
    }
    
    // Add metrics sheets
    Object.values(metrics).forEach((metric) => {
      const { value, data: metricData } = metric;
      
      // Create sheet for metric
      const metricSheet = workbook.addWorksheet(value.display_name.substring(0, 31)); // Excel sheet names limited to 31 chars
      
      // Add headers
      metricSheet.addRow(['Date', 'Value', 'Period']);
      
      // Add data
      metricData.forEach((dataPoint) => {
        metricSheet.addRow([
          dataPoint.date,
          dataPoint.value,
          dataPoint.period,
        ]);
      });
    });
    
    // Save workbook
    await workbook.xlsx.writeFile(filePath);
    
    return filePath;
  }

  /**
   * Generate CSV report
   * @param {string} filePath - File path
   * @param {Object} report - Report object
   * @param {Object} data - Report data
   * @returns {Promise} Promise
   * @private
   */
  async generateCsvReport(filePath, report, data) {
    const { parameters, metrics, kpis } = data;
    
    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'type', title: 'Type' },
        { id: 'name', title: 'Name' },
        { id: 'value', title: 'Value' },
        { id: 'unit', title: 'Unit' },
        { id: 'target', title: 'Target' },
        { id: 'achievement', title: 'Achievement (%)' },
        { id: 'period', title: 'Period' },
      ],
    });
    
    const records = [];
    
    // Add report info
    records.push({
      type: 'Report',
      name: report.name,
      value: '',
      unit: '',
      target: '',
      achievement: '',
      period: `${parameters.startDate} to ${parameters.endDate}`,
    });
    
    // Add KPIs
    Object.values(kpis).forEach((kpi) => {
      const { value } = kpi;
      records.push({
        type: 'KPI',
        name: value.display_name,
        value: value.value !== null ? value.value.toFixed(2) : 'N/A',
        unit: value.unit || '',
        target: value.target_value !== null ? value.target_value.toFixed(2) : 'N/A',
        achievement: value.target_achievement !== null ? value.target_achievement.toFixed(2) : 'N/A',
        period: value.period,
      });
    });
    
    // Add metrics
    Object.values(metrics).forEach((metric) => {
      const { value } = metric;
      records.push({
        type: 'Metric',
        name: value.display_name,
        value: value.value !== null ? value.value.toFixed(2) : 'N/A',
        unit: value.unit || '',
        target: '',
        achievement: '',
        period: value.period,
      });
    });
    
    // Write records to CSV
    await csvWriter.writeRecords(records);
    
    return filePath;
  }

  /**
   * Schedule report
   * @param {string} id - Report ID
   * @param {Object} scheduleConfig - Schedule configuration
   * @returns {Object} Updated report
   */
  async scheduleReport(id, scheduleConfig) {
    const report = await this.getReportById(id);
    
    // Update report with schedule
    await report.update({
      schedule: scheduleConfig,
      is_scheduled: true,
    });
    
    return report;
  }

  /**
   * Unschedule report
   * @param {string} id - Report ID
   * @returns {Object} Updated report
   */
  async unscheduleReport(id) {
    const report = await this.getReportById(id);
    
    // Update report
    await report.update({
      is_scheduled: false,
    });
    
    return report;
  }

  /**
   * Get report types
   * @returns {Array} Report types
   */
  async getReportTypes() {
    const types = await this.Report.findAll({
      attributes: ['type'],
      group: ['type'],
      order: [['type', 'ASC']],
    });
    
    return types.map(t => t.type);
  }

  /**
   * Get report file
   * @param {string} id - Report ID
   * @param {string} executionId - Execution ID
   * @returns {Object} File info
   */
  async getReportFile(id, executionId) {
    // Validate report
    await this.getReportById(id);
    
    // Get execution
    const execution = await this.ReportExecution.findOne({
      where: {
        id: executionId,
        report_id: id,
      },
    });
    
    if (!execution) {
      throw new NotFoundError(`Execution with ID ${executionId} not found for report ${id}`);
    }
    
    if (execution.status !== 'completed') {
      throw new BadRequestError(`Report execution is not completed (status: ${execution.status})`);
    }
    
    if (!execution.file_path) {
      throw new NotFoundError('Report file not found');
    }
    
    // Check if file exists
    if (!fs.existsSync(execution.file_path)) {
      throw new NotFoundError('Report file not found on disk');
    }
    
    return {
      filePath: execution.file_path,
      fileName: path.basename(execution.file_path),
      fileSize: execution.file_size,
      format: path.extname(execution.file_path).substring(1),
    };
  }
}

module.exports = ReportService;
