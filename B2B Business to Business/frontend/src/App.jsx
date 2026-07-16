import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import ProductDetail from './pages/ProductDetail';
import Settings from './pages/Settings';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="/products/:id" element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              } />

              <Route path="/quotes" element={
                <ProtectedRoute>
                  <Quotes />
                </ProtectedRoute>
              } />

              <Route path="/quotes/:id" element={
                <ProtectedRoute>
                  <QuoteDetail />
                </ProtectedRoute>
              } />

              {}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
