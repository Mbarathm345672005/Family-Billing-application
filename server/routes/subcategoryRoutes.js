const express = require('express');
const router = express.Router();
const {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require('../controllers/subcategoryController');
const { subcategoryRules, mongoIdParamRule } = require('../middleware/validator');

router.route('/')
  .get(getSubcategories)
  .post(subcategoryRules, createSubcategory);

router.route('/:id')
  .put(mongoIdParamRule, updateSubcategory)
  .delete(mongoIdParamRule, deleteSubcategory);

module.exports = router;
