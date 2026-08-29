import React from 'react';
import { Download, Plus, Sparkles, RotateCw } from 'lucide-react';
import { useExpenseContext } from '../context/ExpenseContext';
import { PeriodSelector } from '../components/dashboard/PeriodSelector';
import { CategoryFilterChips } from '../components/dashboard/CategoryFilterChips';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ExpenseTrendChart } from '../components/dashboard/ExpenseTrendChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { CategoryCardGrid } from '../components/dashboard/CategoryCardGrid';
import { Button } from '../components/common/Button';

export const DashboardPage = () => {
  const { dateRange, openAddExpense, openReportModal, refreshAll, isRefreshing } = useExpenseContext();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Expense Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" /> Real-time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyzing household spending trajectory for <span className="font-semibold text-slate-800">{dateRange.label}</span> ({dateRange.startDate} to {dateRange.endDate})
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="md"
            icon={RotateCw}
            onClick={() => refreshAll(true)}
            isLoading={isRefreshing}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
            title="Refresh overview metrics and charts"
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={openReportModal}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Download Report
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => openAddExpense()}
            className="shadow-sm font-bold"
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <PeriodSelector />
      </div>

      {/* Category Multi-Select Chips & Person Filter */}
      <CategoryFilterChips />

      {/* Metric Summary Cards */}
      <SummaryCards />

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseTrendChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Category Breakdown Cards with Detailed View Drill-Down */}
      <CategoryCardGrid />
    </div>
  );
};
