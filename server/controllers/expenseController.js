const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Person = require('../models/Person');
const { getSummaryData, getDetailedDrilldown } = require('../services/analyticsService');

// @desc    Get all expenses with filtering, search, pagination, and sorting
// @route   GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      categoryIds,
      personId,
      subcategoryId,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const match = {};

    // Date range filter
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

    // Category multi-select filter
    if (categoryIds) {
      const catArray = (Array.isArray(categoryIds) ? categoryIds : categoryIds.split(','))
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (catArray.length > 0) {
        match.categoryId = { $in: catArray.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    // Person filter
    if (personId && mongoose.Types.ObjectId.isValid(personId)) {
      match.personId = new mongoose.Types.ObjectId(personId);
    }

    // Subcategory filter
    if (subcategoryId && mongoose.Types.ObjectId.isValid(subcategoryId)) {
      match.subcategoryId = new mongoose.Types.ObjectId(subcategoryId);
    }

    // Search query (in note or numerical search)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const numVal = parseFloat(search.trim());
      const searchConditions = [{ note: searchRegex }];
      if (!isNaN(numVal)) {
        searchConditions.push({ amount: numVal });
      }
      match.$or = searchConditions;
    }

    // Sorting
    const sortObj = {};
    const validSortFields = ['date', 'amount', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'date';
    sortObj[field] = sortOrder === 'asc' ? 1 : -1;
    if (field !== '_id') {
      sortObj._id = -1; // deterministic secondary sort
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [totalExpenses, expenses] = await Promise.all([
      Expense.countDocuments(match),
      Expense.find(match)
        .populate('categoryId', 'name color icon isDefault')
        .populate('subcategoryId', 'name')
        .populate('personId', 'name isDefault')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    // Also calculate total amount of filtered set
    const totalAmountAgg = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const filteredTotalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total: totalExpenses,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalExpenses / limitNum) || 1,
      },
      filteredTotalAmount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('categoryId', 'name color icon')
      .populate('subcategoryId', 'name')
      .populate('personId', 'name');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const { amount, date, categoryId, subcategoryId, personId, note } = req.body;

    const [category, person] = await Promise.all([
      Category.findById(categoryId),
      Person.findById(personId),
    ]);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Referenced category not found' });
    }
    if (!person) {
      return res.status(404).json({ success: false, message: 'Referenced person not found' });
    }

    const expense = await Expense.create({
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      categoryId,
      subcategoryId: subcategoryId || null,
      personId,
      note: note ? note.trim() : '',
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('categoryId', 'name color icon')
      .populate('subcategoryId', 'name')
      .populate('personId', 'name');

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const { amount, date, categoryId, subcategoryId, personId, note } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (amount !== undefined) expense.amount = Number(amount);
    if (date !== undefined) expense.date = new Date(date);
    if (categoryId !== undefined) expense.categoryId = categoryId;
    if (subcategoryId !== undefined) expense.subcategoryId = subcategoryId || null;
    if (personId !== undefined) expense.personId = personId;
    if (note !== undefined) expense.note = note.trim();

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('categoryId', 'name color icon')
      .populate('subcategoryId', 'name')
      .populate('personId', 'name');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary metrics & trend aggregation
// @route   GET /api/expenses/summary
const getExpensesSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, categoryIds, personId } = req.query;
    const summary = await getSummaryData({ startDate, endDate, categoryIds, personId });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get granular drilldown for a category
// @route   GET /api/expenses/drilldown
const getExpensesDrilldown = async (req, res, next) => {
  try {
    const { categoryId, startDate, endDate } = req.query;
    const drilldown = await getDetailedDrilldown({ categoryId, startDate, endDate });

    res.json({
      success: true,
      data: drilldown,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesSummary,
  getExpensesDrilldown,
};
