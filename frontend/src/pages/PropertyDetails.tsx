import { useEffect, useState, type SyntheticEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight, Bath, Bed, Building2, CalendarDays, Car, Check, ChevronRight,
  CircleDollarSign, Copy, FileCheck2, Heart, Image as ImageIcon,
  KeyRound, Landmark, Link2, MapPin, Ruler, ShieldCheck, UserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { PropertyMap, type MapCoordinates } from '../components/PropertyMap';
import { UrbanNestLogo } from '../components/UrbanNestLogo';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import { formatPropertyPrice } from '../utils/price';
import type { Property } from '../types';

const formatType = (propertyType: Property['propertyType']) =>
  propertyType.charAt(0) + propertyType.slice(1).toLowerCase();

const formatOwnership = (ownershipType?: Property['ownershipType']) => {
  if (!ownershipType) return 'Not specified';
  return ownershipType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase());
};

const formatDocumentStatus = (value?: boolean) => {
  if (value === true) return 'Available';
  if (value === false) return 'Not available';
  return 'Not specified';
};

function PhoneNumberDisplay({ phoneNumber }: { phoneNumber?: string | null }) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timeoutId = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  const copyPhoneNumber = async () => {
    if (!phoneNumber) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(phoneNumber);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = phoneNumber;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        try {
          document.body.appendChild(textarea);
          textarea.select();
          if (!document.execCommand('copy')) throw new Error('Clipboard copy was not available');
        } finally {
          textarea.remove();
        }
      }
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  if (!phoneNumber) return <div className="phone-number-display phone-number-unavailable">Phone number unavailable</div>;
  const feedback = copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy';

  return (
    <div className="phone-number-display">
      <span className="phone-number-text">{phoneNumber}</span>
      <button type="button" className={`phone-copy-btn ${copyStatus}`} onClick={copyPhoneNumber} aria-label="Copy phone number" title={feedback === 'Copy' ? 'Copy phone number' : feedback}>
        <Copy aria-hidden="true" /><span aria-live="polite">{feedback}</span>
      </button>
    </div>
  );
}

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { properties, getPropertyById } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'contact'>('overview');

  useEffect(() => {
    let cancelled = false;
    const propertyId = Number(id);
    if (!id || !Number.isInteger(propertyId) || propertyId <= 0) {
      setProperty(null);
      setError(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setProperty(null);
    getPropertyById(propertyId)
      .then((result) => { if (!cancelled) setProperty(result); })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          const status = typeof requestError === 'object' && requestError !== null && 'response' in requestError
            ? (requestError as { response?: { status?: number } }).response?.status
            : undefined;
          if (status === 404) setNotFound(true);
          else setError(requestError instanceof Error ? requestError.message : 'Unable to load this property.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, getPropertyById]);

  if (loading) return <div className="property-detail-page"><div className="property-detail-container"><div className="no-results"><p className="no-results-title">Loading property...</p></div></div></div>;

  if (error) {
    return <div className="property-detail-page"><div className="property-detail-container"><div className="no-results"><p className="no-results-title">Unable to load property</p><p className="no-results-sub">{error}</p><Link to="/" className="no-results-btn">Browse Listings</Link></div></div></div>;
  }

  if (notFound || !property) {
    return <div className="property-detail-page"><div className="property-detail-container"><div className="no-results"><p className="no-results-title">Property not found</p><p className="no-results-sub">This property is unavailable.</p><Link to="/" className="no-results-btn">Browse Listings</Link></div></div></div>;
  }

  const favoriteId = String(property.id);
  const isFav = isFavorite(favoriteId);
  const badge = property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale';
  const imageUrl = resolvePropertyImageUrl(property.imageUrl);
  const similarProperties = properties.filter((candidate) => candidate.id !== property.id && candidate.propertyType === property.propertyType).slice(0, 3);
  const propertyPosition: MapCoordinates | null = typeof property.latitude === 'number' && Number.isFinite(property.latitude)
    && typeof property.longitude === 'number' && Number.isFinite(property.longitude)
    ? [property.latitude, property.longitude] : null;
  const structuredAddress = [property.streetAddress, property.township, property.city, property.stateRegion, property.zipCode]
    .filter((part): part is string => Boolean(part?.trim())).join(', ');
  const displayAddress = structuredAddress || property.location;
  const pricePerSquareFoot = property.area > 0 ? Math.round(property.price / property.area) : null;
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/property-placeholder.svg';
  };

  return (
    <div className="property-detail-page property-showcase-page">
      <div className="property-detail-ambient" aria-hidden="true"><span /><span /><span /></div>
      <div className="property-detail-container">
        <div className="pd-toolbar">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link><ChevronRight /><Link to="/">Listings</Link><ChevronRight />
            {property.township && <><span>{property.township}</span><ChevronRight /></>}
            <span className="breadcrumb-current">{property.title}</span>
          </nav>
          <div className="pd-toolbar-actions">
            <button type="button" className={`pd-action-btn ${isFav ? 'active' : ''}`} onClick={() => toggleFavorite(favoriteId)}><Heart fill={isFav ? 'currentColor' : 'none'} /> {isFav ? 'Saved' : 'Save'}</button>
            <button type="button" className="pd-action-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}><Link2 /> Copy Link</button>
          </div>
        </div>

        <header className="pd-summary">
          <div className="pd-summary-copy">
            <div className="pd-badges"><span className="pd-listing-badge">{badge}</span><span className="pd-type-badge">{formatType(property.propertyType)}</span>{property.ownershipType && <span className="pd-ownership-badge"><ShieldCheck /> {formatOwnership(property.ownershipType)}</span>}</div>
            <h1>{property.title}</h1><p><MapPin /> {displayAddress}</p>
          </div>
          <div className="pd-valuation"><span>Listing Price</span><strong>{formatPropertyPrice(property.price)}</strong>{pricePerSquareFoot && <small>Approx. MMK {pricePerSquareFoot.toLocaleString()} / sq ft</small>}</div>
        </header>

        <section className="pd-gallery" aria-label="Property gallery">
          <figure className="pd-gallery-main"><img src={imageUrl} alt={property.title} onError={handleImageError} /><div className="pd-gallery-shade" /><figcaption><MapPin /> {property.township || property.city || property.location}</figcaption></figure>
          <div className="pd-gallery-rail">
            <div className="pd-gallery-preview"><img src={imageUrl} alt={`Additional crop of ${property.title}`} onError={handleImageError} /><span>Property image</span></div>
            <div className="pd-gallery-note"><ImageIcon /><div><strong>1 photo available</strong><span>This listing currently includes one property image.</span></div></div>
            <div className="pd-gallery-note pd-gallery-status"><ShieldCheck /><div><strong>{property.approvalStatus === 'APPROVED' ? 'Approved listing' : property.approvalStatus}</strong><span>Property information supplied by the owner.</span></div></div>
          </div>
        </section>

        <section className="pd-facts" aria-label="Property facts">
          <div className="pd-fact"><span><Bed /></span><div><small>Bedrooms</small><strong>{property.bedrooms}</strong></div></div>
          <div className="pd-fact"><span><Bath /></span><div><small>Bathrooms</small><strong>{property.bathrooms}</strong></div></div>
          <div className="pd-fact"><span><Ruler /></span><div><small>Floor Area</small><strong>{property.area.toLocaleString()} sq ft</strong></div></div>
          <div className="pd-fact"><span><Car /></span><div><small>Parking</small><strong>{property.parking ?? 'Not specified'}</strong></div></div>
          <div className="pd-fact"><span><CalendarDays /></span><div><small>Year Built</small><strong>{property.yearBuilt ?? 'Not specified'}</strong></div></div>
          <div className="pd-fact"><span><KeyRound /></span><div><small>Ownership</small><strong>{formatOwnership(property.ownershipType)}</strong></div></div>
        </section>

        <div className="pd-content-grid">
          <main className="pd-main-column">
            <div className="pd-section-tabs" role="tablist" aria-label="Property information"><button type="button" role="tab" aria-selected={activeTab === 'overview'} className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button><button type="button" role="tab" aria-selected={activeTab === 'contact'} className={activeTab === 'contact' ? 'active' : ''} onClick={() => setActiveTab('contact')}>Contact Owner</button></div>
            {activeTab === 'overview' ? (
              <>
                <section className="pd-section-card pd-narrative"><div className="pd-section-eyebrow"><Landmark /> Property Narrative</div><h2>About This Property</h2><p>{property.description}</p></section>
                <section className="pd-legal-section"><h2><ShieldCheck /> Property Documentation</h2><div className="pd-legal-grid"><article><span><FileCheck2 /></span><div><strong>Title Deed (Grant)</strong><p>{formatDocumentStatus(property.hasGrant)}</p></div></article><article><span><Building2 /></span><div><strong>Building Permit</strong><p>{formatDocumentStatus(property.hasPermit)}</p></div></article></div></section>
                <section className="pd-section-card pd-details-card"><div className="pd-section-heading"><h2>Property Details</h2><span>{formatType(property.propertyType)}</span></div><dl><div><dt>Property Type</dt><dd>{formatType(property.propertyType)}</dd></div><div><dt>Listing Type</dt><dd>{badge}</dd></div><div><dt>Ownership</dt><dd>{formatOwnership(property.ownershipType)}</dd></div><div><dt>Grant</dt><dd>{formatDocumentStatus(property.hasGrant)}</dd></div><div><dt>Permit</dt><dd>{formatDocumentStatus(property.hasPermit)}</dd></div><div><dt>Legacy Location</dt><dd>{property.location}</dd></div></dl></section>
                <section className="pd-section-card pd-features-card"><div className="pd-section-heading"><h2>Features & Amenities</h2><span>{property.features?.length ?? 0} listed</span></div>{property.features?.length ? <div className="pd-features-grid">{property.features.map((feature) => <span key={feature}><i><Check /></i>{feature}</span>)}</div> : <p className="pd-empty-copy">No additional features have been listed for this property.</p>}</section>
                <section className="pd-section-card pd-map-card"><div className="pd-map-heading"><div><h2>Neighborhood & Location</h2><p>{displayAddress}</p></div>{propertyPosition && <span><MapPin /> Exact listing coordinates</span>}</div>{propertyPosition ? <PropertyMap center={propertyPosition} position={propertyPosition} /> : <p className="detail-location-unavailable">Location not available</p>}</section>
              </>
            ) : (
              <section className="pd-section-card pd-contact-section"><div className="pd-section-eyebrow"><UserRound /> Direct Owner Contact</div><h2>Contact {property.owner}</h2><p>Copy the listed phone number to contact the property owner outside UrbanNest.</p>{isAuthenticated ? <PhoneNumberDisplay phoneNumber={property.ownerPhone} /> : <div className="pd-signin-prompt"><span>Sign in to view the owner's phone number.</span><Link to="/login">Sign In</Link></div>}</section>
            )}
          </main>

          <aside className="pd-sidebar">
            <section className="pd-owner-card"><div className="pd-owner-profile"><span><UserRound /></span><div><small>Listed by owner</small><strong>{property.owner}</strong></div></div><div className="pd-owner-contact"><label>Owner Direct Contact</label>{isAuthenticated ? <PhoneNumberDisplay phoneNumber={property.ownerPhone} /> : <div className="pd-signin-prompt"><span>Sign in to contact the owner.</span><Link to="/login">Sign In</Link></div>}<p>Read-only contact information. Use the copy control to save the exact number.</p></div><button type="button" className={`pd-save-property ${isFav ? 'active' : ''}`} onClick={() => toggleFavorite(favoriteId)}><Heart fill={isFav ? 'currentColor' : 'none'} /> {isFav ? 'Saved to Favorites' : 'Save Property'}</button></section>
            <section className="pd-location-summary"><h3><MapPin /> Structured Location</h3><dl><div><dt>Street</dt><dd>{property.streetAddress || 'Not specified'}</dd></div><div><dt>Township</dt><dd>{property.township || 'Not specified'}</dd></div><div><dt>City</dt><dd>{property.city || 'Not specified'}</dd></div><div><dt>State/Region</dt><dd>{property.stateRegion || 'Not specified'}</dd></div><div><dt>ZIP Code</dt><dd>{property.zipCode || 'Not specified'}</dd></div></dl></section>
          </aside>
        </div>

        {similarProperties.length > 0 && (
          <section className="similar-section"><div className="pd-section-eyebrow"><CircleDollarSign /> More UrbanNest Listings</div><h2 className="similar-title">Similar Properties</h2><div className="similar-grid">{similarProperties.map((similar) => <Link key={similar.id} to={`/property/${similar.id}`} className="pd-similar-link"><article className="home-card"><div className="home-card-img-wrap"><img src={resolvePropertyImageUrl(similar.imageUrl)} alt={similar.title} className="home-card-img" onError={handleImageError} /><span className={`home-card-badge ${similar.status === 'FOR_SALE' ? 'sale' : 'rent'}`}>{similar.status === 'FOR_RENT' ? 'For Rent' : 'For Sale'}</span></div><div className="home-card-body"><div className="home-card-price">{formatPropertyPrice(similar.price)}</div><div className="home-card-title">{similar.title}</div><div className="home-card-address"><MapPin /> {similar.location}</div><div className="home-card-stats"><span>{similar.bedrooms} beds</span><span>{similar.bathrooms} baths</span><span>{similar.area.toLocaleString()} sqft</span></div><span className="pd-similar-action">View Property <ArrowRight /></span></div></article></Link>)}</div></section>
        )}
      </div>

      <footer className="pd-footer"><div><Link to="/" className="pd-footer-brand"><UrbanNestLogo className="pd-footer-logo" />UrbanNest Real Estate</Link><nav><Link to="/">Home</Link><Link to="/contact">Contact</Link><Link to="/dashboard">Dashboard</Link><Link to="/privacy">Privacy</Link></nav></div><div><p>© 2026 UrbanNest Real Estate. All rights reserved.</p><p>Property discovery in Yangon, Myanmar.</p></div></footer>
    </div>
  );
}
