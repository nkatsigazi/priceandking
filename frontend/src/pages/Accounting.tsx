import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AccountingOverview from '../components/accounting/AccountingOverview';
import InvoicesPage from '../components/accounting/InvoicesPage';
import ExpensesPage from '../components/accounting/ExpensesPage';
import ReportsPage from '../components/accounting/ReportsPage';
import ChartOfAccounts from '../components/accounting/ChartOfAccounts';

const Accounting = () => {
  return (
    <Routes>
      <Route index element={<AccountingOverview />} />
      <Route path="invoices" element={<InvoicesPage />} />
      <Route path="expenses" element={<ExpensesPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="coa" element={<ChartOfAccounts />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default Accounting;