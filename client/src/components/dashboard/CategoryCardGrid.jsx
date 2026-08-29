import React from 'react';
import { ArrowRight, Plus, Eye, Receipt } from 'lucide-react';
import { useExpenseContext } from '../../context/ExpenseContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DynamicIcon } from '../../utils/iconHelper';
import { formatCurrency } from '../../utils/formatters';

export const CategoryCardGrid = () => {
  const {
    summaryData,
    openDrilldown,
    openAddExpense,
    dateRange,
  } = useExpenseContext();

  const categories = summaryData?.categoryBreakdown || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Category Breakdown Cards
          </h3>
          <p className="text-xs text-slate-500">
            Spending in {dateRange.label.toLowerCase()} per category with deep drill-down analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          return (
            <Card
              key={cat.categoryId}
              className="relative flex flex-col justify-between p-5 border-slate-200/80 hover:shadow-card-hover transition-all duration-200 group"
            >
              {/* Category accent corner glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 pointer-events-none transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: cat.color }}
              />

              <div>
                {/* Header: Icon & Category Name */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <DynamicIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {cat.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount and Percentage */}
                <div className="my-3">
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    {formatCurrency(cat.totalSpend)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>Share of Total</span>
                    <span className="font-bold text-slate-700">{cat.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(cat.percentage, 2))}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons: "Detailed View" & "+ Add" */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openDrilldown(cat)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-700 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
                  aria-label={`View detailed analysis for ${cat.name}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detailed View</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAddExpense(cat.categoryId)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                  aria-label={`Add new ${cat.name} expense`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
