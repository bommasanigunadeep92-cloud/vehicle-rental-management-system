import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import VehicleListingPage from './pages/VehicleListingPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import BookingPage from './pages/BookingPage';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import BookingHistoryPage from './pages/BookingHistoryPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import ProfilePage from './pages/ProfilePage';

// Admin & Manager Pages
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import VehicleManagementPage from './pages/VehicleManagementPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import FleetMaintenancePage from './pages/FleetMaintenancePage';
import NoSqlLogsPage from './pages/NoSqlLogsPage';

// Dynamic Layout Wrapper
const AppLayout = () => {
  const location = useLocation();
  const isDashboardRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/manager') ||
    location.pathname.startsWith('/customer');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      {isDashboardRoute ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Routes>
              {/* Customer Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/bookings"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <BookingHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/payments"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <PaymentStatusPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/recommendations"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/profile"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin', 'manager']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/vehicles"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <VehicleManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CustomerManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <BookingHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/maintenance"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <FleetMaintenancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <NoSqlLogsPage />
                  </ProtectedRoute>
                }
              />

              {/* Manager Routes */}
              <Route
                path="/manager"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/bookings"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'admin']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/vehicles"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'admin']}>
                    <VehicleManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/maintenance"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'admin']}>
                    <FleetMaintenancePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/vehicles" element={<VehicleListingPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/book/:vehicleId"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin', 'manager']}>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      )}

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
