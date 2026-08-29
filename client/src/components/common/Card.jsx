import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden transition-all duration-200',
          hoverEffect && 'hover:shadow-card-hover hover:border-slate-300 cursor-pointer',
          onClick && 'cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', action, title, subtitle }) => {
  if (title) {
    return (
      <div
        className={twMerge(
          clsx(
            'px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4',
            className
          )
        )}
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        clsx('px-6 py-4 border-b border-slate-100', className)
      )}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={twMerge(clsx('p-6', className))}>
      {children}
    </div>
  );
};
