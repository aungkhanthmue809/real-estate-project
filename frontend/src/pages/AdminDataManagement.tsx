import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Search, Trash2, Eye, ArrowLeft, BarChart3, ShieldCheck, Shield, ImageOff } from 'lucide-react';
import { adminAPI, userAPI } from '../utils/api';
import type { Property, User } from '../types';

export function AdminDataManagement() {
  const [activeTab, setActiveTab] = useState<'users' | 'properties'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([userAPI.getAll(), adminAPI.getAllProperties()])
      .then(([u, p]) => {
        setUsers(u.data);
        setProperties(p.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(
    (u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async (id: number) => {
    try {
      await userAPI.delete(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch {
      // ignore
    }
    setConfirmDelete(null);
  };

  const handleDeleteProperty = async (id: number) => {
    try {
      await adminAPI.deleteProperty(id);
      setProperties(properties.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
    setConfirmDelete(null);
  };

  const handleToggleRole = async (u: User) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await userAPI.updateRole(u.id, newRole);
      setUsers(users.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
    } catch {
      // ignore
    }
  };

  const getRoleBadge = (role: string) =>
    role === 'ADMIN' ? (
      <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full">ADMIN</span>
    ) : (
      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">USER</span>
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">Approved</span>;
      case 'PENDING': return <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">Pending</span>;
      case 'REJECTED': return <span className="text-xs font-semibold bg-red-50 text-red-700 px-2.5 py-1 rounded-full">Rejected</span>;
      default: return null;
    }
  };

  const inputCls =
    'w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition';

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              {activeTab === 'users' ? 'Manage Users' : 'Manage Properties'}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'users' ? `${users.length} total users` : `${properties.length} total properties`}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputCls} w-full sm:w-72`}
            />
          </div>
        </div>

        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Users className="w-4 h-4" /> Users
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'properties' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Home className="w-4 h-4" /> Properties
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Phone</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium text-slate-800">{u.username}</p>
                            <p className="text-sm text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title={u.role === 'ADMIN' ? 'Revoke admin' : 'Make admin'}
                          >
                            {u.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                          </button>
                          {confirmDelete === `user-${u.id}` ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleDeleteUser(u.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Confirm</button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(`user-${u.id}`)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No users found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Property</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Price</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {property.imageUrl ? (
                            <img src={property.imageUrl} alt="" className="w-16 h-12 rounded-lg object-cover" onError={(e) => { (e.currentTarget).style.visibility = 'hidden'; }} />
                          ) : (
                            <span className="w-16 h-12 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center">
                              <ImageOff className="w-5 h-5" />
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-slate-800">{property.title}</p>
                            <p className="text-sm text-slate-500">{property.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(property.approvalStatus)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">K {property.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/property/${property.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="View">
                            <Eye className="w-5 h-5" />
                          </Link>
                          {confirmDelete === `prop-${property.id}` ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleDeleteProperty(property.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Confirm</button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(`prop-${property.id}`)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete Property"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProperties.length === 0 && (
              <div className="p-12 text-center">
                <BarChart3 className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No properties found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
