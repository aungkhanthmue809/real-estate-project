import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AtSign, CheckCircle, ChevronLeft, ChevronRight, LogOut, Mail, Phone, Search, ShieldCheck, Trash2, UserRound, Users, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationsBell } from '../components/NotificationsBell';
import { UrbanNestLogo } from '../components/UrbanNestLogo';
import { userAPI } from '../utils/api';
import type { User } from '../types';

type RoleFilter = 'ALL' | User['role'];
type PaginationItem = number | 'ellipsis';

const USERS_PER_PAGE = 10;
const initial = (name: string) => (name || 'U').charAt(0).toUpperCase();

function getPaginationItems(totalPages: number, currentPage: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  if (currentPage >= totalPages - 3) return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

export function AdminDataManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInitialized, setPageInitialized] = useState(false);
  const [roleDraft, setRoleDraft] = useState<User['role']>('USER');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    userAPI.getAll()
      .then(({ data }) => {
        if (!active) return;
        setUsers(data);
        setError('');
      })
      .catch(() => {
        if (active) setError('Unable to load the user directory. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((candidate) => {
      const matchesRole = roleFilter === 'ALL' || candidate.role === roleFilter;
      const matchesSearch = !query || [candidate.username, candidate.email, candidate.phone, String(candidate.id)]
        .some((value) => value?.toLowerCase().includes(query));
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, searchQuery, users]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const safeCurrentPage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * USERS_PER_PAGE;
  const visibleUsers = useMemo(
    () => filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE),
    [filteredUsers, startIndex]
  );
  const requestedUserParam = searchParams.get('userId');
  const requestedUserId = requestedUserParam && /^\d+$/.test(requestedUserParam) ? Number(requestedUserParam) : null;
  const selectedUser = visibleUsers.find((candidate) => candidate.id === requestedUserId) ?? visibleUsers[0] ?? null;
  const selectedUserId = selectedUser?.id;
  const selectedUserRole = selectedUser?.role;
  const rangeStart = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + visibleUsers.length, filteredUsers.length);
  const paginationItems = getPaginationItems(totalPages, safeCurrentPage);

  useEffect(() => {
    if (loading || pageInitialized) return;
    const requestedIndex = filteredUsers.findIndex((candidate) => candidate.id === requestedUserId);
    setCurrentPage(requestedIndex >= 0 ? Math.floor(requestedIndex / USERS_PER_PAGE) + 1 : 1);
    setPageInitialized(true);
  }, [filteredUsers, loading, pageInitialized, requestedUserId]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  useEffect(() => {
    if (loading || !pageInitialized || selectedUserId === requestedUserId) return;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', 'users');
      if (selectedUserId) next.set('userId', String(selectedUserId));
      else next.delete('userId');
      return next;
    }, { replace: true });
  }, [loading, pageInitialized, requestedUserId, selectedUserId, setSearchParams]);

  useEffect(() => {
    if (selectedUserRole) setRoleDraft(selectedUserRole);
  }, [selectedUserId, selectedUserRole]);

  useEffect(() => {
    setConfirmDeleteId(null);
    setNotice('');
  }, [selectedUserId]);

  const metrics = [
    { icon: Users, label: 'Total Registered', value: users.length, meta: 'All persisted accounts', tone: 'neutral' },
    { icon: ShieldCheck, label: 'Administrators', value: users.filter((candidate) => candidate.role === 'ADMIN').length, meta: 'Admin access enabled', tone: 'amber' },
    { icon: UserRound, label: 'Regular Users', value: users.filter((candidate) => candidate.role === 'USER').length, meta: 'Standard member access', tone: 'green' },
    { icon: Phone, label: 'Phone Provided', value: users.filter((candidate) => candidate.phone?.trim()).length, meta: 'Accounts with contact data', tone: 'red' },
  ];

  const selectUser = (id: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', 'users');
      next.set('userId', String(id));
      return next;
    });
  };

  const saveRole = async () => {
    if (!selectedUser || roleDraft === selectedUser.role) return;
    setUpdatingId(selectedUser.id);
    setError('');
    setNotice('');
    try {
      const { data } = await userAPI.updateRole(selectedUser.id, roleDraft);
      setUsers((current) => current.map((candidate) => candidate.id === data.id ? data : candidate));
      setNotice(`${data.username}'s role is now ${data.role}.`);
    } catch {
      setError('Unable to update this user role. Your changes were not saved.');
      setRoleDraft(selectedUser.role);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    const deletedId = selectedUser.id;
    setDeletingId(deletedId);
    setError('');
    setNotice('');
    try {
      await userAPI.delete(deletedId);
      setUsers((current) => current.filter((candidate) => candidate.id !== deletedId));
      setConfirmDeleteId(null);
    } catch {
      setError('Unable to delete this user. No account was removed.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (searchParams.get('tab') === 'properties') return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="admin-page admin-showcase-page admin-cockpit admin-user-directory">
      <div className="admin-ambient admin-ambient-one" /><div className="admin-ambient admin-ambient-two" /><div className="admin-ambient admin-ambient-three" />
      <header className="admin-cockpit-topbar"><div className="admin-cockpit-topbar-inner">
        <Link to="/admin/dashboard" className="admin-cockpit-brand"><UrbanNestLogo className="admin-cockpit-logo" /><span><strong>UrbanNest</strong><small>Admin Workspace</small></span></Link>
        <nav className="admin-cockpit-nav" aria-label="Admin navigation"><Link to="/admin/dashboard">Properties</Link><Link to="/admin/manage-all?tab=users" className={location.pathname === '/admin/manage-all' ? 'active' : ''}>Users</Link><Link to="/dashboard">Dashboard</Link><Link to="/">Main Site</Link></nav>
        <div className="admin-cockpit-account"><span className="admin-console-state"><i />Console active</span><NotificationsBell /><div className="admin-cockpit-identity"><span className="admin-cockpit-avatar">{user?.avatar ? <img src={user.avatar} alt={user.username} /> : initial(user?.username || 'A')}</span><span><strong>{user?.username || 'admin'}</strong><small>Administrator</small></span></div><button type="button" className="admin-cockpit-logout" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut /></button></div>
      </div></header>

      <main className="admin-cockpit-main admin-users-main">
        <section className="admin-cockpit-intro admin-users-intro"><div><span className="admin-header-kicker"><i />Account administration</span><h1>User Directory &amp; Role Governance</h1><p>Review registered UrbanNest accounts, find member contact details, and govern USER or ADMIN access from one focused workspace.</p></div></section>
        {(loading || error || notice) && <div className={`admin-cockpit-notice${error ? ' error' : notice ? ' success' : ''}`} role="status" aria-live="polite">{loading ? 'Loading the user directory...' : error || notice}</div>}

        <section className="admin-cockpit-metrics" aria-label="User metrics">{metrics.map((metric) => <article key={metric.label} className={`admin-cockpit-metric ${metric.tone}`}><div><span>{metric.label}</span><span className="admin-cockpit-metric-icon"><metric.icon /></span></div><strong>{metric.value}</strong><small>{metric.meta}</small></article>)}</section>

        <section className="admin-users-toolbar" aria-label="User directory filters">
          <label className="admin-users-search"><Search /><span className="sr-only">Search users</span><input type="search" placeholder="Search username, email, phone, or user ID..." value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} /></label>
          <label className="admin-users-role-filter"><span>Role</span><select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value as RoleFilter); setCurrentPage(1); }}><option value="ALL">All roles</option><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></label>
          <p><strong>{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'user matches' : 'users match'} the current filters</p>
        </section>

        <section className="admin-users-workspace">
          <div className="admin-users-list-panel">
            <div className="admin-users-list-heading"><div><span>Registered accounts</span><strong>User &amp; contact details</strong></div><span>Role</span></div>
            <div className="admin-users-list">
              {loading ? <div className="admin-users-empty"><Users /><strong>Loading registered users...</strong></div> : error && users.length === 0 ? <div className="admin-users-empty error"><XCircle /><strong>{error}</strong></div> : filteredUsers.length === 0 ? <div className="admin-users-empty"><Search /><strong>No users match these filters.</strong><span>Try a different search or role.</span></div> : visibleUsers.map((candidate) => {
                const selected = selectedUser?.id === candidate.id;
                return <button type="button" key={candidate.id} className={`admin-user-row${selected ? ' selected' : ''}`} onClick={() => selectUser(candidate.id)} aria-pressed={selected}>
                  <span className="admin-user-row-avatar">{candidate.avatar ? <img src={candidate.avatar} alt="" /> : initial(candidate.username)}</span>
                  <span className="admin-user-row-copy"><span><strong>{candidate.username}</strong><small>#{candidate.id}</small></span><span><Mail />{candidate.email}</span><span><Phone />{candidate.phone || 'No phone provided'}</span></span>
                  <span className={`admin-user-role ${candidate.role.toLowerCase()}`}>{candidate.role}</span>
                </button>;
              })}
            </div>
            <footer className="admin-users-list-footer">
              <div className="admin-users-page-context">
                <strong>Page {totalPages === 0 ? 0 : safeCurrentPage} of {totalPages}</strong>
                <span>Showing {rangeStart}&ndash;{rangeEnd} of {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}</span>
              </div>
              {totalPages > 1 && (
                <nav className="admin-users-pagination" aria-label="User directory pages">
                  <button type="button" className="admin-users-page-direction" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safeCurrentPage === 1}>
                    <ChevronLeft /><span>Previous</span>
                  </button>
                  <div className="admin-users-page-numbers">
                    {paginationItems.map((item, index) => item === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="admin-users-page-ellipsis" aria-hidden="true">&hellip;</span>
                    ) : (
                      <button
                        type="button"
                        key={item}
                        className={`admin-users-page-number${item === safeCurrentPage ? ' active' : ''}${item !== 1 && item !== safeCurrentPage && item !== totalPages ? ' mobile-hide' : ''}`}
                        onClick={() => setCurrentPage(item)}
                        aria-label={`Page ${item}`}
                        aria-current={item === safeCurrentPage ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="admin-users-page-direction" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safeCurrentPage === totalPages}>
                    <span>Next</span><ChevronRight />
                  </button>
                </nav>
              )}
            </footer>
          </div>

          <aside className="admin-user-detail" aria-label="Selected user details">
            {!selectedUser ? <div className="admin-users-empty"><UserRound /><strong>No user selected.</strong><span>Select an account to view its details.</span></div> : <>
              <div className="admin-user-detail-hero"><div className="admin-user-detail-avatar">{selectedUser.avatar ? <img src={selectedUser.avatar} alt="" /> : initial(selectedUser.username)}</div><div><span className={`admin-user-role ${selectedUser.role.toLowerCase()}`}>{selectedUser.role}</span><h2>{selectedUser.username}</h2><p>User ID #{selectedUser.id}</p></div></div>
              <div className="admin-user-detail-section"><div className="admin-user-detail-heading"><span><AtSign /></span><div><h3>Account details</h3><p>Persisted registration information.</p></div></div><dl className="admin-user-detail-data"><div><dt>Email address</dt><dd>{selectedUser.email}</dd></div><div><dt>Phone number</dt><dd>{selectedUser.phone || 'Not provided'}</dd></div><div><dt>Username</dt><dd>{selectedUser.username}</dd></div><div><dt>Database ID</dt><dd>#{selectedUser.id}</dd></div></dl></div>
              <div className="admin-user-detail-section"><div className="admin-user-detail-heading"><span><ShieldCheck /></span><div><h3>Role governance</h3><p>Change this account's existing application role.</p></div></div><label className="admin-user-role-control"><span>Assigned role</span><select value={roleDraft} onChange={(event) => setRoleDraft(event.target.value as User['role'])}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></label><button type="button" className="admin-user-save-role" onClick={saveRole} disabled={updatingId === selectedUser.id || roleDraft === selectedUser.role}><CheckCircle />{updatingId === selectedUser.id ? 'Saving role...' : 'Save role change'}</button></div>
              <div className="admin-user-danger-zone"><div><h3>Delete account</h3><p>Permanently remove this registered user using the existing admin endpoint.</p></div>{confirmDeleteId === selectedUser.id ? <div className="admin-user-delete-confirm"><p>Delete <strong>{selectedUser.username}</strong>? This action cannot be undone.</p><div><button type="button" onClick={() => setConfirmDeleteId(null)} disabled={deletingId === selectedUser.id}>Cancel</button><button type="button" className="danger" onClick={deleteUser} disabled={deletingId === selectedUser.id}>{deletingId === selectedUser.id ? 'Deleting...' : 'Confirm delete'}</button></div></div> : <button type="button" className="admin-user-delete" onClick={() => setConfirmDeleteId(selectedUser.id)}><Trash2 />Delete user</button>}</div>
            </>}
          </aside>
        </section>
      </main>
    </div>
  );
}
