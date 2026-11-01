import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { CustomerDashboard } from './pages/customer/CustomerDashboard.jsx';
import { ProductCatalogue } from './pages/customer/ProductCatalogue.jsx';
import { ProductDetail } from './pages/customer/ProductDetail.jsx';
import { Cart } from './pages/customer/Cart.jsx';
import { Checkout } from './pages/customer/Checkout.jsx';
import { OrderHistory } from './pages/customer/OrderHistory.jsx';
import { OrderDetail } from './pages/customer/OrderDetail.jsx';
import { VendorDashboard } from './pages/vendor/VendorDashboard.jsx';
import { VendorApplication } from './pages/vendor/VendorApplication.jsx';
import { StoreSetup } from './pages/vendor/StoreSetup.jsx';
import { ProductList } from './pages/vendor/ProductList.jsx';
import { ProductForm } from './pages/vendor/ProductForm.jsx';
import { VendorOrders } from './pages/vendor/VendorOrders.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Storefront Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductCatalogue />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Checkout & Order Tracking */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Vendor Management & Order Fulfillment */}
                <Route
                  path="/vendor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/orders"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/apply"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                      <VendorApplication />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/setup"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <StoreSetup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/products"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <ProductList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/products/new"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/products/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <ProductForm />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
              TechMart Multi-Vendor Marketplace · Step 5: Redis Cart, Atomic Checkout & Order Fulfillment Active
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
