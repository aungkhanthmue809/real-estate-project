import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Home, Search, Trash2, Eye, MapPin, Pencil, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { NotificationsBell } from '../components/NotificationsBell';
import { adminAPI } from '../utils/api';
import type { Property, PropertyRequest, User } from '../types';

const DEMO_USERS: User[] = [
  { id: 1, username: 'buyer', email: 'buyer@demo.com', phone: '09-123456789', role: 'USER' },
  { id: 2, username: 'seller', email: 'seller@demo.com', phone: '09-987654321', role: 'USER' },
  { id: 3, username: 'admin', email: 'admin@demo.com', phone: '09-111111111', role: 'ADMIN' },
  { id: 4, username: 'aung', email: 'aung@demo.com', phone: '09-222222222', role: 'USER' },
  { id: 5, username: 'kyaw', email: 'kyaw@demo.com', phone: '09-333333333', role: 'USER' },
];

export function AdminDataManagement() {
  const { user } = useAuth();
  const { refreshProperties } = useProperties();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'properties' ? 'properties' : 'users';
  const [activeTab, setActiveTab] = useState<'users' | 'properties'>(initialTab);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertyError, setPropertyError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userDraft, setUserDraft] = useState<User | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propDraft, setPropDraft] = useState<Property | null>(null);

  useEffect(() => {
    let active = true;

    adminAPI.getAllProperties()
      .then(({ data }) => {
        if (active) setProperties(data);
      })
      .catch(() => {
        if (active) setPropertyError('Unable to load properties.');
      })
      .finally(() => {
        if (active) setPropertiesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    setConfirmDelete(null);
  };

  const handleDeleteProperty = async (id: number) => {
    setPropertyError('');
    try {
      await adminAPI.deleteProperty(id);
      setProperties((prev) => prev.filter((property) => property.id !== id));
      refreshProperties().catch(() => undefined);
      setConfirmDelete(null);
    } catch {
      setPropertyError('Unable to delete the property.');
    }
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

  const openEditProperty = (p: Property) => {
    setPropDraft({ ...p });
    setEditingProperty(p);
  };

  const saveProperty = async () => {
    if (!propDraft) return;

    const request: PropertyRequest = {
      title: propDraft.title,
      description: propDraft.description,
      price: propDraft.price,
      location: propDraft.location,
      propertyType: propDraft.propertyType,
      status: propDraft.status,
      bedrooms: propDraft.bedrooms,
      bathrooms: propDraft.bathrooms,
      area: propDraft.area,
      imageUrl: propDraft.imageUrl,
    };

    setPropertyError('');
    try {
      const { data: updatedProperty } = await adminAPI.updateProperty(propDraft.id, request);

      if (editingProperty && propDraft.approvalStatus !== editingProperty.approvalStatus) {
        if (propDraft.approvalStatus === 'APPROVED') {
          await adminAPI.approve(propDraft.id);
        } else if (propDraft.approvalStatus === 'REJECTED') {
          await adminAPI.reject(propDraft.id);
        }
      }

      setProperties((prev) => prev.map((property) => (
        property.id === propDraft.id
          ? { ...updatedProperty, approvalStatus: propDraft.approvalStatus }
          : property
      )));
      refreshProperties().catch(() => undefined);
      setEditingProperty(null);
      setPropDraft(null);
    } catch (error) {
      setPropertyError(error instanceof Error ? error.message : 'Unable to update the property.');
    }
  };

  const setPropField = <K extends keyof Property>(key: K, value: Property[K]) => {
    setPropDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const initial = (name: string) => (name || 'U').charAt(0).toUpperCase();

  const statusBadge = (status: Property['approvalStatus']) => (
    <span
      className={`dash-badge ${
        status === 'APPROVED' ? 'approved'
        : status === 'PENDING' ? 'pending' : 'rejected'
      }`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );

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
        <AdminSidebar active={activeTab === 'users' ? 'users' : 'properties'} onTabChange={setActiveTab} />

        <main className="adm-main">
          <div className="adm-content">
            <div className="adm-mobile-tabs">
              <button
                onClick={() => setActiveTab('users')}
                className={`adm-mobile-tab ${activeTab === 'users' ? 'active' : ''}`}
              >
                <Users /> Users
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`adm-mobile-tab ${activeTab === 'properties' ? 'active' : ''}`}
              >
                <Home /> Properties
              </button>
            </div>

            <div className="adm-title-row">
              <div>
                <div className="adm-title">
                  {activeTab === 'users' ? 'All Users' : 'All Properties'}
                </div>
                <div className="adm-title-sub">
                  {activeTab === 'users' ? `${users.length} registered accounts` : `${properties.length} total listings`}
                </div>
              </div>
              <div className="adm-search-wrap">
                <Search className="adm-search-icon" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="adm-search-input"
                />
              </div>
            </div>

            {activeTab === 'properties' && (propertiesLoading || propertyError) && (
              <div className="adm-title-sub">
                {propertiesLoading ? 'Loading properties...' : propertyError}
              </div>
            )}

            <div className="adm-card">
              {activeTab === 'users' ? (
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
              ) : (
                <>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Property</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProperties.map((property) => (
                          <tr key={property.id}>
                            <td className="admin-cell-id">#{property.id}</td>
                            <td>
                              <div className="adm-property-cell">
                                <img src={property.imageUrl} alt="" className="adm-property-thumb" />
                                <div>
                                  <div className="adm-property-name">{property.title}</div>
                                  <div className="adm-property-loc">
                                    <MapPin style={{ width: 12, height: 12, verticalAlign: 'middle' }} /> {property.location}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{statusBadge(property.approvalStatus)}</td>
                            <td className="adm-price">MMK {property.price.toLocaleString()}</td>
                            <td>
                              <div className="adm-actions">
                                {confirmDelete === `prop-${property.id}` ? (
                                  <div className="adm-confirm-inline">
                                    <button onClick={() => handleDeleteProperty(property.id)} className="adm-confirm-yes">Confirm</button>
                                    <button onClick={() => setConfirmDelete(null)} className="adm-confirm-no">Cancel</button>
                                  </div>
                                ) : (
                                  <>
                                    <Link to={`/property/${property.id}`} className="adm-icon-btn" aria-label="View">
                                      <Eye />
                                    </Link>
                                    <button
                                      onClick={() => openEditProperty(property)}
                                      className="adm-icon-btn"
                                      title="Edit Property"
                                    >
                                      <Pencil />
                                    </button>
                                    <button
                                      onClick={() => setConfirmDelete(`prop-${property.id}`)}
                                      className="adm-icon-btn danger"
                                      title="Delete Property"
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
                  {!propertiesLoading && filteredProperties.length === 0 && (
                    <div className="adm-empty">
                      <div className="adm-empty-icon"><Home /></div>
                      <div className="adm-empty-text">No properties found</div>
                    </div>
                  )}
                </>
              )}
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

      {/* Edit Property Modal */}
      {editingProperty && propDraft && (
        <div className="dash-modal-overlay" onClick={() => setEditingProperty(null)}>
          <div className="dash-modal admin-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">Edit Property</span>
              <button className="dash-modal-close" onClick={() => setEditingProperty(null)} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="admin-edit-body admin-edit-scroll">
              <div className="admin-edit-field">
                <label className="admin-edit-label">Title</label>
                <input
                  type="text"
                  className="admin-edit-input"
                  value={propDraft.title}
                  onChange={(e) => setPropField('title', e.target.value)}
                />
              </div>
              <div className="admin-edit-grid">
                <div className="admin-edit-field">
                  <label className="admin-edit-label">Price (MMK)</label>
                  <input
                    type="number"
                    className="admin-edit-input"
                    value={propDraft.price}
                    onChange={(e) => setPropField('price', Number(e.target.value))}
                  />
                </div>
                <div className="admin-edit-field">
                  <label className="admin-edit-label">Location</label>
                  <input
                    type="text"
                    className="admin-edit-input"
                    value={propDraft.location}
                    onChange={(e) => setPropField('location', e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-edit-grid">
                <div className="admin-edit-field">
                  <label className="admin-edit-label">Property Type</label>
                  <select
                    className="admin-edit-select"
                    value={propDraft.propertyType}
                    onChange={(e) => setPropField('propertyType', e.target.value as Property['propertyType'])}
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="CONDO">Condo</option>
                    <option value="LAND">Land</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                  </select>
                </div>
                <div className="admin-edit-field">
                  <label className="admin-edit-label">Listing Status</label>
                  <select
                    className="admin-edit-select"
                    value={propDraft.status}
                    onChange={(e) => setPropField('status', e.target.value as Property['status'])}
                  >
                    <option value="FOR_SALE">For Sale</option>
                    <option value="FOR_RENT">For Rent</option>
                  </select>
                </div>
              </div>
              <div className="admin-edit-field">
                <label className="admin-edit-label">Approval Status</label>
                <select
                  className="admin-edit-select"
                  value={propDraft.approvalStatus}
                  onChange={(e) => setPropField('approvalStatus', e.target.value as Property['approvalStatus'])}
                >
                  {editingProperty.approvalStatus === 'PENDING' && <option value="PENDING">Pending</option>}
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="admin-edit-grid">
                <div className="admin-edit-field">
                  <label className="admin-edit-label">Bedrooms</label>
                  <input
                    type="number"
                    className="admin-edit-input"
                    value={propDraft.bedrooms}
                    onChange={(e) => setPropField('bedrooms', Number(e.target.value))}
                  />
                </div>
                <div className="admin-edit-field">
                  <label className="admin-edit-label">Bathrooms</label>
                  <input
                    type="number"
                    className="admin-edit-input"
                    value={propDraft.bathrooms}
                    onChange={(e) => setPropField('bathrooms', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="admin-edit-field">
                <label className="admin-edit-label">Area (sqft)</label>
                <input
                  type="number"
                  className="admin-edit-input"
                  value={propDraft.area}
                  onChange={(e) => setPropField('area', Number(e.target.value))}
                />
              </div>
              <div className="admin-edit-field">
                <label className="admin-edit-label">Description</label>
                <textarea
                  className="admin-edit-input"
                  rows={3}
                  value={propDraft.description}
                  onChange={(e) => setPropField('description', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-edit-actions">
              <button className="dash-modal-btn cancel" onClick={() => setEditingProperty(null)}>Cancel</button>
              <button className="dash-modal-btn save" onClick={saveProperty}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
