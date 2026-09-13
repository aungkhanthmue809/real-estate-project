import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { LegalPage } from './pages/LegalPage';
import { LoginRegister } from './pages/LoginRegister';
import { PropertyDetails } from './pages/PropertyDetails';
import { Dashboard } from './pages/Dashboard';
import { AddEditProperty } from './pages/AddEditProperty';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDataManagement } from './pages/AdminDataManagement';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PropertiesProvider } from './contexts/PropertiesContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import './App.css';

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<LegalPage section="privacy" />} />
          <Route path="/terms" element={<LegalPage section="terms" />} />
          <Route path="/cookies" element={<LegalPage section="cookies" />} />

          <Route element={<PublicRoute><LoginRegister /></PublicRoute>}>
            <Route path="/login" element={<LoginRegister />} />
            <Route path="/register" element={<LoginRegister />} />
          </Route>

          <Route element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>}>
            <Route path="/property/:id" element={<PropertyDetails />} />
          </Route>

          <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user/my-properties" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute><AddEditProperty /></ProtectedRoute>}>
            <Route path="/property/add" element={<AddEditProperty />} />
            <Route path="/property/edit/:id" element={<AddEditProperty />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/manage-all" element={<ProtectedRoute requireAdmin><AdminDataManagement /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <FavoritesProvider>
          <PropertiesProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PropertiesProvider>
        </FavoritesProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
