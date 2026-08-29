const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Expense = require('../models/Expense');

// @desc    Get all categories with subcategory count
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ isDefault: -1, name: 1 }).lean();
    
    // Attach subcategories to each category
    const categoriesWithSub = await Promise.all(
      categories.map(async (cat) => {
        const subcategories = await Subcategory.find({ categoryId: cat._id }).sort({ name: 1 }).lean();
        return { ...cat, subcategories };
      })
    );

    res.json({
      success: true,
      count: categoriesWithSub.length,
      data: categoriesWithSub,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon, isDefault } = req.body;
    const category = await Category.create({
      name: name.trim(),
      color: color || '#0F766E',
      icon: icon || 'Tag',
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name.trim();
    if (color) category.color = color;
    if (icon) category.icon = icon.trim();

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (and cascade its subcategories)
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if category has existing expenses
    const expenseCount = await Expense.countDocuments({ categoryId: category._id });
    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category "${category.name}" because it is linked to ${expenseCount} existing expense records. Please reassign or delete those expenses first.`,
      });
    }

    // Delete subcategories and category
    await Subcategory.deleteMany({ categoryId: category._id });
    await category.deleteOne();

    res.json({
      success: true,
      message: `Category "${category.name}" and its subcategories were deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
