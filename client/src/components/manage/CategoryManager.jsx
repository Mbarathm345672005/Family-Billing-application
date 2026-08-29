import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, Check, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useExpenseContext } from '../../context/ExpenseContext';
import { categoryApi } from '../../api/categoryApi';
import { DynamicIcon, AVAILABLE_ICONS } from '../../utils/iconHelper';

const PRESET_COLORS = [
  '#0F766E', // Primary Teal
  '#F59E0B', // Amber (Electricity)
  '#0EA5E9', // Sky (Milk)
  '#22C55E', // Emerald (Groceries)
  '#8B5CF6', // Purple (Other)
  '#EC4899', // Pink
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#14B8A6', // Light Teal
  '#6366F1', // Indigo
  '#64748B', // Slate
  '#D97706', // Warm Amber
];

export const CategoryManager = () => {
  const { categories, refreshAll } = useExpenseContext();

  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#0F766E');
  const [categoryIcon, setCategoryIcon] = useState('Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subcategory management state
  const [selectedCatForSub, setSelectedCatForSub] = useState(null);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [isAddingSubcat, setIsAddingSubcat] = useState(false);

  // Delete category confirmation
  const [deleteCatId, setDeleteCatId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryColor('#0F766E');
    setCategoryIcon('Tag');
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryColor(cat.color);
    setCategoryIcon(cat.icon || 'Tag');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, {
          name: categoryName.trim(),
          color: categoryColor,
          icon: categoryIcon,
        });
        toast.success('Category updated successfully');
      } else {
        await categoryApi.create({
          name: categoryName.trim(),
          color: categoryColor,
          icon: categoryIcon,
        });
        toast.success('Category created successfully');
      }
      setIsCategoryModalOpen(false);
      await refreshAll();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    setIsDeleting(true);
    try {
      await categoryApi.delete(deleteCatId);
      toast.success('Category deleted successfully');
      setDeleteCatId(null);
      await refreshAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubcategory = async (categoryId) => {
    if (!newSubcatName.trim()) return;
    setIsAddingSubcat(true);
    try {
      await categoryApi.createSubcategory({
        name: newSubcatName.trim(),
        categoryId,
      });
      toast.success('Subcategory added');
      setNewSubcatName('');
      await refreshAll();
    } catch (err) {
      toast.error(err.message || 'Failed to add subcategory');
    } finally {
      setIsAddingSubcat(false);
    }
  };

  const handleDeleteSubcategory = async (subcatId) => {
    try {
      await categoryApi.deleteSubcategory(subcatId);
      toast.success('Subcategory removed');
      await refreshAll();
    } catch (err) {
      toast.error(err.message || 'Failed to remove subcategory');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Manage Expense Categories"
          subtitle="Configure default and custom spending categories, icons, colors, and subcategories"
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateCategory}>
              Add Category
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        <DynamicIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                          {cat.isDefault && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{cat.color}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditCategory(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-slate-100"
                        aria-label={`Edit category ${cat.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCatId(cat._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        aria-label={`Delete category ${cat.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories list */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Subcategories (
                        {cat.subcategories?.length || 0})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {cat.subcategories?.map((sub) => (
                        <span
                          key={sub._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 group/sub"
                        >
                          {sub.name}
                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategory(sub._id)}
                            className="text-slate-400 hover:text-red-600"
                            aria-label={`Delete subcategory ${sub.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {(!cat.subcategories || cat.subcategories.length === 0) && (
                        <span className="text-xs text-slate-400 italic">No subcategories</span>
                      )}
                    </div>

                    {/* Inline Add Subcategory input */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <input
                        type="text"
                        placeholder="New subcategory..."
                        value={selectedCatForSub === cat._id ? newSubcatName : ''}
                        onFocus={() => setSelectedCatForSub(cat._id)}
                        onChange={(e) => {
                          setSelectedCatForSub(cat._id);
                          setNewSubcatName(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubcategory(cat._id);
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-600"
                      />
                      <button
                        type="button"
                        disabled={selectedCatForSub !== cat._id || !newSubcatName.trim() || isAddingSubcat}
                        onClick={() => handleAddSubcategory(cat._id)}
                        className="p-1 rounded-lg bg-brand-700 text-white disabled:opacity-30 hover:bg-brand-800 transition-colors"
                        aria-label="Add subcategory"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Healthcare, Vehicle, Entertainment"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-1 focus:ring-brand-600 focus:outline-none"
            />
          </div>

          {/* Color Picker Swatches */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Color Palette *
            </label>
            <div className="flex flex-wrap gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryColor(c)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                >
                  {categoryColor === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Icon *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setCategoryIcon(item.name)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    categoryIcon === item.name
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title={item.label}
                >
                  <DynamicIcon name={item.name} className="w-4 h-4" />
                  <span className="text-[9px] truncate w-full text-center">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingCategory ? 'Update Category' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteCatId)}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? Its subcategories will also be removed. Note: If this category has existing expenses, the deletion will be prevented to protect your history."
        confirmLabel="Delete Category"
        isLoading={isDeleting}
      />
    </div>
  );
};
