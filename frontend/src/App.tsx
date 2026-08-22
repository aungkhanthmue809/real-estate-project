import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { HowItWorks } from './pages/HowItWorks';
import { Faq } from './pages/Faq';
import { LoanCalculator } from './pages/LoanCalculator';
import { LegalPage } from './pages/LegalPage';
import { LoginRegister } from './pages/LoginRegister';
import { PropertyDetails } from './pages/PropertyDetails';
import { Dashboard } from './pages/Dashboard';
import { AddEditProperty } from './pages/AddEditProperty';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDataManagement } from './pages/AdminDataManagement';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PropertiesProvider } from './contexts/PropertiesContext';
import './App.css';

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/loan-calculator" element={<LoanCalculator />} />
          <Route path="/privacy" element={<LegalPage section="privacy" />} />
          <Route path="/terms" element={<LegalPage section="terms" />} />
          <Route path="/cookies" element={<LegalPage section="cookies" />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/register" element={<LoginRegister />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user/my-properties" element={<Dashboard />} />
          <Route path="/property/add" element={<AddEditProperty />} />
          <Route path="/property/edit/:id" element={<AddEditProperty />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-all" element={<AdminDataManagement />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <PropertiesProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PropertiesProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
