import React from 'react';
import { Calendar, ChevronDown, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useExpenseContext } from '../../context/ExpenseContext';

export const PeriodSelector = () => {
  const { period, setPeriod, customRange, setCustomRange } = useExpenseContext();

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Quick period buttons container */}
      <div className="inline-flex p-1 bg-slate-200/80 rounded-xl max-w-full overflow-x-auto">
        {periods.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriod(item.id)}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[36px] select-none',
              period === item.id
                ? 'bg-white text-brand-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Inputs if "Custom" is selected */}
      {period === 'custom' && (
        <div className="flex items-center gap-2 animate-fade-in bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <Calendar className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
          <input
            type="date"
            value={customRange.startDate}
            onChange={(e) =>
              setCustomRange((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
            aria-label="Start date"
          />
          <span className="text-slate-400 font-medium">to</span>
          <input
            type="date"
            value={customRange.endDate}
            onChange={(e) =>
              setCustomRange((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="px-2 py-1 rounded-lg border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
            aria-label="End date"
          />
        </div>
      )}
    </div>
  );
};
