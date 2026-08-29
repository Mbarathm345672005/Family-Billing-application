const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Person = require('../models/Person');

/**
 * Get comprehensive analytics summary
 * @param {Object} filters { startDate, endDate, categoryIds, personId }
 */
const getSummaryData = async ({ startDate, endDate, categoryIds, personId }) => {
  const match = {};

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();

  // Ensure start is at 00:00:00.000 and end is at 23:59:59.999
  const rangeStart = new Date(start);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(end);
  rangeEnd.setHours(23, 59, 59, 999);

  match.date = { $gte: rangeStart, $lte: rangeEnd };

  if (categoryIds && categoryIds.length > 0) {
    const validCatIds = (Array.isArray(categoryIds) ? categoryIds : categoryIds.split(','))
      .filter((id) => mongoose.Types.ObjectId.isValid(id.trim()))
      .map((id) => new mongoose.Types.ObjectId(id.trim()));
    if (validCatIds.length > 0) {
      match.categoryId = { $in: validCatIds };
    }
  }

  if (personId && mongoose.Types.ObjectId.isValid(personId)) {
    match.personId = new mongoose.Types.ObjectId(personId);
  }

  // 1. Current Period Aggregate
  const currentSummary = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSpend: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const totalSpend = currentSummary.length > 0 ? currentSummary[0].totalSpend : 0;
  const totalCount = currentSummary.length > 0 ? currentSummary[0].count : 0;

  // 2. Prior Period Comparison Calculation
  const durationMs = rangeEnd.getTime() - rangeStart.getTime();
  const prevEnd = new Date(rangeStart.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  const prevMatch = { ...match, date: { $gte: prevStart, $lte: prevEnd } };
  const prevSummary = await Expense.aggregate([
    { $match: prevMatch },
    {
      $group: {
        _id: null,
        totalSpend: { $sum: '$amount' },
      },
    },
  ]);

  const prevTotalSpend = prevSummary.length > 0 ? prevSummary[0].totalSpend : 0;
  let percentageChange = 0;
  if (prevTotalSpend > 0) {
    percentageChange = Number((((totalSpend - prevTotalSpend) / prevTotalSpend) * 100).toFixed(1));
  } else if (totalSpend > 0) {
    percentageChange = 100;
  }

  const daysDifference = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
  const dailyAverage = totalSpend > 0 ? Number((totalSpend / daysDifference).toFixed(2)) : 0;

  // 3. Category Breakdown Aggregation
  const categoryBreakdownRaw = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$categoryId',
        totalSpend: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    { $sort: { totalSpend: -1 } },
  ]);

  // Also fetch all available categories to include ones with 0 spend if needed
  const allCategories = await Category.find().sort({ name: 1 }).lean();
  const categoryMap = new Map();
  allCategories.forEach((cat) => {
    categoryMap.set(cat._id.toString(), {
      categoryId: cat._id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      isDefault: cat.isDefault,
      totalSpend: 0,
      count: 0,
      percentage: 0,
    });
  });

  categoryBreakdownRaw.forEach((item) => {
    const key = item.category._id.toString();
    if (categoryMap.has(key)) {
      categoryMap.set(key, {
        categoryId: item.category._id,
        name: item.category.name,
        color: item.category.color,
        icon: item.category.icon,
        isDefault: item.category.isDefault,
        totalSpend: item.totalSpend,
        count: item.count,
        percentage: totalSpend > 0 ? Number(((item.totalSpend / totalSpend) * 100).toFixed(1)) : 0,
      });
    }
  });

  const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);

  // 4. Person Breakdown Aggregation
  const personBreakdownRaw = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$personId',
        totalSpend: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'people',
        localField: '_id',
        foreignField: '_id',
        as: 'person',
      },
    },
    { $unwind: '$person' },
    { $sort: { totalSpend: -1 } },
  ]);

  const personBreakdown = personBreakdownRaw.map((item) => ({
    personId: item.person._id,
    name: item.person.name,
    totalSpend: item.totalSpend,
    count: item.count,
    percentage: totalSpend > 0 ? Number(((item.totalSpend / totalSpend) * 100).toFixed(1)) : 0,
  }));

  // 5. Time-Series Trend Aggregation (Grouped by Day, Week, or Month)
  let groupDateFormat = '%Y-%m-%d';
  if (daysDifference > 120) {
    groupDateFormat = '%Y-%m';
  } else if (daysDifference > 35) {
    groupDateFormat = '%Y-W%V';
  }

  const timeSeriesRaw = await Expense.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $group: {
        _id: {
          period: { $dateToString: { format: groupDateFormat, date: '$date' } },
          categoryName: '$category.name',
          categoryColor: '$category.color',
        },
        amount: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.period': 1 } },
  ]);

  // Pivot time-series data for Recharts (one object per period with category keys)
  const timeSeriesMap = new Map();

  timeSeriesRaw.forEach((entry) => {
    const period = entry._id.period;
    const catName = entry._id.categoryName;
    const amount = entry.amount;

    if (!timeSeriesMap.has(period)) {
      timeSeriesMap.set(period, { period, total: 0 });
    }

    const row = timeSeriesMap.get(period);
    row[catName] = (row[catName] || 0) + amount;
    row.total += amount;
  });

  const trendData = Array.from(timeSeriesMap.values()).sort((a, b) => (a.period > b.period ? 1 : -1));

  return {
    period: {
      startDate: rangeStart.toISOString(),
      endDate: rangeEnd.toISOString(),
      days: daysDifference,
    },
    metrics: {
      totalSpend,
      totalCount,
      prevTotalSpend,
      percentageChange,
      dailyAverage,
      topCategory: categoryBreakdown.length > 0 && categoryBreakdown[0].totalSpend > 0 ? categoryBreakdown[0] : null,
    },
    categoryBreakdown,
    personBreakdown,
    trendData,
  };
};

/**
 * Get detailed drill-down for a specific category or overall
 */
const getDetailedDrilldown = async ({ categoryId, startDate, endDate }) => {
  const match = {};

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();
  const rangeStart = new Date(start);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(end);
  rangeEnd.setHours(23, 59, 59, 999);

  match.date = { $gte: rangeStart, $lte: rangeEnd };

  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    match.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  // 1. Subcategory breakdown
  const subcategoryBreakdown = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$subcategoryId',
        totalSpend: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: '_id',
        foreignField: '_id',
        as: 'subcategory',
      },
    },
    {
      $project: {
        name: {
          $ifNull: [{ $arrayElemAt: ['$subcategory.name', 0] }, 'Uncategorized / General'],
        },
        totalSpend: 1,
        count: 1,
      },
    },
    { $sort: { totalSpend: -1 } },
  ]);

  // 2. Person breakdown for this category
  const personBreakdown = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$personId',
        totalSpend: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'people',
        localField: '_id',
        foreignField: '_id',
        as: 'person',
      },
    },
    { $unwind: '$person' },
    {
      $project: {
        name: '$person.name',
        totalSpend: 1,
        count: 1,
      },
    },
    { $sort: { totalSpend: -1 } },
  ]);

  // 3. Daily spending trend for this category
  const dailyTrend = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalSpend: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 4. Recent expenses for this category
  const expenses = await Expense.find(match)
    .populate('categoryId', 'name color icon')
    .populate('subcategoryId', 'name')
    .populate('personId', 'name')
    .sort({ date: -1 })
    .limit(50)
    .lean();

  return {
    subcategoryBreakdown,
    personBreakdown,
    dailyTrend,
    expenses,
  };
};

module.exports = {
  getSummaryData,
  getDetailedDrilldown,
};
