import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, LayoutDashboard, PlusCircle, Heart, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { NotificationsBell } from './NotificationsBell';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path ? 'navbar-link active' : 'navbar-link';
  const isKnowledgeActive = pathname === '/loan-calculator';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">
            <Home className="w-5 h-5" />
          </span>
          UrbanNest
        </Link>

        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/about" className={isActive('/about')}>About</Link>
          <Link to="/contact" className={isActive('/contact')}>Contact</Link>
          <Link to="/how-it-works" className={isActive('/how-it-works')}>{t('navHowItWorks')}</Link>
          <Link to="/faq" className={isActive('/faq')}>FAQ</Link>
          <div className="navbar-dropdown" onMouseEnter={() => setKnowledgeOpen(true)} onMouseLeave={() => setKnowledgeOpen(false)}>
            <span className={`navbar-link ${isKnowledgeActive ? 'active' : ''}`}>
              {t('navKnowledge')} <ChevronDown className={`navbar-chevron ${knowledgeOpen ? 'open' : ''}`} />
            </span>
            {knowledgeOpen && (
              <div className="navbar-dropdown-menu">
                <Link to="/loan-calculator" className="navbar-dropdown-item" onClick={() => setKnowledgeOpen(false)}>{t('navLoanCalc')}</Link>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-actions">
          <button onClick={toggleLanguage} className="lang-switcher" title="Switch Language">
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'EN' : 'MY'}
          </button>

          {isAuthenticated ? (
            <>
              {user && (
                <Link to="/user/my-properties" className="navbar-user" title="My Profile">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="navbar-user-avatar" />
                  ) : (
                    <span className="navbar-user-avatar navbar-user-avatar-initial">
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
              )}
              <NotificationsBell />
              <Link to="/user/my-properties" className="btn-signin">Dashboard</Link>
              {user?.role === 'USER' && (
                <Link to="/property/add" className="btn-getstarted">Add Property</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="btn-getstarted">Admin</Link>
              )}
              <button onClick={logout} className="btn-signin">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-signin">Sign In</Link>
              <Link to="/register" className="btn-getstarted">Get Started</Link>
            </>
          )}

          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu active">
          <Link to="/" className={isActive('/')} onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link to="/about" className={isActive('/about')} onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> About Us
          </Link>
          <Link to="/contact" className={isActive('/contact')} onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> Contact
          </Link>
          <Link to="/how-it-works" className={isActive('/how-it-works')} onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> {t('navHowItWorks')}
          </Link>
          <Link to="/faq" className={isActive('/faq')} onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> FAQ
          </Link>
          <button className={`mobile-menu-link ${isKnowledgeActive ? 'active' : ''}`} onClick={() => setKnowledgeOpen(!knowledgeOpen)}>
            <Home className="w-5 h-5" /> {t('navKnowledge')} <ChevronDown className={`mobile-chevron ${knowledgeOpen ? 'open' : ''}`} />
          </button>
          {knowledgeOpen && (
            <div className="mobile-submenu">
              <Link to="/loan-calculator" className={isActive('/loan-calculator')} onClick={() => setMobileOpen(false)}>{t('navLoanCalc')}</Link>
            </div>
          )}
          <Link to="/user/my-properties" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/user/my-properties" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
            <Heart className="w-5 h-5" /> Favorites
          </Link>
          {user?.role === 'USER' && (
            <Link to="/property/add" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
              <PlusCircle className="w-5 h-5" /> Add Property
            </Link>
          )}
          <button onClick={() => { toggleLanguage(); setMobileOpen(false); }} className="mobile-menu-link">
            <Globe className="w-5 h-5" /> {language === 'en' ? 'Myanmar' : 'English'}
          </button>
          {isAuthenticated ? (
            <button onClick={() => { logout(); setMobileOpen(false); }} className="mobile-menu-link" style={{ color: '#ef4444' }}>
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          ) : (
            <>
              <Link to="/login" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-getstarted" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }} onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
