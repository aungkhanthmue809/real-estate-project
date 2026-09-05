import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Users,
  LogOut,
  Globe,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminSidebarProps {
  active: 'users';
}

export function AdminSidebar({ active }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
        <Link to="/admin/dashboard" className="adm-nav-item">
          <Home /> Properties
        </Link>
        <div className="adm-nav-section-label">Management</div>
        <Link to="/admin/manage-all?tab=users" className={`adm-nav-item ${active === 'users' ? 'active' : ''}`}>
          <Users /> All Users
        </Link>
        <Link to="/dashboard" className="adm-nav-item">
          <LayoutDashboard /> Dashboard
        </Link>
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
