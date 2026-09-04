import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
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
  Ruler,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import { formatPropertyPrice } from '../utils/price';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { properties, myProperties, deleteProperty, loading, error, refreshMyProperties } = useProperties();
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

  const getListingLabel = (status: string) => status === 'FOR_SALE' ? 'For Sale' : 'For Rent';

  const renderPropertyCard = (property: (typeof properties)[number], isFavorite = false) => (
    <article className="dash-property-card" key={property.id}>
      <div className="dash-property-media">
        {property.imageUrl ? (
          <img src={resolvePropertyImageUrl(property.imageUrl)} alt={property.title} />
        ) : (
          <div className="dash-property-media-fallback"><Building2 /></div>
        )}
        <div className="dash-property-status">
          {isFavorite ? (
            <span className={`dash-badge ${property.status === 'FOR_SALE' ? 'approved' : 'pending'}`}>
              {getListingLabel(property.status)}
            </span>
          ) : getStatusBadge(property.approvalStatus)}
        </div>
        <span className="dash-property-id">Listing #{property.id}</span>
      </div>

      <div className="dash-property-body">
        <div>
          <div className="dash-property-heading">
            <div className="dash-property-copy">
              <p className="dash-property-loc"><MapPin />{property.location}</p>
              <h3>{property.title}</h3>
            </div>
            <div className="dash-property-price">
              <strong>{formatPropertyPrice(property.price)}</strong>
              <span>{getListingLabel(property.status)} / {property.propertyType.toLowerCase()}</span>
            </div>
          </div>

          <div className="dash-property-facts">
            <span><BedDouble /><strong>{property.bedrooms}</strong> Beds</span>
            <span><Bath /><strong>{property.bathrooms}</strong> Baths</span>
            <span><Ruler /><strong>{property.area.toLocaleString()}</strong> sqft</span>
            <span><Building2 />{property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}</span>
          </div>
        </div>

        <div className="dash-property-footer">
          <span className="dash-property-meta">
            {isFavorite ? 'Saved to your favorites' : `${property.approvalStatus.charAt(0)}${property.approvalStatus.slice(1).toLowerCase()} listing`}
          </span>
          <div className="dash-row-actions">
            {!isFavorite && (
              <>
                <Link to={`/property/edit/${property.id}`} className="dash-property-action secondary">
                  <Edit /> Edit Listing
                </Link>
                <button onClick={() => handleDelete(property.id)} className="dash-property-action danger">
                  <Trash2 /> Delete
                </button>
              </>
            )}
            {isFavorite && (
              <button
                onClick={() => toggleFavorite(String(property.id))}
                className="dash-property-action danger"
              >
                <Trash2 /> Remove
              </button>
            )}
            <Link to={`/property/${property.id}`} className="dash-property-action primary">
              <Eye /> View Property
            </Link>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className="dash-page dashboard-showcase-page">
      <div className="dash-ambient dash-ambient-one" />
      <div className="dash-ambient dash-ambient-two" />
      <div className="dash-ambient dash-ambient-three" />
      <div className="dash-container">
        <div className="dash-breadcrumb">
          <button onClick={() => navigate('/')}><ArrowLeft /> Home</button>
          <ArrowRight />
          <span>User Workspace</span>
          <ArrowRight />
          <strong>My Properties</strong>
        </div>

        <header className="dash-page-header">
          <div>
            <span className="dash-kicker"><i />Owner workspace</span>
            <h1>My Properties & Dashboard</h1>
            <p>Manage your property listings, track moderation status, and keep your account details current.</p>
          </div>
          <Link to="/property/add" className="dash-add-btn"><Plus /> Add New Property</Link>
        </header>

        <div className="dash-hero">
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
              <div className="dash-profile-controls">
                <button className="dash-edit-profile-btn" onClick={openEditModal}>
                  <User /> Edit Profile & Security
                </button>
              </div>
            </div>
            <div className="dash-profile-summary">
              <span>Property portfolio</span>
              <strong>{stats.total} {stats.total === 1 ? 'listing' : 'listings'}</strong>
              <p>{stats.active} live / {stats.pending} in review / {stats.rejected} rejected</p>
            </div>
          </div>
        </div>

        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon blue"><Home /></div>
            <div>
              <div className="dash-stat-value">{stats.total}</div>
              <div className="dash-stat-label">Total Properties</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon green"><CheckCircle /></div>
            <div>
              <div className="dash-stat-value">{stats.active}</div>
              <div className="dash-stat-label">Approved & Live</div>
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

        <div className="dash-workspace-toolbar">
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
          <div className="dash-toolbar-copy">
            <strong>{activeTab === 'properties' ? 'Your property portfolio' : 'Saved properties'}</strong>
            <span>{activeTab === 'properties' ? 'Review and manage every listing in one place.' : 'Return to properties you want to revisit.'}</span>
          </div>
        </div>

        {activeTab === 'properties' ? (
          <>
            {loading && myProperties.length === 0 ? (
              <div className="dash-state-card">
                <div className="dash-loader" />
                <strong>Loading your properties</strong>
                <span>Your workspace will be ready in a moment.</span>
              </div>
            ) : error && myProperties.length === 0 ? (
              <div className="dash-state-card error">
                <XCircle />
                <strong>We couldn't load your properties</strong>
                <span>{error}</span>
                <button onClick={() => void refreshMyProperties()}>Try Again</button>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="dash-table dash-empty-shell">
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
              <div className="dash-property-list">{myProperties.map((property) => renderPropertyCard(property))}</div>
            )}
          </>
        ) : (
          <div className={favoriteProperties.length === 0 ? 'dash-table dash-empty-shell' : 'dash-property-list'}>
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
              favoriteProperties.map((property) => renderPropertyCard(property, true))
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
