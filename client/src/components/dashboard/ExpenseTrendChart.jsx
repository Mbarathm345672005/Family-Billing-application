import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { useExpenseContext } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, curr) => acc + (curr.value || 0), 0);
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[180px]">
        <p className="font-bold text-slate-300 mb-2 border-b border-slate-800 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300 font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold tabular-nums text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between font-extrabold text-teal-400">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ExpenseTrendChart = () => {
  const { summaryData, categories } = useExpenseContext();
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'

  const trendData = summaryData?.trendData || [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title="Expense Trajectory"
        subtitle="Spending trends grouped over time across selected categories"
        action={
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Bar
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Area
            </button>
          </div>
        }
      />

      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center p-4">
        {trendData.length === 0 ? (
          <div className="text-center text-slate-400 py-12 text-sm">
            No spending recorded for this timeframe.
          </div>
        ) : (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  />
                  {categories.map((cat) => (
                    <Bar
                      key={cat._id}
                      dataKey={cat.name}
                      stackId="expenseStack"
                      fill={cat.color}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              ) : (
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  />
                  {categories.map((cat) => (
                    <Area
                      key={cat._id}
                      type="monotone"
                      dataKey={cat.name}
                      stackId="expenseArea"
                      stroke={cat.color}
                      fill={cat.color}
                      fillOpacity={0.4}
                    />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
