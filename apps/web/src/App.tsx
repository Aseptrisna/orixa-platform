import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/layout/AuthGuard';
import { Role } from '@orixa/shared';

// Landing
import HomePage from './pages/landing/HomePage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ActivatePage from './pages/auth/ActivatePage';

// Admin
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import OutletsPage from './pages/admin/OutletsPage';
import TablesPage from './pages/admin/TablesPage';
import MenuPage from './pages/admin/MenuPage';
import UsersPage from './pages/admin/UsersPage';
import ReportsPage from './pages/admin/ReportsPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import FinancialReportsPage from './pages/admin/FinancialReportsPage';
import ProfilePage from './pages/admin/ProfilePage';

// POS
import PosLayout from './components/layout/PosLayout';
import PosPage from './pages/pos/PosPage';

// KDS
import KdsPage from './pages/kds/KdsPage';

// Customer Menu
import CustomerMenuPage from './pages/customer/CustomerMenuPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import TrackOrderPage from './pages/customer/TrackOrderPage';

// Super Admin
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import CompaniesPage from './pages/superadmin/CompaniesPage';
import AuditPage from './pages/superadmin/AuditPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/activate" element={<ActivatePage />} />
      
      {/* Customer QR Menu */}
      <Route path="/m/:qrToken" element={<CustomerMenuPage />} />
      <Route path="/t/:orderId" element={<OrderTrackingPage />} />
      <Route path="/track" element={<TrackOrderPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AuthGuard allowedRoles={[Role.COMPANY_ADMIN]}>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="outlets" element={<OutletsPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="financial" element={<FinancialReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* POS Routes */}
      <Route
        path="/pos"
        element={
          <AuthGuard allowedRoles={[Role.CASHIER, Role.COMPANY_ADMIN]}>
            <PosLayout />
          </AuthGuard>
        }
      >
        <Route index element={<PosPage />} />
      </Route>

      {/* KDS Routes */}
      <Route
        path="/kds"
        element={
          <AuthGuard allowedRoles={[Role.CASHIER, Role.COMPANY_ADMIN]}>
            <KdsPage />
          </AuthGuard>
        }
      />

      {/* Super Admin Routes */}
      <Route
        path="/sa"
        element={
          <AuthGuard allowedRoles={[Role.SUPER_ADMIN]}>
            <SuperAdminLayout />
          </AuthGuard>
        }
      >
        <Route index element={<CompaniesPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="audit" element={<AuditPage />} />
      </Route>
    </Routes>
  );
}

export default App;
