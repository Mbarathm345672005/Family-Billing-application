import { format, parseISO, isValid } from 'date-fns';

/**
 * Format numeric amount into currency representation ($ or ₹)
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format ISO date string into readable format
 */
export const formatDate = (dateInput, pattern = 'MMM dd, yyyy') => {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isValid(d)) return '-';
    return format(d, pattern);
  } catch {
    return '-';
  }
};

/**
 * Format relative or short date
 */
export const formatShortDate = (dateInput) => {
  return formatDate(dateInput, 'dd MMM');
};

/**
 * Format date for input elements (YYYY-MM-DD)
 */
export const formatDateForInput = (dateInput = new Date()) => {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};
