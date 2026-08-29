import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { ExpenseProvider, useExpenseContext } from './context/ExpenseContext';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { ManagePage } from './pages/ManagePage';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { DetailedDrilldownModal } from './components/dashboard/DetailedDrilldownModal';
import { ReportModal } from './components/reports/ReportModal';

const AppContent = () => {
  const { openAddExpense } = useExpenseContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/manage" element={<ManagePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-30">
        <button
          type="button"
          onClick={() => openAddExpense()}
          className="w-14 h-14 rounded-full bg-brand-700 hover:bg-brand-800 text-white flex items-center justify-center shadow-elevated focus:outline-none active:scale-95 transition-transform"
          aria-label="Quick Add Expense"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Global Modals */}
      <ExpenseModal />
      <DetailedDrilldownModal />
      <ReportModal />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#14B8A6',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </BrowserRouter>
  );
}
