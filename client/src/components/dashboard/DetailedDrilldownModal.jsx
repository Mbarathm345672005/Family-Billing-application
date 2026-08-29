import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Calendar,
  Layers,
  User,
  Plus,
  Edit2,
  Trash2,
  Receipt,
  Clock,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useExpenseContext } from '../../context/ExpenseContext';
import { expenseApi } from '../../api/expenseApi';
import { DynamicIcon } from '../../utils/iconHelper';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const DetailedDrilldownModal = () => {
  const {
    drilldownCategory,
    closeDrilldown,
    dateRange,
    openAddExpense,
    openEditExpense,
    refreshAll,
  } = useExpenseContext();

  const [drilldownData, setDrilldownData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('subcategories'); // 'subcategories' | 'timeline' | 'transactions'

  useEffect(() => {
    if (!drilldownCategory) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const res = await expenseApi.getDrilldown({
          categoryId: drilldownCategory.categoryId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        setDrilldownData(res.data);
      } catch (err) {
        console.error('Failed to load drilldown details:', err);
        toast.error('Could not load detailed category analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [drilldownCategory, dateRange]);

  if (!drilldownCategory) return null;

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expenseApi.delete(id);
      toast.success('Expense record deleted');
      // Refresh local drilldown data and global state
      const res = await expenseApi.getDrilldown({
        categoryId: drilldownCategory.categoryId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setDrilldownData(res.data);
      refreshAll();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const chartData = (drilldownData?.dailyTrend || []).map((item) => ({
    date: item._id,
    amount: item.totalSpend,
    count: item.count,
  }));

  return (
    <Modal
      isOpen={Boolean(drilldownCategory)}
      onClose={closeDrilldown}
      title=""
      maxWidth="max-w-3xl"
    >
      {/* Custom Header Banner with Category Theme */}
      <div className="-mt-6 -mx-6 p-6 mb-6 text-white rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${drilldownCategory.color} 0%, #0F172A 100%)`,
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            <DynamicIcon name={drilldownCategory.icon} className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-white/80">
                Detailed Analysis
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm">
                {dateRange.label}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              {drilldownCategory.name}
            </h2>
          </div>
        </div>

        <div className="text-left sm:text-right bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
          <p className="text-[11px] uppercase font-bold text-white/70">Total Spend in Period</p>
          <p className="text-2xl font-black text-white tabular-nums">
            {formatCurrency(drilldownCategory.totalSpend)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('subcategories')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'subcategories'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Subcategories & Spenders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daily Spending Trend
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Expense Ledger ({drilldownData?.expenses?.length || 0})
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-slate-400 text-sm">
          Loading detailed breakdown...
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: Subcategories and Spenders */}
          {activeTab === 'subcategories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Subcategories */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Subcategory Breakdown
                </h4>
                {drilldownData?.subcategoryBreakdown?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No subcategory records found.</p>
                ) : (
                  <div className="space-y-2.5">
                    {drilldownData?.subcategoryBreakdown?.map((sub, i) => {
                      const pct = drilldownCategory.totalSpend > 0
                        ? Number(((sub.totalSpend / drilldownCategory.totalSpend) * 100).toFixed(1))
                        : 0;
                      return (
                        <div key={i} className="text-xs">
                          <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>{sub.name}</span>
                            <span className="tabular-nums font-bold text-slate-900">
                              {formatCurrency(sub.totalSpend)} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: drilldownCategory.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Spenders ("Whose Money") */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Paid By / Whose Money
                </h4>
                {drilldownData?.personBreakdown?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No spender records found.</p>
                ) : (
                  <div className="space-y-2.5">
                    {drilldownData?.personBreakdown?.map((person, i) => {
                      const pct = drilldownCategory.totalSpend > 0
                        ? Number(((person.totalSpend / drilldownCategory.totalSpend) * 100).toFixed(1))
                        : 0;
                      return (
                        <div key={i} className="text-xs">
                          <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>{person.name}</span>
                            <span className="tabular-nums font-bold text-slate-900">
                              {formatCurrency(person.totalSpend)} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Timeline Bar Chart */}
          {activeTab === 'timeline' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Daily Trajectory in Period
              </h4>
              {chartData.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No trend data available.</p>
              ) : (
                <div className="w-full h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={{ stroke: '#CBD5E1' }}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Spent']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar dataKey="amount" fill={drilldownCategory.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Itemized Ledger List */}
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto max-h-[300px] border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Subcategory</th>
                    <th className="p-3">Paid By</th>
                    <th className="p-3">Note</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {drilldownData?.expenses?.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap text-slate-700 font-medium">
                        {formatDate(exp.date, 'MMM dd, yyyy')}
                      </td>
                      <td className="p-3 whitespace-nowrap text-slate-800">
                        {exp.subcategoryId?.name || '-'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                          {exp.personId?.name || 'Common'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 max-w-[160px] truncate">
                        {exp.note || '-'}
                      </td>
                      <td className="p-3 text-right font-extrabold text-slate-900 tabular-nums">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              closeDrilldown();
                              openEditExpense(exp);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-brand-700 hover:bg-slate-100"
                            aria-label="Edit expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp._id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            aria-label="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Footer Modal Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={closeDrilldown}
        >
          Close
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            closeDrilldown();
            openAddExpense(drilldownCategory.categoryId);
          }}
        >
          Add {drilldownCategory.name} Expense
        </Button>
      </div>
    </Modal>
  );
};
