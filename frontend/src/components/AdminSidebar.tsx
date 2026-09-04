import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Clock,
  Users,
  LogOut,
  Globe,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminSidebarProps {
  active: 'dashboard' | 'properties' | 'users';
  onTabChange?: (tab: 'users' | 'properties') => void;
}

export function AdminSidebar({ active, onTabChange }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const goToTab = (tab: 'users' | 'properties') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      navigate(`/admin/manage-all?tab=${tab}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initial = (name: string) => (name || 'U').charAt(0).toUpperCase();

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-user">
        <div className="adm-sidebar-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            initial(user?.username || 'U')
          )}
        </div>
        <div>
          <div className="adm-sidebar-name">{user?.username}</div>
          <span className="adm-sidebar-role">ADMIN</span>
        </div>
      </div>

      <nav className="adm-nav">
        <div className="adm-nav-section-label">Main</div>
        <Link to="/admin/dashboard" className={`adm-nav-item ${active === 'dashboard' ? 'active' : ''}`}>
          <LayoutDashboard /> Dashboard
        </Link>

        <div className="adm-nav-section-label">Property</div>
        <button
          onClick={() => goToTab('properties')}
          className={`adm-nav-item ${active === 'properties' ? 'active' : ''}`}
        >
          <Home /> All Properties
        </button>

        <div className="adm-nav-section-label">Management</div>
        <Link to="/admin/dashboard" className="adm-nav-item">
          <Clock /> Pending Approvals
        </Link>
        <div className="adm-nav-section-label">User</div>
        <button
          onClick={() => goToTab('users')}
          className={`adm-nav-item ${active === 'users' ? 'active' : ''}`}
        >
          <Users /> All Users
        </button>
        <Link to="/" className="adm-nav-item">
          <Globe /> View Website
        </Link>
      </nav>

      <button onClick={handleLogout} className="adm-nav-item adm-nav-logout">
        <LogOut /> Logout
      </button>
    </aside>
  );
}
