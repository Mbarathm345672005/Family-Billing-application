const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const Expense = require('../models/Expense');
const { getSummaryData } = require('../services/analyticsService');
const { generatePdfReport } = require('../services/pdfReportService');

// @desc    Download filtered expenses as CSV or PDF report
// @route   GET /api/expenses/report
const downloadReport = async (req, res, next) => {
  try {
    const { format = 'csv', startDate, endDate, categoryIds, personId } = req.query;

    const match = {};

    if (startDate || endDate) {
      match.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        match.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    if (categoryIds) {
      const catArray = (Array.isArray(categoryIds) ? categoryIds : categoryIds.split(','))
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (catArray.length > 0) {
        match.categoryId = { $in: catArray.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    if (personId && mongoose.Types.ObjectId.isValid(personId)) {
      match.personId = new mongoose.Types.ObjectId(personId);
    }

    // Fetch all matching records without pagination for the export
    const expenses = await Expense.find(match)
      .populate('categoryId', 'name color icon')
      .populate('subcategoryId', 'name')
      .populate('personId', 'name')
      .sort({ date: -1 })
      .lean();

    const timestamp = new Date().toISOString().split('T')[0];

    if (format.toLowerCase() === 'pdf') {
      const summaryData = await getSummaryData({ startDate, endDate, categoryIds, personId });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=homeledger-report-${timestamp}.pdf`);

      const doc = generatePdfReport(expenses, summaryData, { startDate, endDate });
      doc.pipe(res);
      doc.end();
    } else {
      // Default: CSV export
      const fields = [
        { label: 'Expense ID', value: '_id' },
        {
          label: 'Date',
          value: (row) => (row.date ? new Date(row.date).toISOString().split('T')[0] : ''),
        },
        { label: 'Category', value: (row) => row.categoryId?.name || 'N/A' },
        { label: 'Subcategory', value: (row) => row.subcategoryId?.name || '' },
        { label: 'Paid By / Whose Money', value: (row) => row.personId?.name || 'Common / Shared' },
        { label: 'Amount', value: (row) => Number(row.amount).toFixed(2) },
        { label: 'Note', value: (row) => row.note || '' },
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(expenses);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=homeledger-expenses-${timestamp}.csv`);
      res.status(200).send(csv);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadReport,
};
