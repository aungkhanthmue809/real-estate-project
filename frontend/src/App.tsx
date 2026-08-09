import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { LoginRegister } from './pages/LoginRegister';
import { PropertyDetails } from './pages/PropertyDetails';
import { Dashboard } from './pages/Dashboard';
import { AddEditProperty } from './pages/AddEditProperty';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDataManagement } from './pages/AdminDataManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

function RequireAuth({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginRegister />} />
                <Route path="/register" element={<LoginRegister />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/property/add"
                  element={
                    <RequireAuth>
                      <AddEditProperty />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/property/edit/:id"
                  element={
                    <RequireAuth>
                      <AddEditProperty />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminDashboard />
                    </RequireAdmin>
                  }
                />
                <Route
                  path="/admin/data"
                  element={
                    <RequireAdmin>
                      <AdminDataManagement />
                    </RequireAdmin>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
