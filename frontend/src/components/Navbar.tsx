import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, LayoutDashboard, PlusCircle, Heart, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationsBell } from './NotificationsBell';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const usesShowcaseNavbar = isHome || location.pathname.startsWith('/property/');

  return (
    <nav className={`navbar${usesShowcaseNavbar ? ' home-navbar' : ''}${isHome ? ' navbar-home-route' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">
            <Home className="w-5 h-5" />
          </span>
          UrbanNest
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">Homepage</Link>
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/contact" className="navbar-link">Contact</Link>
        </div>

        <div className="navbar-actions">
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
          <Link to="/" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> Homepage
          </Link>
          <Link to="/about" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> About Us
          </Link>
          <Link to="/contact" className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
            <Home className="w-5 h-5" /> Contact
          </Link>
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
