import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  percentageChange,
  periodLabel,
  trendType = 'expense', // for expenses: negative is good (green), positive is higher spend (amber/red)
  accentColor = '#0F766E',
}) => {
  const hasChange = percentageChange !== undefined && percentageChange !== null;
  const isPositive = hasChange && percentageChange > 0;
  const isZero = hasChange && percentageChange === 0;

  // For expense tracking: lower spend is good (green), higher spend is warning (amber)
  const isGood = trendType === 'expense' ? !isPositive && !isZero : isPositive;

  return (
    <Card className="relative overflow-hidden p-6 transition-all duration-200 hover:-translate-y-0.5">
      {/* Decorative top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className="p-3 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
        {hasChange && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full',
              isZero
                ? 'bg-slate-100 text-slate-600'
                : isGood
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            )}
          >
            {isZero ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(percentageChange)}%
          </span>
        )}

        <span className="text-slate-500 font-medium">
          {subtitle || (periodLabel ? `vs. previous ${periodLabel.toLowerCase()}` : '')}
        </span>
      </div>
    </Card>
  );
};
