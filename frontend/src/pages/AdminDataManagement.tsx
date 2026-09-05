import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Users, Home, Search, Trash2, Pencil, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { NotificationsBell } from '../components/NotificationsBell';
import type { User } from '../types';

const DEMO_USERS: User[] = [
  { id: 1, username: 'buyer', email: 'buyer@demo.com', phone: '09-123456789', role: 'USER' },
  { id: 2, username: 'seller', email: 'seller@demo.com', phone: '09-987654321', role: 'USER' },
  { id: 3, username: 'admin', email: 'admin@demo.com', phone: '09-111111111', role: 'ADMIN' },
  { id: 4, username: 'aung', email: 'aung@demo.com', phone: '09-222222222', role: 'USER' },
  { id: 5, username: 'kyaw', email: 'kyaw@demo.com', phone: '09-333333333', role: 'USER' },
];

export function AdminDataManagement() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userDraft, setUserDraft] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    setConfirmDelete(null);
  };

  const openEditUser = (u: User) => {
    setUserDraft({ ...u });
    setEditingUser(u);
  };

  const saveUser = () => {
    if (!userDraft) return;
    setUsers(users.map((u) => (u.id === userDraft.id ? userDraft : u)));
    setEditingUser(null);
    setUserDraft(null);
  };

  const initial = (name: string) => (name || 'U').charAt(0).toUpperCase();

  if (searchParams.get('tab') === 'properties') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="admin-page">
      <div className="admin-panel-topbar">
        <div className="admin-panel-brand">
          <span className="admin-panel-logo"><Home /></span>
          <span className="admin-panel-brand-name">UrbanNest</span>
          <span className="admin-panel-brand-sub">Admin Panel</span>
        </div>
        <div className="admin-panel-top-actions">
          <NotificationsBell />
          <div className="admin-panel-profile">
            <div className="admin-panel-avatar">
              {user?.avatar ? <img src={user.avatar} alt={user.username} /> : initial(user?.username || 'A')}
            </div>
            <span>{user?.username || 'admin'}</span>
          </div>
        </div>
      </div>

      <div className="adm-layout admin-panel-layout">
        <AdminSidebar active="users" />

        <main className="adm-main">
          <div className="adm-content">
            <div className="adm-mobile-tabs">
              <Link to="/admin/dashboard" className="adm-mobile-tab">
                <Home /> Properties
              </Link>
              <span className="adm-mobile-tab active">
                <Users /> Users
              </span>
            </div>

            <div className="adm-title-row">
              <div>
                <div className="adm-title">
                  All Users
                </div>
                <div className="adm-title-sub">
                  {users.length} registered accounts
                </div>
              </div>
              <div className="adm-search-wrap">
                <Search className="adm-search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="adm-search-input"
                />
              </div>
            </div>

            <div className="adm-card">
              <>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="admin-cell-id">#{u.id}</td>
                            <td>
                              <div className="adm-user-cell">
                                <div className="adm-user-avatar">
                                  {initial(u.username)}
                                </div>
                                <div className="adm-user-name">{u.username}</div>
                              </div>
                            </td>
                            <td className="admin-cell-email">{u.email}</td>
                            <td>
                              <span className={`adm-role-badge ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <div className="adm-actions">
                                {confirmDelete === `user-${u.id}` ? (
                                  <div className="adm-confirm-inline">
                                    <button onClick={() => handleDeleteUser(u.id)} className="adm-confirm-yes">Confirm</button>
                                    <button onClick={() => setConfirmDelete(null)} className="adm-confirm-no">Cancel</button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => openEditUser(u)}
                                      className="adm-icon-btn"
                                      title="Edit User"
                                    >
                                      <Pencil />
                                    </button>
                                    <button
                                      onClick={() => setConfirmDelete(`user-${u.id}`)}
                                      className="adm-icon-btn danger"
                                      title="Delete User"
                                    >
                                      <Trash2 />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsers.length === 0 && (
                    <div className="adm-empty">
                      <div className="adm-empty-icon"><Users /></div>
                      <div className="adm-empty-text">No users found</div>
                    </div>
                  )}
              </>
            </div>
          </div>
        </main>
      </div>

      {/* Edit User Modal */}
      {editingUser && userDraft && (
        <div className="dash-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="dash-modal admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">Edit User</span>
              <button className="dash-modal-close" onClick={() => setEditingUser(null)} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="admin-edit-body">
              <div className="admin-edit-field">
                <label className="admin-edit-label">Username</label>
                <input
                  type="text"
                  className="admin-edit-input"
                  value={userDraft.username}
                  onChange={(e) => setUserDraft({ ...userDraft, username: e.target.value })}
                />
              </div>
              <div className="admin-edit-field">
                <label className="admin-edit-label">Email</label>
                <input
                  type="email"
                  className="admin-edit-input"
                  value={userDraft.email}
                  onChange={(e) => setUserDraft({ ...userDraft, email: e.target.value })}
                />
              </div>
              <div className="admin-edit-field">
                <label className="admin-edit-label">Phone</label>
                <input
                  type="tel"
                  className="admin-edit-input"
                  value={userDraft.phone}
                  onChange={(e) => setUserDraft({ ...userDraft, phone: e.target.value })}
                />
              </div>
              <div className="admin-edit-field">
                <label className="admin-edit-label">Role</label>
                <select
                  className="admin-edit-select"
                  value={userDraft.role}
                  onChange={(e) => setUserDraft({ ...userDraft, role: e.target.value as User['role'] })}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="admin-edit-actions">
              <button className="dash-modal-btn cancel" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="dash-modal-btn save" onClick={saveUser}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
