const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Category color is required'],
      default: '#0F766E',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code'],
    },
    icon: {
      type: String,
      required: [true, 'Category icon name is required'],
      default: 'Tag',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Cascade delete subcategories and handle expense refs when category is removed
categorySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  const Subcategory = mongoose.model('Subcategory');
  await Subcategory.deleteMany({ categoryId: this._id });
  next();
});

module.exports = mongoose.model('Category', categorySchema);
