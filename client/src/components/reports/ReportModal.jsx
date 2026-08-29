import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Download, Calendar, Filter, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useExpenseContext } from '../../context/ExpenseContext';
import { reportApi } from '../../api/reportApi';

export const ReportModal = () => {
  const {
    isReportModalOpen,
    closeReportModal,
    categories,
    people,
    dateRange,
    customRange,
  } = useExpenseContext();

  const [format, setFormat] = useState('pdf'); // 'pdf' | 'csv'
  const [selectedCats, setSelectedCats] = useState([]); // empty = all
  const [personId, setPersonId] = useState('');
  const [startDate, setStartDate] = useState(dateRange.startDate);
  const [endDate, setEndDate] = useState(dateRange.endDate);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleCategorySelection = (catId) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await reportApi.downloadReport({
        format,
        startDate,
        endDate,
        categoryIds: selectedCats.length > 0 ? selectedCats : undefined,
        personId: personId || undefined,
      });
      toast.success(`${format.toUpperCase()} report downloaded successfully`);
      closeReportModal();
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate and download report');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isReportModalOpen}
      onClose={closeReportModal}
      title="Export Financial Report"
      subtitle="Generate and download customized expense summaries in PDF or CSV format"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* 1. Format Selector (Cards) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Select Export Format *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* PDF Option */}
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                format === 'pdf'
                  ? 'border-brand-700 bg-brand-50/60 ring-2 ring-brand-600 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">PDF Document</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Styled summary tables, executive KPIs & ledger
                </p>
              </div>
            </button>

            {/* CSV Option */}
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                format === 'csv'
                  ? 'border-brand-700 bg-brand-50/60 ring-2 ring-brand-600 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Excel / CSV</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Raw tabular data ready for spreadsheets
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Date Range */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Date Range *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">FROM</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block mb-1">TO</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-600"
              />
            </div>
          </div>
        </div>

        {/* 3. Category Filter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Filter Categories
            </label>
            <button
              type="button"
              onClick={() => setSelectedCats([])}
              className="text-[11px] text-brand-700 hover:underline font-bold"
            >
              Select All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
            {categories.map((cat) => {
              const isSelected = selectedCats.length === 0 || selectedCats.includes(cat._id);
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategorySelection(cat._id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-300'
                      : 'text-slate-400 bg-transparent hover:text-slate-600'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-brand-700" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Spender / Person Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Paid By (Whose Money)
          </label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer"
          >
            <option value="">All Spenders (Household)</option>
            {people.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={closeReportModal} disabled={isDownloading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={handleDownload}
            isLoading={isDownloading}
          >
            Download {format.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
