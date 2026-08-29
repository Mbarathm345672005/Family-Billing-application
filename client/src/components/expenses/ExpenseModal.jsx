import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Calendar,
  Layers,
  User,
  FileText,
  Plus,
  ArrowLeft,
  Check,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useExpenseContext } from '../../context/ExpenseContext';
import { expenseApi } from '../../api/expenseApi';
import { categoryApi } from '../../api/categoryApi';
import { personApi } from '../../api/personApi';
import { DynamicIcon } from '../../utils/iconHelper';
import { formatDateForInput } from '../../utils/formatters';

export const ExpenseModal = () => {
  const {
    isExpenseModalOpen,
    expenseToEdit,
    initialModalCategoryId,
    closeExpenseModal,
    categories,
    people,
    refreshAll,
  } = useExpenseContext();

  const isEditing = Boolean(expenseToEdit);

  // Wizard Step: 1 = Pick Category, 2 = Enter Details
  const [step, setStep] = useState(1);

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatDateForInput());
  const [subcategoryId, setSubcategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [note, setNote] = useState('');

  // Inline Quick Add State
  const [showAddSubcat, setShowAddSubcat] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [isSubmittingSubcat, setIsSubmittingSubcat] = useState(false);

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [isSubmittingPerson, setIsSubmittingPerson] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form when modal opens / editing changes
  useEffect(() => {
    if (!isExpenseModalOpen) return;

    if (expenseToEdit) {
      const catId = expenseToEdit.categoryId?._id || expenseToEdit.categoryId;
      const subId = expenseToEdit.subcategoryId?._id || expenseToEdit.subcategoryId || '';
      const pId = expenseToEdit.personId?._id || expenseToEdit.personId || '';

      setSelectedCategoryId(catId);
      setAmount(expenseToEdit.amount.toString());
      setDate(formatDateForInput(expenseToEdit.date));
      setSubcategoryId(subId);
      setPersonId(pId);
      setNote(expenseToEdit.note || '');
      setStep(2); // Jump directly to details when editing
    } else {
      // New Expense
      const defaultPerson = people.find((p) => p.isDefault) || people[0];
      setAmount('');
      setDate(formatDateForInput());
      setSubcategoryId('');
      setPersonId(defaultPerson ? defaultPerson._id : '');
      setNote('');

      if (initialModalCategoryId) {
        setSelectedCategoryId(initialModalCategoryId);
        setStep(2);
      } else {
        setSelectedCategoryId('');
        setStep(1);
      }
    }
  }, [isExpenseModalOpen, expenseToEdit, initialModalCategoryId, people]);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Handle Category Selection
  const handleSelectCategory = (catId) => {
    setSelectedCategoryId(catId);
    setSubcategoryId(''); // Reset subcategory when category changes
    setStep(2);
  };

  // Inline Add Subcategory
  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubcatName.trim() || !selectedCategoryId) return;

    setIsSubmittingSubcat(true);
    try {
      const res = await categoryApi.createSubcategory({
        name: newSubcatName.trim(),
        categoryId: selectedCategoryId,
      });
      toast.success(`Subcategory "${newSubcatName}" created`);
      setNewSubcatName('');
      setShowAddSubcat(false);
      await refreshAll();
      setSubcategoryId(res.data._id);
    } catch (err) {
      toast.error(err.message || 'Failed to create subcategory');
    } finally {
      setIsSubmittingSubcat(false);
    }
  };

  // Inline Add Person
  const handleCreatePerson = async (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    setIsSubmittingPerson(true);
    try {
      const res = await personApi.create({
        name: newPersonName.trim(),
      });
      toast.success(`Spender "${newPersonName}" added`);
      setNewPersonName('');
      setShowAddPerson(false);
      await refreshAll();
      setPersonId(res.data._id);
    } catch (err) {
      toast.error(err.message || 'Failed to add person');
    } finally {
      setIsSubmittingPerson(false);
    }
  };

  // Submit Expense Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      toast.error('Please pick a category');
      setStep(1);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!personId) {
      toast.error('Please select whose money was used');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        amount: numAmount,
        date: date || formatDateForInput(),
        categoryId: selectedCategoryId,
        subcategoryId: subcategoryId || null,
        personId,
        note: note.trim(),
      };

      if (isEditing) {
        await expenseApi.update(expenseToEdit._id, payload);
        toast.success('Expense record updated');
      } else {
        await expenseApi.create(payload);
        toast.success('Expense recorded successfully');
      }

      await refreshAll();
      closeExpenseModal();
    } catch (err) {
      toast.error(err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Amount preset chips helper
  const quickAddAmount = (addVal) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toFixed(2));
  };

  return (
    <Modal
      isOpen={isExpenseModalOpen}
      onClose={closeExpenseModal}
      title={isEditing ? 'Edit Expense Record' : 'Record New Expense'}
      subtitle={
        step === 1
          ? 'Step 1 of 2: Select Expense Category'
          : `Step 2 of 2: Enter Expense Details for ${selectedCategory?.name || 'Category'}`
      }
      maxWidth="max-w-xl"
    >
      {/* STEP 1: Pick Category Cards */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Choose a spending category to begin recording:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleSelectCategory(cat._id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all group ${
                    isSelected
                      ? 'border-brand-700 bg-brand-50/50 shadow-md ring-2 ring-brand-600'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm mb-3 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: cat.color }}
                  >
                    <DynamicIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-900 leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    {cat.subcategories?.length || 0} subcategories
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Input Expense Details */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Category Header Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs"
                style={{ backgroundColor: selectedCategory?.color || '#0F766E' }}
              >
                <DynamicIcon name={selectedCategory?.icon} className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {selectedCategory?.name}
              </span>
            </div>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <ArrowLeft className="w-3 h-3" /> Change Category
              </button>
            )}
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <IndianRupee className="w-5 h-5" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-lg font-bold text-slate-900 tabular-nums focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none"
                autoFocus
              />
            </div>
            {/* Quick amount increment pills */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Quick:</span>
              {[50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => quickAddAmount(val)}
                  className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                  +₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Paid By (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Date *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Person ("Whose Money") */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Paid By (Whose Money) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddPerson(!showAddPerson)}
                  className="text-[11px] text-brand-700 hover:underline font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Add Spender
                </button>
              </div>

              {showAddPerson ? (
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 animate-fade-in mb-2 space-y-2">
                  <input
                    type="text"
                    placeholder="e.g. Sister, Roommate"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-teal-300 bg-white"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAddPerson(false)}
                      className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <Button
                      size="sm"
                      onClick={handleCreatePerson}
                      isLoading={isSubmittingPerson}
                      className="h-7 text-xs px-2.5 py-0"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <select
                  required
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">Select spender...</option>
                  {people.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Subcategory (Filtered by Category with inline Add) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Subcategory (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowAddSubcat(!showAddSubcat)}
                className="text-[11px] text-brand-700 hover:underline font-bold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add Subcategory
              </button>
            </div>

            {showAddSubcat ? (
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 animate-fade-in mb-2 space-y-2">
                <input
                  type="text"
                  placeholder={`New subcategory under ${selectedCategory?.name}...`}
                  value={newSubcatName}
                  onChange={(e) => setNewSubcatName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-teal-300 bg-white"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddSubcat(false)}
                    className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <Button
                    size="sm"
                    onClick={handleCreateSubcategory}
                    isLoading={isSubmittingSubcat}
                    className="h-7 text-xs px-2.5 py-0"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none bg-white cursor-pointer"
              >
                <option value="">None / General</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 2L Milk, Weekly market items, Power bill..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={closeExpenseModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={Check}
            >
              {isEditing ? 'Update Expense' : 'Save Expense'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
