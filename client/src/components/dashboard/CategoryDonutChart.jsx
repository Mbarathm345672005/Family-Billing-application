import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card';
import { useExpenseContext } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import { DynamicIcon } from '../../utils/iconHelper';

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-bold text-slate-200">{data.name}</span>
        </div>
        <p className="text-sm font-extrabold text-white tabular-nums">
          {formatCurrency(data.totalSpend)}
        </p>
        <p className="text-[11px] text-teal-400 font-medium">{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

export const CategoryDonutChart = () => {
  const { summaryData, openDrilldown } = useExpenseContext();

  const categories = (summaryData?.categoryBreakdown || []).filter((c) => c.totalSpend > 0);
  const totalSpend = summaryData?.metrics?.totalSpend || 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title="Category Distribution"
        subtitle="Share of overall expenses by category"
      />

      <CardContent className="flex-1 flex flex-col justify-between p-4">
        {categories.length === 0 ? (
          <div className="text-center text-slate-400 py-12 text-sm">
            No expenses recorded in this period.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Donut Chart with Center Text */}
            <div className="relative w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={categories}
                    dataKey="totalSpend"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total
                </span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(totalSpend)}
                </span>
              </div>
            </div>

            {/* Category breakdown itemized list with progress bars */}
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.categoryId}
                  onClick={() => openDrilldown(cat)}
                  className="group flex flex-col p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <DynamicIcon name={cat.icon} className="w-3.5 h-3.5 text-slate-500" />
                      <span className="group-hover:text-brand-700 transition-colors">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">{cat.percentage}%</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatCurrency(cat.totalSpend)}
                      </span>
                    </div>
                  </div>
                  {/* Visual mini bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
