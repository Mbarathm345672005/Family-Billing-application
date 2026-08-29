import React from 'react';

export const LoadingSpinner = ({ label = 'Loading data...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 gap-3 text-slate-500 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-700 animate-spin" />
      </div>
      {label && <p className="text-xs font-medium tracking-wide animate-pulse">{label}</p>}
    </div>
  );
};
