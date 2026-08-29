import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
  RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmModal } from '../common/ConfirmModal';
import { useExpenseContext } from '../../context/ExpenseContext';
import { expenseApi } from '../../api/expenseApi';
import { DynamicIcon } from '../../utils/iconHelper';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ExpenseTable = () => {
  const {
    categories,
    people,
    openAddExpense,
    openEditExpense,
    dateRange,
    refreshAll,
  } = useExpenseContext();

  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  // Table Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterPersonId, setFilterPersonId] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpensesList = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        search: searchTerm,
        categoryId: filterCategoryId || undefined,
        personId: filterPersonId || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      };

      if (filterCategoryId) {
        params.categoryIds = filterCategoryId;
      }

      const res = await expenseApi.getAll(params);
      setExpenses(res.data || []);
      setPagination(res.pagination || { total: 0, pages: 1, limit: 20 });
      setTotalAmount(res.filteredTotalAmount || 0);
    } catch (err) {
      console.error('Failed to load expenses list:', err);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, searchTerm, filterCategoryId, filterPersonId, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchExpensesList();
  }, [fetchExpensesList]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const confirmDeleteExpense = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await expenseApi.delete(deleteTargetId);
      toast.success('Expense deleted successfully');
      setDeleteTargetId(null);
      await fetchExpensesList();
      refreshAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Strip: Search, Filters, Summary Total */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by note, description, or amount..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Filters: Category & Person */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Category select */}
            <select
              value={filterCategoryId}
              onChange={(e) => {
                setFilterCategoryId(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Person select */}
            <select
              value={filterPersonId}
              onChange={(e) => {
                setFilterPersonId(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
              aria-label="Filter by person"
            >
              <option value="">All Spenders</option>
              {people.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              icon={RotateCw}
              onClick={() => {
                fetchExpensesList();
                refreshAll(true);
              }}
              isLoading={isLoading}
              title="Refresh ledger table"
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => openAddExpense()}
              className="whitespace-nowrap"
            >
              New Expense
            </Button>
          </div>
        </div>

        {/* Filter Results Summary Strip */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{expenses.length}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.total}</span> records in{' '}
            <span className="font-semibold text-teal-700">{dateRange.label}</span>
          </div>
          <div className="font-bold text-slate-900">
            Filtered Total: <span className="text-brand-800 text-sm">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <LoadingSpinner label="Fetching expense ledger..." />
        ) : expenses.length === 0 ? (
          <EmptyState
            title="No expense records found"
            description="Try adjusting your filters or search keywords, or record a new expense."
            actionLabel="Add First Expense"
            onAction={() => openAddExpense()}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th
                      className="p-4 cursor-pointer select-none hover:text-slate-900"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Subcategory</th>
                    <th className="p-4">Paid By</th>
                    <th className="p-4">Note / Description</th>
                    <th
                      className="p-4 text-right cursor-pointer select-none hover:text-slate-900"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Amount</span>
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {expenses.map((expense) => {
                    const category = expense.categoryId;
                    const subcategory = expense.subcategoryId;
                    const person = expense.personId;

                    return (
                      <tr
                        key={expense._id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Date */}
                        <td className="p-4 whitespace-nowrap font-medium text-slate-800">
                          {formatDate(expense.date, 'MMM dd, yyyy')}
                        </td>

                        {/* Category */}
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: category?.color || '#0F766E' }}
                          >
                            <DynamicIcon name={category?.icon} className="w-3.5 h-3.5" />
                            {category?.name || 'Uncategorized'}
                          </span>
                        </td>

                        {/* Subcategory */}
                        <td className="p-4 whitespace-nowrap text-slate-700">
                          {subcategory?.name ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium text-xs">
                              {subcategory.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Person */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                            <User className="w-3 h-3 text-slate-400" />
                            {person?.name || 'Common'}
                          </span>
                        </td>

                        {/* Note */}
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {expense.note ? (
                            <span>{expense.note}</span>
                          ) : (
                            <span className="text-slate-400 italic">No notes</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="p-4 text-right font-extrabold text-slate-900 tabular-nums whitespace-nowrap text-sm sm:text-base">
                          {formatCurrency(expense.amount)}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditExpense(expense)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-slate-100 transition-colors"
                              aria-label="Edit expense"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(expense._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Strip */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
                  <span className="font-bold text-slate-900">{pagination.pages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    icon={ChevronLeft}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1 inline" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteExpense}
        title="Delete Expense Record"
        message="Are you sure you want to permanently delete this expense? This action cannot be reverted."
        confirmLabel="Delete Record"
        isLoading={isDeleting}
      />
    </div>
  );
};
