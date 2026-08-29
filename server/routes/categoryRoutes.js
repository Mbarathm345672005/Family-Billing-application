const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { categoryRules, mongoIdParamRule } = require('../middleware/validator');

router.route('/')
  .get(getCategories)
  .post(categoryRules, createCategory);

router.route('/:id')
  .put(mongoIdParamRule, updateCategory)
  .delete(mongoIdParamRule, deleteCategory);

module.exports = router;
