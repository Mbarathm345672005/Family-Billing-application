import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns';
import toast from 'react-hot-toast';
import { categoryApi } from '../api/categoryApi';
import { personApi } from '../api/personApi';
import { expenseApi } from '../api/expenseApi';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  // Periods: 'this_month', 'today', 'this_week', 'last_month', 'this_year', 'custom'
  const [period, setPeriod] = useState('this_month');
  const [customRange, setCustomRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfToday(), 'yyyy-MM-dd'),
  });

  // Category and Person filter selections
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // Empty = all selected
  const [selectedPersonId, setSelectedPersonId] = useState(''); // Empty = all people
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded metadata
  const [categories, setCategories] = useState([]);
  const [people, setPeople] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [initialModalCategoryId, setInitialModalCategoryId] = useState(null);

  const [drilldownCategory, setDrilldownCategory] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Calculate actual ISO date strings for current period
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'today':
        return {
          startDate: format(startOfToday(), 'yyyy-MM-dd'),
          endDate: format(endOfToday(), 'yyyy-MM-dd'),
          label: 'Today',
        };
      case 'this_week':
        return {
          startDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
          label: 'This Week',
        };
      case 'this_month':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
          label: 'This Month',
        };
      case 'last_month': {
        const prevMonth = subMonths(now, 1);
        return {
          startDate: format(startOfMonth(prevMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(prevMonth), 'yyyy-MM-dd'),
          label: 'Last Month',
        };
      }
      case 'this_year':
        return {
          startDate: format(startOfYear(now), 'yyyy-MM-dd'),
          endDate: format(endOfYear(now), 'yyyy-MM-dd'),
          label: 'This Year',
        };
      case 'custom':
      default:
        return {
          startDate: customRange.startDate,
          endDate: customRange.endDate,
          label: 'Custom Range',
        };
    }
  }, [period, customRange]);

  // Load Categories & People
  const fetchMetadata = useCallback(async () => {
    setIsLoadingMeta(true);
    try {
      const [catRes, personRes] = await Promise.all([
        categoryApi.getAll(),
        personApi.getAll(),
      ]);
      setCategories(catRes.data || []);
      setPeople(personRes.data || []);
    } catch (err) {
      console.error('Failed to load categories or people:', err);
      toast.error('Failed to load metadata');
    } finally {
      setIsLoadingMeta(false);
    }
  }, []);

  // Load Summary / Analytics Data
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      if (selectedCategoryIds.length > 0) {
        params.categoryIds = selectedCategoryIds.join(',');
      }

      if (selectedPersonId) {
        params.personId = selectedPersonId;
      }

      const res = await expenseApi.getSummary(params);
      setSummaryData(res.data);
    } catch (err) {
      console.error('Failed to load summary data:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [dateRange, selectedCategoryIds, selectedPersonId]);

  // Initial load
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Re-fetch summary when filters change
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchMetadata(), fetchSummary()]);
      if (showToast) {
        toast.success('Overview & expenses refreshed');
      }
    } catch (err) {
      if (showToast) {
        toast.error('Failed to refresh data');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchMetadata, fetchSummary]);

  // Category toggle logic
  const toggleCategory = useCallback((categoryId) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  const selectAllCategories = useCallback(() => {
    setSelectedCategoryIds([]);
  }, []);

  const selectOnlyCategory = useCallback((categoryId) => {
    setSelectedCategoryIds([categoryId]);
  }, []);

  // Expense Modal helpers
  const openAddExpense = useCallback((initialCatId = null) => {
    setExpenseToEdit(null);
    setInitialModalCategoryId(initialCatId);
    setIsExpenseModalOpen(true);
  }, []);

  const openEditExpense = useCallback((expense) => {
    setExpenseToEdit(expense);
    setInitialModalCategoryId(expense.categoryId?._id || expense.categoryId);
    setIsExpenseModalOpen(true);
  }, []);

  const closeExpenseModal = useCallback(() => {
    setIsExpenseModalOpen(false);
    setExpenseToEdit(null);
    setInitialModalCategoryId(null);
  }, []);

  // Drilldown modal helpers
  const openDrilldown = useCallback((category) => {
    setDrilldownCategory(category);
  }, []);

  const closeDrilldown = useCallback(() => {
    setDrilldownCategory(null);
  }, []);

  // Report modal helpers
  const openReportModal = useCallback(() => {
    setIsReportModalOpen(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setIsReportModalOpen(false);
  }, []);

  const value = {
    // Filters & Range
    period,
    setPeriod,
    customRange,
    setCustomRange,
    dateRange,
    selectedCategoryIds,
    setSelectedCategoryIds,
    toggleCategory,
    selectAllCategories,
    selectOnlyCategory,
    selectedPersonId,
    setSelectedPersonId,
    searchQuery,
    setSearchQuery,

    // Data
    categories,
    people,
    summaryData,
    isLoadingSummary,
    isLoadingMeta,
    isRefreshing,
    fetchMetadata,
    fetchSummary,
    refreshAll,

    // Modals
    isExpenseModalOpen,
    expenseToEdit,
    initialModalCategoryId,
    openAddExpense,
    openEditExpense,
    closeExpenseModal,

    drilldownCategory,
    openDrilldown,
    closeDrilldown,

    isReportModalOpen,
    openReportModal,
    closeReportModal,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpenseContext = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
};
