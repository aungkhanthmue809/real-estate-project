import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bath, Bed, Building2, CheckCircle, Clock, Eye, Home, LogOut, Mail, MapPin, Settings, Square, Users, X, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { NotificationsBell } from '../components/NotificationsBell';
import { adminAPI, propertyPostingFeeAPI } from '../utils/api';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import { formatMMKAmount, formatPropertyPrice } from '../utils/price';
import type { ContactMessage, Property, PropertyPostingFee, PropertyType } from '../types';

type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
const formatDate = (iso: string) => { try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso; } };
const formatDateTime = (iso: string) => { try { return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return iso; } };
const typeLabel = (type: PropertyType) => type.charAt(0) + type.slice(1).toLowerCase();

export function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { refreshProperties } = useProperties();
  const { newlyReceived } = useNotifications();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState<Property | null>(null);
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus>('PENDING');
  const [postingFees, setPostingFees] = useState<PropertyPostingFee[]>([]);
  const [feeDrafts, setFeeDrafts] = useState<Partial<Record<PropertyType, string>>>({});
  const [editingFee, setEditingFee] = useState<PropertyType | null>(null);
  const [savingFee, setSavingFee] = useState<PropertyType | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [feeMessage, setFeeMessage] = useState('');
  const [feeError, setFeeError] = useState('');
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState('');
  const [focusedTargetId, setFocusedTargetId] = useState<string | null>(null);
  const handledFocusRequestRef = useRef<string | null>(null);

  const focusType = searchParams.get('focus');
  const rawFocusId = focusType === 'property' ? searchParams.get('propertyId') : focusType === 'contact' ? searchParams.get('messageId') : null;
  const focusTargetId = rawFocusId && /^[1-9]\d*$/.test(rawFocusId) ? `admin-${focusType}-${rawFocusId}` : null;

  const loadAdminProperties = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try { const { data } = await adminAPI.getAllProperties(); setProperties(data); setError(''); }
    catch { setError('Unable to load properties.'); }
    finally { if (showLoading) setLoading(false); }
  }, []);
  const loadContactMessages = useCallback(async (showLoading = false) => {
    if (showLoading) setMessagesLoading(true);
    try { const { data } = await adminAPI.getContactMessages(); setContactMessages(data); setMessagesError(''); }
    catch { setMessagesError('Unable to load contact messages.'); }
    finally { if (showLoading) setMessagesLoading(false); }
  }, []);

  useEffect(() => { void loadAdminProperties(true); }, [loadAdminProperties]);
  useEffect(() => { void loadContactMessages(true); }, [loadContactMessages]);
  useEffect(() => {
    if (user?.role === 'ADMIN' && newlyReceived.some((item) => item.type === 'PROPERTY_APPROVAL_REQUESTED')) void loadAdminProperties();
    if (user?.role === 'ADMIN' && newlyReceived.some((item) => item.type === 'CONTACT_MESSAGE_RECEIVED')) void loadContactMessages();
  }, [loadAdminProperties, loadContactMessages, newlyReceived, user?.role]);
  useEffect(() => {
    let active = true;
    propertyPostingFeeAPI.getAll().then(({ data }) => {
      if (!active) return;
      setPostingFees(data);
      setFeeDrafts(Object.fromEntries(data.map((fee) => [fee.propertyType, String(fee.feeAmount)])));
    }).catch(() => { if (active) setFeeError('Unable to load property posting fees.'); })
      .finally(() => { if (active) setFeeLoading(false); });
    return () => { active = false; };
  }, []);

  const pending = properties.filter((item) => item.approvalStatus === 'PENDING');
  const approved = properties.filter((item) => item.approvalStatus === 'APPROVED');
  const rejected = properties.filter((item) => item.approvalStatus === 'REJECTED');
  const visibleProperties = properties.filter((item) => item.approvalStatus === moderationStatus).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const recentlyProcessed = [...approved, ...rejected].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const initial = (name: string) => (name || 'U').charAt(0).toUpperCase();
  const counts: Record<ModerationStatus, number> = { PENDING: pending.length, APPROVED: approved.length, REJECTED: rejected.length };
  const stats = [
    { icon: Clock, label: 'Pending Listings', value: pending.length, meta: 'Awaiting moderation', tone: 'amber' },
    { icon: CheckCircle, label: 'Approved Listings', value: approved.length, meta: 'Live property records', tone: 'green' },
    { icon: XCircle, label: 'Rejected Listings', value: rejected.length, meta: 'Declined submissions', tone: 'red' },
    { icon: Home, label: 'Total Properties', value: properties.length, meta: 'All submitted listings', tone: 'neutral' },
  ];

  useEffect(() => {
    if (focusType !== 'property' || !rawFocusId || loading) return;
    const target = properties.find((item) => item.id === Number(rawFocusId));
    if (target) setModerationStatus(target.approvalStatus);
  }, [focusType, loading, properties, rawFocusId]);
  useEffect(() => {
    if (!focusTargetId) { handledFocusRequestRef.current = null; setFocusedTargetId(null); return; }
    if ((focusType === 'property' ? loading : messagesLoading) || handledFocusRequestRef.current === focusTargetId) return;
    const target = document.getElementById(focusTargetId);
    if (!target) return;
    handledFocusRequestRef.current = focusTargetId;
    setFocusedTargetId(focusTargetId);
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
    const timeout = window.setTimeout(() => setFocusedTargetId((current) => current === focusTargetId ? null : current), 2800);
    return () => window.clearTimeout(timeout);
  }, [contactMessages, focusTargetId, focusType, loading, messagesLoading, moderationStatus, properties]);

  const updateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(id); setError('');
    try {
      if (status === 'APPROVED') await adminAPI.approve(id); else await adminAPI.reject(id);
      setProperties((current) => current.map((item) => item.id === id ? { ...item, approvalStatus: status } : item));
      refreshProperties().catch(() => undefined); setReviewing(null);
    } catch { setError(`Unable to ${status === 'APPROVED' ? 'approve' : 'reject'} the property.`); }
    finally { setUpdatingId(null); }
  };
  const startEditingFee = (fee: PropertyPostingFee) => { setEditingFee(fee.propertyType); setFeeDrafts((current) => ({ ...current, [fee.propertyType]: String(fee.feeAmount) })); setFeeMessage(''); setFeeError(''); };
  const cancelEditingFee = (fee: PropertyPostingFee) => { setFeeDrafts((current) => ({ ...current, [fee.propertyType]: String(fee.feeAmount) })); setEditingFee(null); setFeeError(''); };
  const savePostingFee = async (propertyType: PropertyType) => {
    const draft = feeDrafts[propertyType]?.trim() ?? '';
    if (!/^\d+$/.test(draft) || Number(draft) > 999_999_999_999) { setFeeError('Fee must be a non-negative whole MMK amount up to 999,999,999,999.'); return; }
    setSavingFee(propertyType); setFeeMessage(''); setFeeError('');
    try {
      const { data } = await adminAPI.updatePostingFee(propertyType, Number(draft));
      setPostingFees((current) => current.map((fee) => fee.propertyType === propertyType ? data : fee));
      setFeeDrafts((current) => ({ ...current, [propertyType]: String(data.feeAmount) }));
      setEditingFee(null); setFeeMessage(`${typeLabel(propertyType)} fee updated.`);
    } catch { setFeeError('Unable to update the posting fee. Please try again.'); }
    finally { setSavingFee(null); }
  };
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-page admin-showcase-page admin-cockpit">
      <div className="admin-ambient admin-ambient-one" /><div className="admin-ambient admin-ambient-two" /><div className="admin-ambient admin-ambient-three" />
      <header className="admin-cockpit-topbar"><div className="admin-cockpit-topbar-inner">
        <Link to="/admin/dashboard" className="admin-cockpit-brand"><span className="admin-cockpit-logo"><Home /></span><span><strong>UrbanNest</strong><small>Admin Workspace</small></span></Link>
        <nav className="admin-cockpit-nav" aria-label="Admin navigation"><Link to="/admin/dashboard" className="active">Overview</Link><Link to="/admin/manage-all?tab=properties">Properties</Link><Link to="/admin/manage-all?tab=users">Users</Link></nav>
        <div className="admin-cockpit-account"><span className="admin-console-state"><i />Console active</span><NotificationsBell /><div className="admin-cockpit-identity"><span className="admin-cockpit-avatar">{user?.avatar ? <img src={user.avatar} alt={user.username} /> : initial(user?.username || 'A')}</span><span><strong>{user?.username || 'admin'}</strong><small>Administrator</small></span></div><button type="button" className="admin-cockpit-logout" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut /></button></div>
      </div></header>

      <main className="admin-cockpit-main">
        <section className="admin-cockpit-intro"><div><span className="admin-header-kicker"><i />Yangon property registry</span><h1>Moderation &amp; Operations</h1><p>Review property submissions, manage posting fees, and monitor incoming contact messages from one operational workspace.</p></div><div className="admin-cockpit-toolbar"><Link to="/admin/manage-all?tab=properties"><Building2 />Manage Properties</Link><Link to="/admin/manage-all?tab=users"><Users />Manage Users</Link><Link to="/"><Home />Main Site</Link></div></section>
        {(loading || error) && <div className={`admin-cockpit-notice${error ? ' error' : ''}`}>{loading ? 'Loading the property workspace...' : error}</div>}
        <section className="admin-cockpit-metrics" aria-label="Property metrics">{stats.map((stat) => <article key={stat.label} className={`admin-cockpit-metric ${stat.tone}`}><div><span>{stat.label}</span><span className="admin-cockpit-metric-icon"><stat.icon /></span></div><strong>{stat.value}</strong><small>{stat.meta}</small></article>)}</section>

        <section className="admin-cockpit-workspace" id="property-moderation">
          <div className="admin-cockpit-left">
            <div className="admin-cockpit-tabs" role="tablist" aria-label="Moderation status">{([['PENDING', 'Pending Review'], ['APPROVED', 'Approved'], ['REJECTED', 'Rejected']] as const).map(([status, label]) => <button key={status} type="button" role="tab" aria-selected={moderationStatus === status} className={moderationStatus === status ? 'active' : ''} onClick={() => setModerationStatus(status)}>{label}<span>{counts[status]}</span></button>)}<small>Newest submissions first</small></div>
            <div className="admin-cockpit-queue">
              {loading ? <div className="admin-cockpit-empty"><Clock /><strong>Loading moderation queue...</strong></div> : error && properties.length === 0 ? <div className="admin-cockpit-empty error"><XCircle /><strong>{error}</strong></div> : visibleProperties.length === 0 ? <div className="admin-cockpit-empty"><CheckCircle /><strong>No {moderationStatus.toLowerCase()} properties.</strong></div> : visibleProperties.map((property, index) => {
                const targetId = `admin-property-${property.id}`; const focused = focusedTargetId === targetId; const canModerate = property.approvalStatus === 'PENDING';
                return <article id={targetId} key={property.id} tabIndex={-1} className={`admin-cockpit-listing ${index === 0 ? 'primary' : 'secondary'}${focused ? ' admin-focus-highlight' : ''}`}>
                  <div className="admin-cockpit-listing-topline"><span className={`admin-cockpit-status ${property.approvalStatus.toLowerCase()}`}>{focused && <i />}{focused ? 'Notification target' : `${property.approvalStatus.charAt(0)}${property.approvalStatus.slice(1).toLowerCase()}`}</span><span>Submitted {formatDate(property.createdAt)} · Listing #{property.id}</span></div>
                  <div className="admin-cockpit-listing-grid"><div className="admin-cockpit-listing-media">{property.imageUrl ? <img src={resolvePropertyImageUrl(property.imageUrl)} alt={property.title} /> : <div className="admin-cockpit-image-fallback"><Home /></div>}<span>{property.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}</span></div>
                    <div className="admin-cockpit-listing-body"><div className="admin-cockpit-listing-heading"><div><span>{typeLabel(property.propertyType)}</span><h2>{property.title}</h2></div><div className="admin-cockpit-price"><small>Listed price</small><strong>{formatPropertyPrice(property.price)}</strong></div></div><p className="admin-cockpit-location"><MapPin />{property.location}</p><div className="admin-cockpit-facts"><span><small>Bedrooms</small><strong><Bed />{property.bedrooms} Beds</strong></span><span><small>Bathrooms</small><strong><Bath />{property.bathrooms} Baths</strong></span><span><small>Gross Area</small><strong><Square />{property.area.toLocaleString()} sqft</strong></span></div><div className="admin-cockpit-owner"><span>{initial(property.owner)}</span><div><small>Property owner</small><strong>{property.owner}</strong></div><p>{property.ownerPhone || 'No phone provided'}</p></div></div>
                  </div><div className="admin-cockpit-listing-actions"><button type="button" className="review" onClick={() => setReviewing(property)}><Eye />Review Details</button>{canModerate && <div><button type="button" className="reject" onClick={() => updateStatus(property.id, 'REJECTED')} disabled={updatingId === property.id}><XCircle />Reject</button><button type="button" className="approve" onClick={() => updateStatus(property.id, 'APPROVED')} disabled={updatingId === property.id}><CheckCircle />Approve</button></div>}</div>
                </article>;
              })}
            </div>
          </div>

          <aside className="admin-cockpit-rail">
            <section className="admin-cockpit-rail-card"><div className="admin-cockpit-rail-heading"><span><Settings /></span><div><h2>Posting Fee Schedule</h2><p>Current fees by property type.</p></div></div>{feeLoading ? <div className="admin-rail-status">Loading posting fees...</div> : postingFees.length === 0 ? <div className="admin-rail-status error">{feeError || 'No posting fees are configured.'}</div> : <div className="admin-cockpit-fees">{postingFees.map((fee) => <div className="admin-cockpit-fee" key={fee.propertyType}>{editingFee === fee.propertyType ? <div className="admin-cockpit-fee-editor"><label htmlFor={`fee-${fee.propertyType}`}>{typeLabel(fee.propertyType)}</label><div><span>MMK</span><input id={`fee-${fee.propertyType}`} type="number" min="0" max="999999999999" step="1" value={feeDrafts[fee.propertyType] ?? ''} onChange={(event) => setFeeDrafts((current) => ({ ...current, [fee.propertyType]: event.target.value }))} /></div><button type="button" onClick={() => savePostingFee(fee.propertyType)} disabled={savingFee === fee.propertyType}>{savingFee === fee.propertyType ? 'Saving...' : 'Save'}</button><button type="button" className="cancel" onClick={() => cancelEditingFee(fee)}>Cancel</button></div> : <><span>{typeLabel(fee.propertyType)}</span><strong>{formatMMKAmount(fee.feeAmount)}</strong><button type="button" onClick={() => startEditingFee(fee)}>Edit</button></>}</div>)}</div>}{(feeMessage || (feeError && postingFees.length > 0)) && <div className={`admin-rail-status ${feeError ? 'error' : 'success'}`} aria-live="polite">{feeError || feeMessage}</div>}</section>

            <section className="admin-cockpit-rail-card"><div className="admin-cockpit-rail-heading"><span><Mail /></span><div><h2>Contact Messages</h2><p>{contactMessages.length} messages in the inbox.</p></div></div>{messagesLoading ? <div className="admin-rail-status">Loading contact messages...</div> : messagesError ? <div className="admin-rail-status error">{messagesError}</div> : contactMessages.length === 0 ? <div className="admin-cockpit-rail-empty">No contact messages yet.</div> : <div className="admin-cockpit-messages">{contactMessages.map((message) => <article id={`admin-contact-${message.id}`} key={message.id} tabIndex={-1} className={focusedTargetId === `admin-contact-${message.id}` ? 'admin-focus-highlight' : ''}><div><strong>{message.fullName}</strong><time dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time></div><span>{message.email}{message.phone ? ` · ${message.phone}` : ''}</span><p>{message.message}</p></article>)}</div>}</section>

            <section className="admin-cockpit-rail-card"><div className="admin-cockpit-rail-heading"><span><CheckCircle /></span><div><h2>Recently Processed</h2><p>Latest real moderation outcomes.</p></div></div>{recentlyProcessed.length === 0 ? <div className="admin-cockpit-rail-empty">No processed listings yet.</div> : <div className="admin-cockpit-processed">{recentlyProcessed.map((property) => <button key={property.id} type="button" onClick={() => { setModerationStatus(property.approvalStatus); window.setTimeout(() => document.getElementById(`admin-property-${property.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0); }}><span>{property.imageUrl ? <img src={resolvePropertyImageUrl(property.imageUrl)} alt="" /> : <Home />}</span><span><strong>{property.title}</strong><small>{formatDate(property.createdAt)}</small></span><i className={property.approvalStatus.toLowerCase()}>{property.approvalStatus === 'APPROVED' ? 'Approved' : 'Rejected'}</i></button>)}</div>}</section>
          </aside>
        </section>
      </main>

      {reviewing && <div className="dash-modal-overlay" onClick={() => setReviewing(null)}><div className="dash-modal admin-review-modal" onClick={(event) => event.stopPropagation()}><div className="dash-modal-header"><span className="dash-modal-title">Review Property</span><button className="dash-modal-close" onClick={() => setReviewing(null)} aria-label="Close"><X /></button></div><div className="admin-review-body">{reviewing.imageUrl ? <img src={resolvePropertyImageUrl(reviewing.imageUrl)} alt={reviewing.title} className="admin-review-thumb" /> : <div className="admin-review-thumb admin-review-thumb-fallback"><Home /></div>}<div className="admin-review-title-row"><div className="admin-review-title">{reviewing.title}</div><div className="admin-pending-price">{formatPropertyPrice(reviewing.price)}</div></div><div className="admin-review-loc"><MapPin /> {reviewing.location}</div><div className="admin-review-grid"><div className="admin-review-cell"><Bed /> {reviewing.bedrooms} beds</div><div className="admin-review-cell"><Bath /> {reviewing.bathrooms} baths</div><div className="admin-review-cell"><Square /> {reviewing.area.toLocaleString()} sqft</div><div className="admin-review-cell"><Home /> {typeLabel(reviewing.propertyType)}</div></div><div className="admin-review-meta"><div className="admin-review-meta-item"><span className="admin-review-label">Owner</span><span className="admin-review-value">{reviewing.owner} · {reviewing.ownerPhone || '—'}</span></div><div className="admin-review-meta-item"><span className="admin-review-label">Listing Type</span><span className="admin-review-value">{reviewing.status === 'FOR_SALE' ? 'For Sale' : 'For Rent'}</span></div><div className="admin-review-meta-item"><span className="admin-review-label">Submitted</span><span className="admin-review-value">{formatDate(reviewing.createdAt)}</span></div></div><div className="admin-review-desc"><span className="admin-review-label">Description</span><p>{reviewing.description}</p></div></div>{reviewing.approvalStatus === 'PENDING' && <div className="admin-review-actions"><button onClick={() => updateStatus(reviewing.id, 'REJECTED')} className="admin-btn-reject" disabled={updatingId === reviewing.id}><XCircle />Reject Listing</button><button onClick={() => updateStatus(reviewing.id, 'APPROVED')} className="admin-btn-approve" disabled={updatingId === reviewing.id}><CheckCircle />Approve Listing</button></div>}</div></div>}
    </div>
  );
}
