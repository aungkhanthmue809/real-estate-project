import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Heart, ArrowRight, Shield, Compass, Bell, Home as HomeIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { propertyAPI } from '../utils/api';
import type { Property } from '../types';
import { PropertyImage } from '../components/PropertyImage';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  { icon: Search, titleEn: 'Smart Search', titleMy: 'ဉာဏ်ရည်တု ရှာဖွေမှု', descEn: 'AI-powered filters match your lifestyle preferences with the right home.', descMy: 'AI-powered filters match your lifestyle preferences with the right home.' },
  { icon: Compass, titleEn: 'Virtual Tours', titleMy: 'Virtual Tours', descEn: 'Explore every room in 3D from your device before scheduling a visit.', descMy: 'Explore every room in 3D from your device before scheduling a visit.' },
  { icon: Bell, titleEn: 'Instant Alerts', titleMy: 'ချက်ချင်း သတိပေးချက်', descEn: 'Get notified the moment a home matching your criteria hits the market.', descMy: 'Get notified the moment a home matching your criteria hits the market.' },
  { icon: Shield, titleEn: 'Secure Transactions', titleMy: 'လုံခြုံသော ငွေပေးချေမှု', descEn: 'Encrypted documents and verified agents for a trusted buying experience.', descMy: 'Encrypted documents and verified agents for a trusted buying experience.' },
];

function PropertyCard({ property, favoriteIds }: { property: Property; favoriteIds: Set<number> }) {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(favoriteIds.has(property.id));

  const badge = property.status === 'FOR_RENT' ? 'For Rent' : 'For Sale';
  const isForRent = property.status === 'FOR_RENT';

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      if (isFav) {
        await propertyAPI.removeFavorite(property.id);
      } else {
        await propertyAPI.addFavorite(property.id);
      }
      setIsFav(!isFav);
    } catch {
      // ignore
    }
  };

  return (
    <div className="property-card">
      <div className="property-image-wrapper">
        <PropertyImage src={property.imageUrl} alt={property.title} className="property-image" />
        <span className={`property-badge ${isForRent ? 'rent' : 'sale'}`}>{badge}</span>
        <button onClick={toggleFavorite} className="property-favorite" aria-label="Favorite">
          <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
      </div>
      <div className="property-info">
        <div className="property-info-top">
          <h3 className="property-title">{property.title}</h3>
          <span className="property-type-badge">{property.propertyType}</span>
        </div>
        <p className="property-address">
          <MapPin className="w-4 h-4" />
          {property.location}
        </p>
        <div className="property-specs">
          <span className="property-spec">
            <Bed className="w-4 h-4" /> {property.bedrooms ?? 0} beds
          </span>
          <span className="property-spec">
            <Bath className="w-4 h-4" /> {property.bathrooms ?? 0} baths
          </span>
          <span className="property-spec">
            <Square className="w-4 h-4" /> {property.area ? property.area.toLocaleString() : '0'} sqft
          </span>
        </div>
        <div className="property-footer">
          <span className="property-price">K {property.price.toLocaleString()}</span>
          <Link to={`/property/${property.id}`} className="property-details-link">
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [listingType, setListingType] = useState(searchParams.get('type') === 'rent' ? 'rent' : 'buy');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get('q') ?? undefined;
    const type = searchParams.get('type') === 'rent' ? 'FOR_RENT' : 'FOR_SALE';
    setListingType(searchParams.get('type') === 'rent' ? 'rent' : 'buy');
    setSearchQuery(q ?? '');
    setLoading(true);
    propertyAPI
      .search({ keyword: q, status: type })
      .then((res) => setProperties(res.data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      propertyAPI
        .getFavorites()
        .then((res) => setFavoriteIds(new Set(res.data.map((f) => f.id))))
        .catch(() => {});
    } else {
      setFavoriteIds(new Set());
    }
  }, [searchParams, isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(searchQuery)}&type=${listingType}`);
  };

  return (
    <div className="min-h-screen">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            {properties.length}+ active listings
          </div>
          <h1 className="hero-title">Find Your Perfect Home, Smarter.</h1>
          <p className="hero-subtitle">
            Search listings with intelligent filters, verified sellers, and direct contact — all in one place.
          </p>
          <form onSubmit={handleSearch} className="search-box">
            <div className="search-toggle">
              <button type="button" onClick={() => setListingType('buy')} className={`search-toggle-btn ${listingType === 'buy' ? 'active' : ''}`}>Buy</button>
              <button type="button" onClick={() => setListingType('rent')} className={`search-toggle-btn ${listingType === 'rent' ? 'active' : ''}`}>Rent</button>
            </div>
            <div className="search-input-row">
              <MapPin className="search-input-icon w-5 h-5" />
              <input type="text" placeholder="Search by title or location" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button type="submit" className="search-btn">Search Homes</button>
            </div>
          </form>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-value">{properties.length}+</div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">1</div>
            <div className="stat-label">Cities Covered</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100%</div>
            <div className="stat-label">Direct Contact</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24h</div>
            <div className="stat-label">Approval Review</div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <div>
            <div className="featured-label">Hand-Picked</div>
            <h2 className="featured-title">Featured Properties</h2>
          </div>
          <Link to="/" className="featured-link">
            View all listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="properties-grid">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} favoriteIds={favoriteIds} />
            ))}
            {properties.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-500">
                No properties found. Try a different search.
              </div>
            )}
          </div>
        )}
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <div className="features-label">Why UrbanNest</div>
            <h2 className="features-title">Everything you need to find home</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3 className="feature-name">{language === 'my' ? feature.titleMy : feature.titleEn}</h3>
                <p className="feature-desc">{language === 'my' ? feature.descMy : feature.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">Ready to list your property?</h2>
            <p className="cta-desc">
              Join sellers using UrbanNest to connect with qualified buyers nationwide.
            </p>
          </div>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn-primary">Create Free Account</Link>
            <Link to="/" className="cta-btn-secondary">Browse Listings</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <span className="footer-brand-icon">
                  <HomeIcon className="w-5 h-5" />
                </span>
                <span className="footer-brand-name">UrbanNest</span>
              </div>
              <p className="footer-brand-desc">
                Your trusted partner in finding and managing real estate.
              </p>
            </div>
            <div>
              <h4 className="footer-col-title">Explore</h4>
              <ul className="footer-links">
                <li className="footer-link"><a href="/?type=buy">Buy a Home</a></li>
                <li className="footer-link"><a href="/?type=rent">Rent a Home</a></li>
                <li className="footer-link"><a href="/">New Listings</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Sellers</h4>
              <ul className="footer-links">
                <li className="footer-link"><a href="/property/add">List a Property</a></li>
                <li className="footer-link"><a href="/dashboard">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links">
                <li className="footer-link"><a href="/">About Us</a></li>
                <li className="footer-link"><a href="/">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 UrbanNest, Inc. All rights reserved.</p>
            <div className="footer-legal">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
