import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Heart, ArrowRight, ArrowUpDown, Compass, Bell, Home as HomeIcon, ChevronDown, Building2, Landmark, MapPinned, Smile, BadgeCheck, Camera, ShieldCheck, PlusCircle, CircleDollarSign } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';
import { YANGON_TOWNSHIPS } from '../data/myanmarProperties';
import { filterProperties, parseOptionalPrice, type BedroomFilter } from '../utils/propertyFilters';
import { resolvePropertyImageUrl } from '../utils/imageUrl';
import { formatPropertyPrice } from '../utils/price';
import type { Property, PropertyType } from '../types';
import { UrbanNestLogo } from '../components/UrbanNestLogo';

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'LAND', label: 'Land' },
];

const BEDROOM_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5plus', label: '5+' },
] as const;
const SORT_VALUES = ['price-asc', 'price-desc'] as const;
type PriceSort = '' | typeof SORT_VALUES[number];

function parseBedroomFilter(value: string | null): BedroomFilter | undefined {
  if (value === '5plus') return value;
  if (value === '1' || value === '2' || value === '3' || value === '4') return Number(value) as BedroomFilter;
  return undefined;
}

const FEATURES = [
  { icon: Search, title: 'Smart Search', desc: 'Search by township, property type, and budget to find the right home in Yangon.' },
  { icon: Compass, title: 'Verified Listings', desc: 'Every property is reviewed by our admins before it goes live for buyers.' },
  { icon: Bell, title: 'Listing Updates', desc: 'Stay informed when your listings are approved or rejected.' },
  { icon: Heart, title: 'Save & Shortlist', desc: 'Save your favorite homes and compare them anytime from your dashboard.' },
];

function PropertyCard({ property }: { property: Property }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favoriteId = String(property.id);
  const isFav = isFavorite(favoriteId);
  const type = property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase();
  const badge = property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale';
  const isForRent = property.status === 'FOR_RENT';

  return (
    <article className="property-card">
      <div className="property-image-wrapper">
        <img
          src={resolvePropertyImageUrl(property.imageUrl)}
          alt={property.title}
          className="property-image"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = '/property-placeholder.svg';
          }}
        />
        <div className="property-badges">
          <span className={`property-badge ${isForRent ? 'rent' : 'sale'}`}>{badge}</span>
          <span className="property-active-badge"><span /> Active</span>
        </div>
        <button onClick={() => toggleFavorite(favoriteId)} className="property-favorite" aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
          <Heart
            className="w-5 h-5"
            color={isFav ? '#ef4444' : '#94a3b8'}
            fill={isFav ? '#ef4444' : 'none'}
          />
        </button>
      </div>
      <div className="property-info">
        <div className="property-info-top">
          <h3 className="property-title">{property.title}</h3>
          <span className="property-type-badge">{type}</span>
        </div>
        <p className="property-address">
          <MapPin className="w-4 h-4" />
          {property.location}
        </p>
        <div className="property-specs">
          <span className="property-spec">
            <Bed className="w-4 h-4" /> {property.bedrooms} beds
          </span>
          <span className="property-spec">
            <Bath className="w-4 h-4" /> {property.bathrooms} baths
          </span>
          <span className="property-spec">
            <Square className="w-4 h-4" /> {property.area.toLocaleString()} sqft
          </span>
        </div>
        <div className="property-footer">
          <div className="property-price-wrap">
            <span className="property-price-label">Price</span>
            <span className="property-price">{formatPropertyPrice(property.price)}</span>
          </div>
          <Link to={`/property/${property.id}`} className="property-details-link">
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading, error } = useProperties();
  const rawListing = searchParams.get('listing');
  const rawTown = searchParams.get('town');
  const rawPropertyType = searchParams.get('propertyType');
  const rawBedrooms = searchParams.get('bedrooms');
  const rawMinPrice = searchParams.get('minPrice');
  const rawMaxPrice = searchParams.get('maxPrice');
  const rawSort = searchParams.get('sort');
  const listingType: 'buy' | 'rent' = rawListing === 'rent' ? 'rent' : 'buy';
  const selectedTown = YANGON_TOWNSHIPS.some((township) => township.id === rawTown) ? rawTown ?? '' : '';
  const propertyType = PROPERTY_TYPES.some((type) => type.value === rawPropertyType)
    ? rawPropertyType as PropertyType
    : '';
  const bedroomFilter = parseBedroomFilter(rawBedrooms);
  const sort: PriceSort = SORT_VALUES.includes(rawSort as typeof SORT_VALUES[number])
    ? rawSort as typeof SORT_VALUES[number]
    : '';
  const minPriceValue = parseOptionalPrice(rawMinPrice);
  const maxPriceValue = parseOptionalPrice(rawMaxPrice);
  const minPrice = minPriceValue === undefined ? '' : rawMinPrice ?? '';
  const maxPrice = maxPriceValue === undefined ? '' : rawMaxPrice ?? '';
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;
    const remove = (key: string) => {
      if (next.has(key)) {
        next.delete(key);
        changed = true;
      }
    };

    if (rawListing !== null && rawListing !== 'buy' && rawListing !== 'rent') remove('listing');
    if (rawTown !== null && !YANGON_TOWNSHIPS.some((township) => township.id === rawTown)) remove('town');
    if (rawPropertyType !== null && !PROPERTY_TYPES.some((type) => type.value === rawPropertyType)) remove('propertyType');
    if (rawBedrooms !== null && bedroomFilter === undefined) remove('bedrooms');
    if (rawMinPrice !== null && (!rawMinPrice.trim() || minPriceValue === undefined)) remove('minPrice');
    if (rawMaxPrice !== null && (!rawMaxPrice.trim() || maxPriceValue === undefined)) remove('maxPrice');
    if (rawSort !== null && !SORT_VALUES.includes(rawSort as typeof SORT_VALUES[number])) remove('sort');
    remove('q');
    remove('type');
    remove('min');
    remove('max');

    if (changed) setSearchParams(next, { replace: true });
  }, [
    maxPriceValue,
    minPriceValue,
    bedroomFilter,
    rawListing,
    rawBedrooms,
    rawMaxPrice,
    rawMinPrice,
    rawPropertyType,
    rawSort,
    rawTown,
    searchParams,
    setSearchParams,
  ]);

  const updateFilter = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace });
  };

  const clearOptionalFilters = () => {
    const next = new URLSearchParams(searchParams);
    ['town', 'propertyType', 'bedrooms', 'minPrice', 'maxPrice', 'sort'].forEach((key) => next.delete(key));
    setSearchParams(next);
  };

  const filteredProperties = useMemo(() => {
    const matches = filterProperties(properties, {
      listing: listingType,
      town: selectedTown,
      propertyType,
      bedrooms: bedroomFilter,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
    });

    if (!sort) return matches;

    return [...matches].sort((left, right) => (
      sort === 'price-asc' ? left.price - right.price : right.price - left.price
    ));
  }, [properties, listingType, selectedTown, propertyType, bedroomFilter, minPriceValue, maxPriceValue, sort]);
  const approvedPropertyCount = properties.filter(
    (property) => property.approvalStatus === 'APPROVED',
  ).length;

  const renderTown = (town: { nameEn: string }) => town.nameEn;

  return (
    <div className="home-page min-h-screen">
      <div className="home-ambient" aria-hidden="true">
        <span className="home-ambient-one" />
        <span className="home-ambient-two" />
        <span className="home-ambient-three" />
      </div>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="search-toggle" aria-label="Listing type">
            <button type="button" onClick={() => updateFilter('listing', 'buy')} className={`search-toggle-btn ${listingType === 'buy' ? 'active' : ''}`}>Buy</button>
            <button type="button" onClick={() => updateFilter('listing', 'rent')} className={`search-toggle-btn ${listingType === 'rent' ? 'active' : ''}`}>Rent</button>
          </div>
          <h1 className="hero-title">Discover Living Spaces Crafted for <em>Modern Solace</em></h1>
          <p className="hero-subtitle">
            Curated residential architecture, private sanctuaries, and urban lofts in prime city districts.
          </p>
          <div className="search-box">
            <div className="search-filters">
              <div className="search-filter-field">
                <label className="search-filter-label"><Building2 /> Township</label>
                <div className="search-select-wrap">
                  <select
                    className="search-select"
                    value={selectedTown}
                    onChange={(e) => updateFilter('town', e.target.value)}
                  >
                    <option value="">All Townships</option>
{YANGON_TOWNSHIPS.map((town) => (
                      <option key={town.id} value={town.id}>
                        {renderTown(town)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
              <div className="search-filter-field">
                <label className="search-filter-label"><Landmark /> Property Type</label>
                <div className="search-select-wrap">
                  <select
                    className="search-select"
                    value={propertyType}
                    onChange={(e) => updateFilter('propertyType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
              <div className="search-filter-field">
                <label className="search-filter-label"><Bed /> Bedrooms</label>
                <div className="search-select-wrap">
                  <select
                    className="search-select"
                    value={rawBedrooms ?? ''}
                    onChange={(e) => updateFilter('bedrooms', e.target.value)}
                  >
                    <option value="">Any Bedrooms</option>
                    {BEDROOM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
              <div className="search-filter-field search-price-field">
                <label className="search-filter-label">
                  <CircleDollarSign /> {listingType === 'buy' ? 'Price Range' : 'Monthly Price'}
                </label>
                <div className="search-price-row">
                  <div className="search-price-input-wrap">
                    <input
                      type="number"
                      min="0"
                      className="search-price-input"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value, true)}
                    />
                    <span className="search-price-suffix">MMK</span>
                  </div>
                  <span className="search-price-separator">—</span>
                  <div className="search-price-input-wrap">
                    <input
                      type="number"
                      min="0"
                      className="search-price-input"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value, true)}
                    />
                    <span className="search-price-suffix">MMK</span>
                  </div>
                </div>
              </div>
              <div className="search-filter-field search-sort-field">
                <label className="search-filter-label"><ArrowUpDown /> Sort By</label>
                <div className="search-select-wrap">
                  <select
                    className="search-select"
                    value={sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                  >
                    <option value="">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="search-select-chevron" />
                </div>
              </div>
            </div>
          </div>
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-icon stat-icon-primary"><Building2 /></span>
              <div><div className="stat-value">{approvedPropertyCount}</div><div className="stat-label">Active Listings</div></div>
            </div>
            <div className="stat-item">
              <span className="stat-icon stat-icon-secondary"><MapPinned /></span>
              <div><div className="stat-value">1</div><div className="stat-label">City Covered</div></div>
            </div>
            <div className="stat-item">
              <span className="stat-icon stat-icon-neutral"><Smile /></span>
              <div><div className="stat-value">0 <small>New Platform</small></div><div className="stat-label">Happy Buyers</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section" id="featured-properties">
        <div className="featured-header">
          <div>
            <div className="featured-label"><span /> Curated Catalog</div>
            <h2 className="featured-title">Featured Architectural Residences</h2>
            <p className="featured-subtitle">Handpicked sanctuaries balanced in organic materials and refined geometry.</p>
          </div>
        </div>
        <div className="properties-grid">
          {!loading && !error && filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        {loading && <div className="no-results"><p className="no-results-title">Loading properties...</p></div>}
        {!loading && error && (
          <div className="no-results">
            <p className="no-results-title">Unable to load properties</p>
            <p className="no-results-sub">{error}</p>
          </div>
        )}
        {!loading && !error && filteredProperties.length === 0 && (
          <div className="no-results">
            <Search className="no-results-icon" />
            <p className="no-results-title">No properties match your search</p>
            <p className="no-results-sub">Try clearing the filters or choose another township.</p>
            <button
              type="button"
              className="no-results-btn"
              onClick={clearOptionalFilters}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <div className="features-label">Why UrbanNest</div>
            <h2 className="features-title">A calmer way to find home</h2>
            <p className="features-subtitle">Useful tools, trusted data, and thoughtful details in one refined experience.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3 className="feature-name">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="owner-showcase">
        <div className="owner-showcase-card">
          <div className="owner-showcase-content">
            <span className="owner-showcase-kicker"><HomeIcon /> For Property Owners</span>
            <h2 className="owner-showcase-title">Selling or Renting Your Property?</h2>
            <p className="owner-showcase-description">
              Present your Yangon property through UrbanNest with structured details, clear imagery, and an admin-reviewed listing.
            </p>
            <div className="owner-showcase-actions">
              <Link to="/property/add" className="owner-showcase-primary">
                List Your Property <PlusCircle />
              </Link>
              <Link to="/contact" className="owner-showcase-secondary">Contact UrbanNest</Link>
            </div>
          </div>
          <div className="owner-showcase-benefits" aria-label="UrbanNest listing features">
            <div className="owner-benefit">
              <span><BadgeCheck /></span>
              <div><strong>Admin Reviewed</strong><small>Listings are checked before publication</small></div>
            </div>
            <div className="owner-benefit">
              <span><Camera /></span>
              <div><strong>Property Imagery</strong><small>Upload photos directly from your device</small></div>
            </div>
            <div className="owner-benefit">
              <span><ShieldCheck /></span>
              <div><strong>Owner Controlled</strong><small>Manage your listing from your dashboard</small></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-top">
            <Link to="/" className="home-footer-brand">
              <UrbanNestLogo className="home-footer-logo" />
              <span>UrbanNest Real Estate</span>
            </Link>
            <nav className="home-footer-nav" aria-label="Footer navigation">
              <Link to="/">Home</Link>
              <a href="#featured-properties">Properties</a>
              <Link to="/contact">Contact</Link>
              <Link to="/dashboard">Dashboard</Link>
            </nav>
          </div>
          <div className="home-footer-bottom">
            <p>© 2026 UrbanNest Real Estate. All rights reserved.</p>
            <div className="home-footer-meta">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <span>Property discovery in Yangon, Myanmar.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
