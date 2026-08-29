import React from 'react';
import { User, Filter } from 'lucide-react';
import { useExpenseContext } from '../../context/ExpenseContext';
import { Chip } from '../common/Chip';
import { formatCurrency } from '../../utils/formatters';

export const CategoryFilterChips = () => {
  const {
    categories,
    selectedCategoryIds,
    toggleCategory,
    selectAllCategories,
    summaryData,
    people,
    selectedPersonId,
    setSelectedPersonId,
  } = useExpenseContext();

  const isAllSelected = selectedCategoryIds.length === 0;

  // Build a lookup for spend amount per category in current summary
  const spendByCatId = {};
  if (summaryData?.categoryBreakdown) {
    summaryData.categoryBreakdown.forEach((c) => {
      spendByCatId[c.categoryId] = c.totalSpend;
    });
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2 border-y border-slate-200/80 my-2">
      {/* Category Multi-Select Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>

        {/* All Categories Chip */}
        <Chip
          label="All Categories"
          isSelected={isAllSelected}
          onClick={selectAllCategories}
          badgeCount={categories.length}
        />

        {/* Individual Category Chips */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryIds.includes(cat._id);
          const spend = spendByCatId[cat._id] || 0;
          return (
            <Chip
              key={cat._id}
              label={cat.name}
              icon={cat.icon}
              color={cat.color}
              isSelected={isSelected}
              onClick={() => toggleCategory(cat._id)}
              badgeCount={spend > 0 ? formatCurrency(spend) : undefined}
            />
          );
        })}
      </div>

      {/* Person / Whose Money Filter */}
      <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Paid by:</span>
          <select
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
            aria-label="Filter by person"
          >
            <option value="">All Spenders</option>
            {people.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
