import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useExpenseContext } from '../context/ExpenseContext';
import { reportApi } from '../api/reportApi';

export const ReportsPage = () => {
  const { categories, people, dateRange } = useExpenseContext();

  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [personId, setPersonId] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await reportApi.downloadReport({
        format,
        startDate,
        endDate,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        personId: personId || undefined,
      });
      toast.success(`${format.toUpperCase()} report generated & downloaded`);
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Financial Reports & Data Export
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Export full transaction ledgers, category summaries, and executive KPI reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form: Filter Configuration */}
        <div className="md:col-span-2 space-y-5">
          <Card className="p-6 space-y-5">
            {/* Format choice */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                1. Select Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    format === 'pdf'
                      ? 'border-brand-700 bg-brand-50/50 ring-2 ring-brand-600 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">PDF Report</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Formatted document with executive KPIs and styled tables
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    format === 'csv'
                      ? 'border-brand-700 bg-brand-50/50 ring-2 ring-brand-600 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">CSV Spreadsheet</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Excel-ready raw data rows for accounting & sheets
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                2. Select Date Period
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600 bg-slate-50/50"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    End Date
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  3. Filter Categories
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryIds([])}
                  className="text-[11px] font-bold text-brand-700 hover:underline"
                >
                  {selectedCategoryIds.length === 0 ? 'All Selected' : 'Reset to All'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {categories.map((cat) => {
                  const isSelected =
                    selectedCategoryIds.length === 0 || selectedCategoryIds.includes(cat._id);
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => toggleCategory(cat._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                          : 'text-slate-400 bg-transparent hover:text-slate-600'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Person */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                4. Filter by Spender ("Whose Money")
              </label>
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer"
              >
                <option value="">All Spenders / Household Total</option>
                {people.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Download Button */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                size="lg"
                icon={Download}
                onClick={handleDownload}
                isLoading={isDownloading}
                className="w-full font-bold shadow-md shadow-brand-900/20"
              >
                Generate & Download {format.toUpperCase()} Report
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Info: Report Features */}
        <div className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
            <h3 className="font-bold text-sm text-teal-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> Export Capabilities
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Backend PDF rendering with PDFKit for publication-quality output.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Includes Category breakdown share percentages and executive KPIs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Tabular ledger listing date, subcategory, paid by, notes, and exact amounts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>CSV format compatible with Microsoft Excel, Apple Numbers, and Google Sheets.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
