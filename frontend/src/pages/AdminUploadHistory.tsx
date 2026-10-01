import { AdminNavigation } from '../components/AdminNavigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Filter, LogOut, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationsBell } from '../components/NotificationsBell';
import { UrbanNestLogo } from '../components/UrbanNestLogo';
import { adminAPI } from '../utils/api';
import { formatMMKAmount } from '../utils/price';
import { YANGON_TOWNSHIPS } from '../data/myanmarProperties';
import type { ApprovalStatus, PropertyType, PropertyUploadHistoryItem, PropertyUploadHistorySort } from '../types';

const types: PropertyType[] = ['APARTMENT', 'HOUSE', 'CONDO', 'LAND'];
const townships = YANGON_TOWNSHIPS.map((township) => township.nameEn);
const typeLabel = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();
const formatDateTime = (value: string) => new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const statusLabel = (value: ApprovalStatus) => value.charAt(0) + value.slice(1).toLowerCase();

export function AdminUploadHistory() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<PropertyUploadHistoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [summary, setSummary] = useState({ total: 0, recorded: 0, legacy: 0 });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [quickDate, setQuickDate] = useState('ALL');
  const [propertyType, setPropertyType] = useState('');
  const [listingStatus, setListingStatus] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('');
  const [township, setTownship] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<PropertyUploadHistorySort>('NEWEST');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<PropertyUploadHistoryItem | null>(null);

  const dateRange = useMemo(() => {
    if (quickDate === 'ALL') return { from, to };
    const end = new Date();
    const endDate = end.toISOString().slice(0, 10);
    if (quickDate === 'TODAY') return { from: endDate, to: endDate };
    if (quickDate === 'MONTH') return { from: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-01`, to: endDate };
    const days = quickDate === '7D' ? 6 : 29;
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    return { from: start.toISOString().slice(0, 10), to: endDate };
  }, [from, quickDate, to]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getPropertyUploadHistory({ page, size: 20, from: dateRange.from || undefined, to: dateRange.to || undefined, propertyType: propertyType || undefined, listingStatus: listingStatus || undefined, approvalStatus: approvalStatus || undefined, township: township || undefined, search: search.trim() || undefined, sort });
      setRecords(data.content); setTotalPages(data.totalPages); setTotalElements(data.totalElements); setSummary({ total: data.filteredPostingFeeTotal, recorded: data.filteredFeeRecordedCount, legacy: data.filteredLegacyFeeCount }); setError('');
    } catch { setError('Unable to load property upload history. Please try again.'); }
    finally { setLoading(false); }
  }, [approvalStatus, dateRange.from, dateRange.to, listingStatus, page, propertyType, search, sort, township]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);
  const clearFilters = () => { setFrom(''); setTo(''); setQuickDate('ALL'); setPropertyType(''); setListingStatus(''); setApprovalStatus(''); setTownship(''); setSearch(''); setSort('NEWEST'); setPage(0); };
  const chooseQuickDate = (value: string) => { setQuickDate(value); if (value !== 'ALL') { setFrom(''); setTo(''); } setPage(0); };
  const initial = (name: string) => (name || 'A').charAt(0).toUpperCase();
  const handleLogout = () => { logout(); navigate('/'); };

  return <div className="admin-page admin-showcase-page admin-cockpit admin-history-page">
    <div className="admin-ambient admin-ambient-one" /><div className="admin-ambient admin-ambient-two" /><div className="admin-ambient admin-ambient-three" />
    <header className="admin-cockpit-topbar"><div className="admin-cockpit-topbar-inner">
      <Link to="/admin/dashboard" className="admin-cockpit-brand"><UrbanNestLogo className="admin-cockpit-logo" /><span><strong>UrbanNest</strong><small>Admin Workspace</small></span></Link>
      <AdminNavigation />
      <div className="admin-cockpit-account"><span className="admin-console-state"><i />Console active</span><NotificationsBell /><div className="admin-cockpit-identity"><span className="admin-cockpit-avatar">{user?.avatar ? <img src={user.avatar} alt={user.username} /> : initial(user?.username || 'A')}</span><span><strong>{user?.username || 'admin'}</strong><small>Administrator</small></span></div><button type="button" className="admin-cockpit-logout" onClick={handleLogout} aria-label="Sign out"><LogOut /></button></div>
    </div></header>
    <main className="admin-cockpit-main">
      <section className="admin-cockpit-intro"><div><span className="admin-header-kicker"><i />Yangon property registry</span><h1>Property Upload History</h1><p>Monitor property submissions and the posting fee recorded when each listing was created.</p></div></section>
      <section className="admin-history-filters" aria-label="History filters">
        <div className="admin-history-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search property, ID, or owner..." aria-label="Search property, ID, or owner" /></div>
        <div className="admin-history-quick" role="group" aria-label="Quick date filters">{[['ALL', 'All Time'], ['TODAY', 'Today'], ['7D', 'Last 7 Days'], ['30D', 'Last 30 Days'], ['MONTH', 'This Month']].map(([value, label]) => <button type="button" key={value} className={quickDate === value ? 'active' : ''} onClick={() => chooseQuickDate(value)}>{label}</button>)}</div>
        <div className="admin-history-filter-grid"><label>From Date<input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setQuickDate('ALL'); setPage(0); }} /></label><label>To Date<input type="date" value={to} onChange={(event) => { setTo(event.target.value); setQuickDate('ALL'); setPage(0); }} /></label><label>Property Type<select value={propertyType} onChange={(event) => { setPropertyType(event.target.value); setPage(0); }}><option value="">All Types</option>{types.map((item) => <option key={item} value={item}>{typeLabel(item)}</option>)}</select></label><label>Listing Type<select value={listingStatus} onChange={(event) => { setListingStatus(event.target.value); setPage(0); }}><option value="">All</option><option value="FOR_SALE">Buy</option><option value="FOR_RENT">Rent</option></select></label><label>Status<select value={approvalStatus} onChange={(event) => { setApprovalStatus(event.target.value); setPage(0); }}><option value="">All Statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></label><label>Township<select value={township} onChange={(event) => { setTownship(event.target.value); setPage(0); }}><option value="">All Townships</option>{townships.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Sort<select value={sort} onChange={(event) => { setSort(event.target.value as PropertyUploadHistorySort); setPage(0); }}><option value="NEWEST">Newest First</option><option value="OLDEST">Oldest First</option><option value="POSTING_FEE_DESC">Highest Posting Fee</option><option value="POSTING_FEE_ASC">Lowest Posting Fee</option><option value="PROPERTY_PRICE_DESC">Highest Property Price</option><option value="PROPERTY_PRICE_ASC">Lowest Property Price</option></select></label><button type="button" className="admin-history-clear" onClick={clearFilters}><Filter />Clear Filters</button></div>
      </section>
      <section className="admin-history-summary" aria-label="Filtered history summary"><article><span>Matching Uploads</span><strong>{totalElements.toLocaleString()}</strong></article><article><span>Posting Fees Generated</span><strong>{formatMMKAmount(summary.total)}</strong></article><article><span>Recorded Fee History</span><strong>{summary.recorded.toLocaleString()}</strong></article><article><span>Historical Fee Unavailable</span><strong>{summary.legacy.toLocaleString()}</strong></article></section>
      <section className="admin-history-table-card"><div className="admin-history-table-heading"><div><span>Property submission ledger</span><strong>Historical posting-fee records</strong></div><small>{totalElements.toLocaleString()} matching records</small></div>{loading ? <div className="admin-history-state">Loading property upload history...</div> : error ? <div className="admin-history-state error">{error}</div> : records.length === 0 ? <div className="admin-history-state">No property uploads match the selected filters.</div> : <div className="admin-history-table-wrap"><table><thead><tr><th>Submitted</th><th>Property</th><th>Owner</th><th>Type</th><th>Listing</th><th>Township</th><th>Status</th><th>Property Price</th><th>Posting Fee</th><th>Action</th></tr></thead><tbody>{records.map((record) => <tr key={record.propertyId}><td>{formatDateTime(record.submittedAt)}</td><td><strong>{record.title}</strong><small>#{record.propertyId}</small></td><td>{record.ownerUsername}</td><td>{typeLabel(record.propertyType)}</td><td>{record.listingType === 'FOR_SALE' ? 'Buy' : 'Rent'}</td><td>{record.township || '—'}</td><td><span className={`admin-history-status ${record.status.toLowerCase()}`}>{statusLabel(record.status)}</span></td><td>{formatMMKAmount(record.propertyPrice)}</td><td>{record.postingFeeAtSubmission == null ? <span className="admin-history-unavailable">Historical fee unavailable</span> : formatMMKAmount(record.postingFeeAtSubmission)}</td><td><button type="button" className="admin-history-view" onClick={() => setSelected(record)}><Eye />View Details</button></td></tr>)}</tbody></table></div>}<footer className="admin-history-pagination"><span>Page {totalPages === 0 ? 0 : page + 1} of {totalPages}</span><div><button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>Previous</button><button type="button" onClick={() => setPage((current) => Math.min(Math.max(totalPages - 1, 0), current + 1))} disabled={totalPages === 0 || page >= totalPages - 1}>Next</button></div></footer></section>
    </main>
    {selected && <div className="dash-modal-overlay" onClick={() => setSelected(null)}><div className="dash-modal admin-history-detail-modal" role="dialog" aria-modal="true" aria-labelledby="history-detail-title" onClick={(event) => event.stopPropagation()}><div className="dash-modal-header"><span className="dash-modal-title" id="history-detail-title">Property Details</span><button type="button" className="dash-modal-close" onClick={() => setSelected(null)} aria-label="Close"><X /></button></div><div className="admin-history-detail"><div className="admin-history-detail-title"><div><span>Listing #{selected.propertyId}</span><h2>{selected.title}</h2></div><span className={`admin-history-status ${selected.status.toLowerCase()}`}>{statusLabel(selected.status)}</span></div><dl><div><dt>Submitted</dt><dd>{formatDateTime(selected.submittedAt)}</dd></div><div><dt>Submitting username</dt><dd>{selected.ownerUsername}</dd></div><div><dt>Property type</dt><dd>{typeLabel(selected.propertyType)}</dd></div><div><dt>Listing type</dt><dd>{selected.listingType === 'FOR_SALE' ? 'Buy' : 'Rent'}</dd></div><div><dt>Property Price</dt><dd>{formatMMKAmount(selected.propertyPrice)}</dd></div><div><dt>Posting Fee at Submission</dt><dd>{selected.postingFeeAtSubmission == null ? 'Historical fee unavailable' : formatMMKAmount(selected.postingFeeAtSubmission)}</dd></div><div><dt>Bedrooms / Bathrooms</dt><dd>{selected.bedrooms} / {selected.bathrooms}</dd></div><div><dt>Area</dt><dd>{selected.area.toLocaleString()} sqft</dd></div><div><dt>Address</dt><dd>{[selected.streetAddress, selected.township, selected.city, selected.stateRegion, selected.zipCode].filter(Boolean).join(', ') || 'Not provided'}</dd></div><div><dt>Ownership</dt><dd>{selected.ownershipType || 'Not provided'}</dd></div><div><dt>Grant / Permit</dt><dd>{selected.hasGrant ? 'Grant' : 'No grant'} · {selected.hasPermit ? 'Permit' : 'No permit'}</dd></div></dl><p className="admin-history-detail-description">{selected.description}</p></div></div></div>}
  </div>;
}
