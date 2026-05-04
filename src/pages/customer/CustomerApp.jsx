// ============================================================
// CUSTOMER APP — Shared cart state + sub-routes
// ============================================================
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import CustomerHome     from './CustomerHome';
import CustomerMenu     from './CustomerMenu';
import CustomerCheckout from './CustomerCheckout';
import CustomerConfirm  from './CustomerConfirm';

export default function CustomerApp() {
  // Cart state lives here — shared between Menu and Checkout
  const [cart, setCart]                   = useState([]);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  return (
    <Routes>
      <Route index                element={<CustomerHome />} />
      <Route path="menu"          element={<CustomerMenu cart={cart} setCart={setCart} />} />
      <Route path="checkout"      element={
        cart.length === 0
          ? <Navigate to="/customer/menu" replace />
          : <CustomerCheckout cart={cart} setCart={setCart} setConfirmedOrderId={setConfirmedOrderId} />
      } />
      <Route path="confirm"       element={<CustomerConfirm orderId={confirmedOrderId} />} />
    </Routes>
  );
}
