import React, { useState } from 'react';
import { Tag, Users } from 'lucide-react';
import { CategoryManager } from '../components/manage/CategoryManager';
import { PersonManager } from '../components/manage/PersonManager';

export const ManagePage = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'people'

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & Configurations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize spending categories, subcategories, and household member spenders
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Categories & Subcategories
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('people')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'people'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Household Spenders
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      <div>
        {activeTab === 'categories' ? <CategoryManager /> : <PersonManager />}
      </div>
    </div>
  );
};
