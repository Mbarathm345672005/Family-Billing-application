import React from 'react';
import { Plus, Download, RotateCw } from 'lucide-react';
import { useExpenseContext } from '../context/ExpenseContext';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { Button } from '../components/common/Button';

export const ExpensesPage = () => {
  const { openAddExpense, openReportModal, refreshAll, isRefreshing } = useExpenseContext();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Expense Ledger & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, view, edit, or delete any recorded household transaction
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="md"
            icon={RotateCw}
            onClick={() => refreshAll(true)}
            isLoading={isRefreshing}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
            title="Refresh expenses data"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={openReportModal}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => openAddExpense()}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Period Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <PeriodSelector />
      </div>

      {/* Main Expense Table */}
      <ExpenseTable />
    </div>
  );
};
