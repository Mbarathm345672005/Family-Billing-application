import React from 'react';
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  PieChart,
  CalendarDays,
  Zap,
} from 'lucide-react';
import { useExpenseContext } from '../../context/ExpenseContext';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';

export const SummaryCards = () => {
  const { summaryData, dateRange, isLoadingSummary } = useExpenseContext();

  if (isLoadingSummary || !summaryData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-200/70 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { metrics, period } = summaryData;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Spend */}
      <StatCard
        title="Total Spend"
        value={formatCurrency(metrics.totalSpend)}
        percentageChange={metrics.percentageChange}
        periodLabel={dateRange.label}
        icon={IndianRupee}
        accentColor="#0F766E"
        trendType="expense"
      />

      {/* 2. Daily Average */}
      <StatCard
        title="Daily Average"
        value={formatCurrency(metrics.dailyAverage)}
        subtitle={`Over ${period.days} day${period.days > 1 ? 's' : ''}`}
        icon={CalendarDays}
        accentColor="#0EA5E9"
      />

      {/* 3. Top Spending Category */}
      <StatCard
        title="Top Category"
        value={metrics.topCategory ? metrics.topCategory.name : 'None'}
        subtitle={
          metrics.topCategory
            ? `${formatCurrency(metrics.topCategory.totalSpend)} (${metrics.topCategory.percentage}%)`
            : 'No spend recorded'
        }
        icon={PieChart}
        accentColor={metrics.topCategory?.color || '#22C55E'}
      />

      {/* 4. Total Transactions */}
      <StatCard
        title="Transactions"
        value={`${metrics.totalCount} entries`}
        subtitle="Recorded in selected period"
        icon={CreditCard}
        accentColor="#8B5CF6"
      />
    </div>
  );
};
