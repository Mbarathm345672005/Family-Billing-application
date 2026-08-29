const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Expense = require('../models/Expense');

// @desc    Get subcategories (optionally filterable by categoryId)
// @route   GET /api/subcategories
const getSubcategories = async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    const filter = {};

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const subcategories = await Subcategory.find(filter)
      .populate('categoryId', 'name color icon')
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subcategory
// @route   POST /api/subcategories
const createSubcategory = async (req, res, next) => {
  try {
    const { name, categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      categoryId,
    });

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
const updateSubcategory = async (req, res, next) => {
  try {
    const { name, categoryId } = req.body;
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    if (name) subcategory.name = name.trim();
    if (categoryId) subcategory.categoryId = categoryId;

    await subcategory.save();

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subcategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
const deleteSubcategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }

    // Unlink or check expenses using this subcategory
    await Expense.updateMany({ subcategoryId: subcategory._id }, { $set: { subcategoryId: null } });
    await subcategory.deleteOne();

    res.json({
      success: true,
      message: `Subcategory "${subcategory.name}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};
