import React from 'react';
import { clsx } from 'clsx';
import { DynamicIcon } from '../../utils/iconHelper';

export const Chip = ({
  label,
  icon,
  color,
  isSelected = false,
  onClick,
  badgeCount,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border select-none focus-visible:ring-2 focus-visible:ring-offset-1 min-h-[36px]',
        isSelected
          ? 'shadow-sm text-white'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
        className
      )}
      style={
        isSelected && color
          ? {
              backgroundColor: color,
              borderColor: color,
              boxShadow: `0 2px 8px -1px ${color}66`,
            }
          : isSelected
          ? {
              backgroundColor: '#0F766E',
              borderColor: '#0F766E',
            }
          : {}
      }
    >
      {icon && (
        <span
          className={clsx(
            'flex items-center justify-center',
            isSelected ? 'text-white' : 'text-slate-500'
          )}
        >
          <DynamicIcon name={icon} className="w-3.5 h-3.5" />
        </span>
      )}
      <span>{label}</span>
      {badgeCount !== undefined && (
        <span
          className={clsx(
            'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
            isSelected
              ? 'bg-white/25 text-white'
              : 'bg-slate-100 text-slate-600'
          )}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );
};
