import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Clock, CheckCircle, XCircle, Eye, Settings, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, userAPI } from '../utils/api';
import type { Property, User } from '../types';
import { PropertyImage } from '../components/PropertyImage';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export function AdminDashboard() {
  const { user } = useAuth();
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [approvedProperties, setApprovedProperties] = useState<Property[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getAllProperties('PENDING'),
      adminAPI.getAllProperties(),
      userAPI.getAll(),
    ])
      .then(([pending, all, users]) => {
        setPendingProperties(pending.data);
        setApprovedProperties(all.data.filter((p) => p.approvalStatus === 'APPROVED').slice(0, 5));
        setTotalProperties(all.data.length);
        setAllUsers(users.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    { icon: Users, label: 'Total Users', value: allUsers.length.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Home, label: 'Total Properties', value: totalProperties.toString(), color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Clock, label: 'Pending Approvals', value: pendingProperties.length.toString(), color: 'text-amber-600', bg: 'bg-amber-50', urgent: true },
  ];

  const handleApprove = async (id: number) => {
    try {
      await adminAPI.approve(id);
      const property = pendingProperties.find((p) => p.id === id);
      setPendingProperties(pendingProperties.filter((p) => p.id !== id));
      if (property) setApprovedProperties([{ ...property, approvalStatus: 'APPROVED' }, ...approvedProperties]);
    } catch {
      // ignore
    }
  };

  const handleReject = async (id: number) => {
    try {
      await adminAPI.reject(id);
      setPendingProperties(pendingProperties.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.username}</p>
          </div>
          <Link to="/admin/data" className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Settings className="w-4 h-4" /> Manage Data
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className={`bg-white rounded-2xl border p-6 shadow-sm ${stat.urgent ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800 leading-none">{stat.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Pending Approvals</h2>
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">{pendingProperties.length} pending</span>
              </div>
              {loading ? (
                <div className="p-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : pendingProperties.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                  <p className="text-slate-500">All caught up! No pending approvals.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingProperties.map((property) => (
                    <div key={property.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <PropertyImage src={property.imageUrl} alt={property.title} className="w-full sm:w-28 h-28 object-cover rounded-xl" />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-800">{property.title}</h3>
                              <p className="text-sm text-slate-500">Submitted: {formatDate(property.createdAt)}</p>
                            </div>
                            <p className="font-bold text-blue-600">K {property.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="flex items-center gap-1 text-sm text-slate-600"><Briefcase className="w-4 h-4" /> {property.owner}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleApprove(property.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(property.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                            <Link to={`/property/${property.id}`} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600" title="View">
                              <Eye className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-bold text-slate-800">Recently Approved</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {approvedProperties.length === 0 ? (
                  <p className="p-6 text-sm text-slate-400 text-center">No approved properties yet</p>
                ) : (
                  approvedProperties.map((property) => (
                    <div key={property.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <PropertyImage src={property.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{property.title}</p>
                          <p className="text-sm text-slate-500">{property.location}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
