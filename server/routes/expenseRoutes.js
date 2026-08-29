const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesSummary,
  getExpensesDrilldown,
} = require('../controllers/expenseController');
const { downloadReport } = require('../controllers/reportController');
const { expenseRules, mongoIdParamRule } = require('../middleware/validator');

// Analytics summary route (must come before /:id)
router.get('/summary', getExpensesSummary);

// Granular drilldown route
router.get('/drilldown', getExpensesDrilldown);

// Download report route
router.get('/report', downloadReport);

// Standard CRUD
router.route('/')
  .get(getExpenses)
  .post(expenseRules, createExpense);

router.route('/:id')
  .get(mongoIdParamRule, getExpenseById)
  .put(mongoIdParamRule, expenseRules, updateExpense)
  .delete(mongoIdParamRule, deleteExpense);

module.exports = router;
