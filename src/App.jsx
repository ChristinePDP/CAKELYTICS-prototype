import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout }            from './components/layout/AppLayout';
import LoginPage                from './pages/LoginPage';
import AnalyticsPage            from './pages/AnalyticsPage';
import POSPage                  from './pages/POSPage';
import AllOrdersPage            from './pages/AllOrdersPage';
import ProductManagementPage    from './pages/ProductManagementPage';
import InventoryPage            from './pages/InventoryPage';
import CustomerApp              from './pages/customer/CustomerApp';
import ReceiptViewer            from './pages/customer/ReceiptViewer';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Routes>
      {/* ── Customer-facing routes (no auth needed) ── */}
      <Route path="/customer/*"       element={<CustomerApp />} />
      <Route path="/receipt/:orderId" element={<ReceiptViewer />} />

      {/* ── Login ── */}
      <Route
        path="/login"
        element={
          isLoggedIn
            ? <Navigate to="/" replace />
            : <LoginPage onLogin={handleLogin} />
        }
      />

      {/* ── Admin routes (auth-gated) ── */}
      <Route path="/*" element={
        !isLoggedIn
          ? <Navigate to="/login" replace />
          : (
            <AppLayout onLogout={handleLogout}>
              <Routes>
                <Route path="/"          element={<AnalyticsPage />} />
                <Route path="/pos"       element={<POSPage />} />
                <Route path="/orders"    element={<AllOrdersPage />} />
                <Route path="/products"  element={<ProductManagementPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
              </Routes>
            </AppLayout>
          )
      } />
    </Routes>
  );
}