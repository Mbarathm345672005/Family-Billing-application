const { body, query, param, validationResult } = require('express-validator');

// Middleware to evaluate validation result
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: errorDetails.map((e) => e.message).join(' | '),
      errors: errorDetails,
    });
  }
  next();
};

// Category validation rules
const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }).withMessage('Category name too long'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color (e.g. #0F766E)'),
  body('icon').optional().trim().notEmpty().withMessage('Icon cannot be empty'),
  validate,
];

// Subcategory validation rules
const subcategoryRules = [
  body('name').trim().notEmpty().withMessage('Subcategory name is required').isLength({ max: 50 }).withMessage('Subcategory name too long'),
  body('categoryId').isMongoId().withMessage('Valid Category ID is required'),
  validate,
];

// Person validation rules
const personRules = [
  body('name').trim().notEmpty().withMessage('Person name is required').isLength({ max: 50 }).withMessage('Person name too long'),
  validate,
];

// Expense creation/update rules
const expenseRules = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date string (e.g. YYYY-MM-DD)'),
  body('categoryId').isMongoId().withMessage('Valid Category ID is required'),
  body('subcategoryId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Subcategory ID must be a valid Mongo ID if provided'),
  body('personId').isMongoId().withMessage('Valid Person ID is required'),
  body('note').optional().isLength({ max: 500 }).withMessage('Note must not exceed 500 characters'),
  validate,
];

const mongoIdParamRule = [
  param('id').isMongoId().withMessage('Invalid resource ID format in URL'),
  validate,
];

module.exports = {
  categoryRules,
  subcategoryRules,
  personRules,
  expenseRules,
  mongoIdParamRule,
  validate,
};
