import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './app/store';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import ToastContainer from './components/ui/ToastContainer';
import PageTransition from './components/ui/PageTransition';

const API_URL = import.meta.env.VITE_API_URL as string ?? 'http://localhost:3000';

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {/* silent wake-up ping */});
  }, []);

  return (
    <>
      <PageTransition />
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
          
          <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
