import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  MapPin,
  Home,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Mail,
  Phone,
  User,
  Plus,
  X,
  Building2,
  Camera,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { properties, myProperties, deleteProperty } = useProperties();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'favorites'>('properties');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirm, setEditConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const favoriteProperties = properties.filter((property) => favoriteIds.includes(String(property.id)));

  const stats = {
    total: myProperties.length,
    active: myProperties.filter(p => p.approvalStatus === 'APPROVED').length,
    pending: myProperties.filter(p => p.approvalStatus === 'PENDING').length,
    rejected: myProperties.filter(p => p.approvalStatus === 'REJECTED').length,
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(id);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (PNG or JPG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const openEditModal = () => {
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditPassword('');
    setEditConfirm('');
    setPasswordError('');
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    if (editPassword || editConfirm) {
      if (editPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters.');
        return;
      }
      if (editPassword !== editConfirm) {
        setPasswordError('Passwords do not match.');
        return;
      }
    }
    updateProfile({
      email: editEmail,
      phone: editPhone,
      ...(editPassword ? { password: editPassword } : {}),
    });
    setShowEditModal(false);
    setEditPassword('');
    setEditConfirm('');
    setPasswordError('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="dash-badge approved"><CheckCircle />Approved</span>;
      case 'PENDING':
        return <span className="dash-badge pending"><Clock />Pending</span>;
      case 'REJECTED':
        return <span className="dash-badge rejected"><XCircle />Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-container">
        <button className="dash-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft /> Back to Home
        </button>

        {/* Profile Hero */}
        <div className="dash-hero">
          <div className="dash-cover" />
          <div className="dash-profile-row">
            <div className="dash-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
              <div className="dash-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  (user?.username || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div className="dash-avatar-camera">
                <Camera />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleAvatarUpload}
                hidden
              />
            </div>
            <div className="dash-profile-info">
              <div className="dash-profile-name-row">
                <span className="dash-username">{user?.username}</span>
                <span className={`dash-role-badge ${user?.role === 'ADMIN' ? 'admin' : ''}`}>
                  {user?.role || 'USER'}
                </span>
              </div>
              <div className="dash-details-row">
                <span className="dash-detail-item"><Mail />{user?.email}</span>
                <span className="dash-detail-item"><Phone />{user?.phone || 'No phone added'}</span>
              </div>
            </div>
            <button className="dash-edit-profile-btn" onClick={openEditModal}>
              <User /> Edit Profile
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon blue"><Home /></div>
            <div>
              <div className="dash-stat-value">{stats.total}</div>
              <div className="dash-stat-label">Total Posted</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon green"><CheckCircle /></div>
            <div>
              <div className="dash-stat-value">{stats.active}</div>
              <div className="dash-stat-label">Active Listings</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon amber"><Clock /></div>
            <div>
              <div className="dash-stat-value">{stats.pending}</div>
              <div className="dash-stat-label">Pending</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon red"><XCircle /></div>
            <div>
              <div className="dash-stat-value">{stats.rejected}</div>
              <div className="dash-stat-label">Rejected</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            <Home /> My Properties ({myProperties.length})
          </button>
          <button
            className={`dash-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart /> Saved Favorites ({favoriteProperties.length})
          </button>
        </div>

        {activeTab === 'properties' ? (
          <>
            <div className="dash-toolbar">
              <div>
                <div className="dash-toolbar-title">Listed Properties</div>
                <div className="dash-toolbar-sub">Manage and track your posted listings</div>
              </div>
              <Link to="/property/add" className="dash-add-btn">
                <Plus /> Add New Property
              </Link>
            </div>

            {myProperties.length === 0 ? (
              <div className="dash-table">
                <div className="dash-empty">
                  <div className="dash-empty-icon"><Building2 /></div>
                  <div className="dash-empty-title">No properties yet</div>
                  <div className="dash-empty-desc">Post your first listing and it will show up here.</div>
                  <Link to="/property/add" className="dash-empty-btn">
                    <Plus /> Add Your First Property
                  </Link>
                </div>
              </div>
            ) : (
              <div className="dash-table">
                <div className="dash-table-header">
                  <span>Property</span>
                  <span>Price</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {myProperties.map((property) => (
                  <div className="dash-table-row" key={property.id}>
                    <div className="dash-property-cell">
                      {property.imageUrl ? (
                        <img src={property.imageUrl} alt={property.title} className="dash-property-thumb" />
                      ) : (
                        <div className="dash-property-thumb-fallback"><Building2 /></div>
                      )}
                      <div className="dash-property-info">
                        <div className="dash-property-name">{property.title}</div>
                        <div className="dash-property-loc">
                          <MapPin /> {property.location}
                        </div>
                      </div>
                    </div>
                    <div className="dash-price">MMK {property.price.toLocaleString()}</div>
                    <div>
                      <span className="dash-type-chip">{property.propertyType.toLowerCase()}</span>
                    </div>
                    <div>{getStatusBadge(property.approvalStatus)}</div>
                    <div className="dash-row-actions">
                      <Link to={`/property/${property.id}`} className="dash-icon-btn" aria-label="View">
                        <Eye />
                      </Link>
                      <Link to={`/property/edit/${property.id}`} className="dash-icon-btn" aria-label="Edit">
                        <Edit />
                      </Link>
                      <button onClick={() => handleDelete(property.id)} className="dash-icon-btn danger" aria-label="Delete">
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="dash-table">
            {favoriteProperties.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon"><Heart /></div>
                <div className="dash-empty-title">No saved favorites yet</div>
                <div className="dash-empty-desc">You can browse and like properties to keep track of them here.</div>
                <Link to="/" className="dash-empty-btn">
                  Browse Properties
                </Link>
              </div>
            ) : (
              <>
                <div className="dash-table-header">
                  <span>Property</span>
                  <span>Price</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {favoriteProperties.map((property) => (
                  <div className="dash-table-row" key={property.id}>
                    <div className="dash-property-cell">
                      {property.imageUrl ? (
                        <img src={property.imageUrl} alt={property.title} className="dash-property-thumb" />
                      ) : (
                        <div className="dash-property-thumb-fallback"><Building2 /></div>
                      )}
                      <div className="dash-property-info">
                        <div className="dash-property-name">{property.title}</div>
                        <div className="dash-property-loc">
                          <MapPin /> {property.location}
                        </div>
                      </div>
                    </div>
                    <div className="dash-price">MMK {property.price.toLocaleString()}</div>
                    <div>
                      <span className="dash-type-chip">
                        {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div>
                      <span className={`dash-badge ${property.status === 'FOR_SALE' ? 'approved' : 'pending'}`}>
                        {property.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>
                    <div className="dash-row-actions">
                      <Link to={`/property/${property.id}`} className="dash-icon-btn" aria-label="View">
                        <Eye />
                      </Link>
                      <button
                        onClick={() => toggleFavorite(String(property.id))}
                        className="dash-icon-btn danger"
                        aria-label="Remove from favorites"
                        title="Remove from favorites"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="dash-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">Edit Profile</span>
              <button className="dash-modal-close" onClick={() => setShowEditModal(false)} aria-label="Close">
                <X />
              </button>
            </div>
            <div className="form-field">
              <label className="form-label">Profile Photo</label>
              <div className="dash-modal-avatar-row">
                <div className="dash-avatar small">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    (user?.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="dash-modal-avatar-actions">
                  <button
                    type="button"
                    className="dash-modal-btn save outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera /> Change Photo
                  </button>
                  {user?.avatar && (
                    <button
                      type="button"
                      className="dash-modal-btn cancel"
                      onClick={() => updateProfile({ avatar: '' })}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Username</label>
              <input type="text" className="form-input" value={user?.username || ''} disabled />
              <p className="form-hint">Usernames cannot be changed for security reasons.</p>
            </div>
            <div className="form-field">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="09-XXXXXXXXX"
              />
            </div>
            <div className="form-field">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={editPassword}
                onChange={(e) => { setEditPassword(e.target.value); setPasswordError(''); }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className={`form-input ${passwordError ? 'error' : ''}`}
                value={editConfirm}
                onChange={(e) => { setEditConfirm(e.target.value); setPasswordError(''); }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {passwordError ? (
                <p className="form-error">{passwordError}</p>
              ) : (
                <p className="form-hint">Leave blank to keep your current password.</p>
              )}
            </div>
            <div className="dash-modal-actions">
              <button className="dash-modal-btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="dash-modal-btn save" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
