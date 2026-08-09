import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Heart, MapPin, Bed, Bath, Square, Plus, Home, Clock, CheckCircle, XCircle, KeyRound, UserRound, Mail, Phone, CalendarDays, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { propertyAPI, userAPI } from '../utils/api';
import type { Property } from '../types';
import { PropertyImage } from '../components/PropertyImage';

export function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'properties' | 'favorites' | 'profile'>('properties');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({ email: user?.email ?? '', phone: user?.phone ?? '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const loadData = () => {
    setLoading(true);
    Promise.all([propertyAPI.getMine(), propertyAPI.getFavorites()])
      .then(([mine, favs]) => {
        setMyProperties(mine.data);
        setFavorites(favs.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    { icon: Home, label: 'Total Posted', value: myProperties.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: CheckCircle, label: 'Active Listings', value: myProperties.filter((p) => p.approvalStatus === 'APPROVED').length, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Clock, label: 'Pending', value: myProperties.filter((p) => p.approvalStatus === 'PENDING').length, color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: XCircle, label: 'Rejected', value: myProperties.filter((p) => p.approvalStatus === 'REJECTED').length, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await propertyAPI.delete(id);
      setMyProperties(myProperties.filter((p) => p.id !== id));
    } catch {
      setError('Failed to delete property');
    }
  };

  const handleRemoveFavorite = async (id: number) => {
    try {
      await propertyAPI.removeFavorite(id);
      setFavorites(favorites.filter((f) => f.id !== id));
    } catch {
      // ignore
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateProfile({ email: profileForm.email, phone: profileForm.phone });
      setMessage('Profile updated');
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setError('New passwords do not match');
      return;
    }
    try {
      await userAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setMessage('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Change failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-success"><CheckCircle className="w-3 h-3 mr-1" />Approved</span>;
      case 'PENDING': return <span className="badge badge-warning"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'REJECTED': return <span className="badge badge-error"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
      default: return null;
    }
  };

  const tabs = [
    { id: 'properties' as const, label: `My Properties (${myProperties.length})` },
    { id: 'favorites' as const, label: `Saved Favorites (${favorites.length})` },
    { id: 'profile' as const, label: 'Profile & Security' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-[72px] pb-16">
      <div className="relative h-44 sm:h-56 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
        <div className="section-container relative h-full flex items-end pb-8">
          <div className="flex items-end gap-4 sm:gap-6">
            <span className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-white/70 shadow-lg bg-white flex items-center justify-center text-3xl sm:text-5xl font-bold text-blue-600 select-none">
              {(user?.username || '?').charAt(0).toUpperCase()}
            </span>
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-3xl font-bold text-white capitalize">{user?.username}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${user?.role === 'ADMIN' ? 'bg-violet-500 text-white' : 'bg-white/20 text-white'}`}>
                  {user?.role}
                </span>
              </div>
              <p className="text-blue-100 text-sm flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user?.email}</p>
              <p className="text-blue-200/80 text-xs flex items-center gap-1.5 mt-0.5"><CalendarDays className="w-3.5 h-3.5" /> Member of UrbanNest</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 -mt-7 relative z-10 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${stat.bg} shrink-0`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{stat.value}</p>
                <p className="text-xs sm:text-sm text-slate-500 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="auth-error mb-4">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl">{message}</div>}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 pt-4">
            <div className="inline-flex bg-slate-100 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab === 'properties' && (
              <Link to="/property/add" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Add Property
              </Link>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {loading && (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && activeTab === 'properties' && (
              <div className="space-y-4">
                {myProperties.length === 0 ? (
                  <div className="text-center py-16">
                    <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No properties yet</p>
                    <Link to="/property/add" className="btn-primary">Add Your First Property</Link>
                  </div>
                ) : (
                  myProperties.map((property) => (
                    <div key={property.id} className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 bg-white rounded-xl border border-slate-200/70 hover:border-blue-200 hover:shadow-md transition-all">
                      <PropertyImage src={property.imageUrl} alt={property.title} className="w-full sm:w-36 h-40 sm:h-28 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wide">{property.propertyType}</span>
                              {getStatusBadge(property.approvalStatus)}
                            </div>
                            <h3 className="font-bold text-slate-800 truncate">{property.title}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {property.location}
                            </p>
                          </div>
                          <p className="font-bold text-blue-600 text-sm sm:text-base shrink-0">K {property.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.bedrooms ?? 0} beds</span>
                          <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms ?? 0} baths</span>
                          <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {(property.area ?? 0).toLocaleString()} sqft</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                          <Link to={`/property/${property.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            View <ChevronRight className="w-4 h-4" />
                          </Link>
                          <span className="flex-1"></span>
                          <Link to={`/property/edit/${property.id}`} className="p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-600" aria-label="Edit">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(property.id)} className="p-2 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors text-red-500" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!loading && activeTab === 'favorites' && (
              favorites.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No saved favorites yet</p>
                  <Link to="/" className="btn-primary">Browse Properties</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((property) => (
                    <div key={property.id} className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 bg-white rounded-xl border border-slate-200/70 hover:border-blue-200 hover:shadow-md transition-all">
                      <PropertyImage src={property.imageUrl} alt={property.title} className="w-full sm:w-36 h-40 sm:h-28 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wide">{property.propertyType}</span>
                              <span className="badge badge-success">{property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale'}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 truncate">{property.title}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {property.location}
                            </p>
                          </div>
                          <p className="font-bold text-blue-600 text-sm sm:text-base shrink-0">K {property.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                          <Link to={`/property/${property.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            View <ChevronRight className="w-4 h-4" />
                          </Link>
                          <span className="flex-1"></span>
                          <button onClick={() => handleRemoveFavorite(property.id)} className="p-2 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors text-red-500" aria-label="Remove from favorites">
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {!loading && activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200/70 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <UserRound className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Profile</h3>
                      <p className="text-xs text-slate-400">Update your contact details</p>
                    </div>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                    <div>
                      <label className="label">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="input-field w-full pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="input-field w-full pl-10"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center">Save Profile</button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200/70 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <KeyRound className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Change Password</h3>
                      <p className="text-xs text-slate-400">Keep your account secure</p>
                    </div>
                  </div>
                  <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                    <div>
                      <label className="label">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="input-field w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="input-field w-full"
                        minLength={8}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="input-field w-full"
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center">Change Password</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
