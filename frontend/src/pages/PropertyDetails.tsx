import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Phone, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useProperties } from '../contexts/PropertiesContext';
import type { Property } from '../types';

const formatType = (propertyType: Property['propertyType'], language: string) => language === 'my'
  ? ({ APARTMENT: 'အခန်း', HOUSE: 'အိမ်', CONDO: 'ကွန်ဒို', LAND: 'မြေ', TOWNHOUSE: 'တိုက်ခန်း' }[propertyType])
  : propertyType.charAt(0) + propertyType.slice(1).toLowerCase();

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
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
      .then((result) => {
        if (!cancelled) setProperty(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          const status = typeof requestError === 'object' && requestError !== null && 'response' in requestError
            ? (requestError as { response?: { status?: number } }).response?.status
            : undefined;
          if (status === 404) {
            setNotFound(true);
          } else {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load this property.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, getPropertyById]);

  if (loading) {
    return <div className="property-detail-page"><div className="property-detail-container"><div className="no-results"><p className="no-results-title">{language === 'my' ? 'အိမ်ခြံမြေ ရယူနေပါသည်...' : 'Loading property...'}</p></div></div></div>;
  }

  if (error) {
    return (
      <div className="property-detail-page">
        <div className="property-detail-container">
          <div className="no-results">
            <p className="no-results-title">{language === 'my' ? 'အိမ်ခြံမြေကို ရယူ၍ မရပါ' : 'Unable to load property'}</p>
            <p className="no-results-sub">{error}</p>
            <Link to="/" className="no-results-btn">{language === 'my' ? 'စာရင်းများ ကြည့်ရန်' : 'Browse Listings'}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="property-detail-page">
        <div className="property-detail-container">
          <div className="no-results">
            <p className="no-results-title">{language === 'my' ? 'အိမ်ခြံမြေကို ရှာမတွေ့ပါ' : 'Property not found'}</p>
            <p className="no-results-sub">{language === 'my' ? 'ဤအိမ်ခြံမြေကို မရနိုင်ပါ။' : 'This property is unavailable.'}</p>
            <Link to="/" className="no-results-btn">{language === 'my' ? 'စာရင်းများ ကြည့်ရန်' : 'Browse Listings'}</Link>
          </div>
        </div>
      </div>
    );
  }

  const favoriteId = String(property.id);
  const isFav = isFavorite(favoriteId);
  const badge = property.status === 'FOR_RENT'
    ? (language === 'my' ? 'ငှားရန်' : 'For Rent')
    : (language === 'my' ? 'ရောင်းရန်' : 'For Sale');
  const priceFormatted = `MMK ${property.price.toLocaleString()}`;
  const similarProperties = properties
    .filter((candidate) => candidate.id !== property.id && candidate.propertyType === property.propertyType)
    .slice(0, 3);

  return (
    <div className="property-detail-page">
      <div className="property-detail-container">
        <div className="breadcrumb">
          <Link to="/">{t('home')}</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/">{property.status === 'FOR_RENT' ? t('rent') : t('buy')}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{property.title}</span>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            <div className="detail-gallery">
              <span className={`detail-badge ${property.status === 'FOR_SALE' ? 'sale' : 'rent'}`}>{badge}</span>
              <img
                src={property.imageUrl?.startsWith('http') ? property.imageUrl : '/property-placeholder.svg'}
                alt={property.title}
                className="detail-main-image"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/property-placeholder.svg';
                }}
              />
            </div>

            <div className="detail-header">
              <div className="detail-type-row">
                <span className="detail-type-badge">{formatType(property.propertyType, language)}</span>
              </div>
              <div className="detail-title-row">
                <h1 className="detail-title">{property.title}</h1>
                <span className="detail-price">{priceFormatted}</span>
              </div>
              <p className="detail-address"><MapPin className="w-4 h-4" /> {property.location}</p>
            </div>

            <div className="detail-stats">
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Bed className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.bedrooms}</div>
                <div className="detail-stat-label">{t('beds')}</div>
              </div>
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Bath className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.bathrooms}</div>
                <div className="detail-stat-label">{t('baths')}</div>
              </div>
              <div className="detail-stat-box">
                <div className="detail-stat-icon"><Square className="w-6 h-6 text-blue-600" /></div>
                <div className="detail-stat-value">{property.area.toLocaleString()}</div>
                <div className="detail-stat-label">{t('sqft')}</div>
              </div>
            </div>

            <div className="detail-tabs">
              <button className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>{t('overview')}</button>
              <button className={`detail-tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>{t('contact')}</button>
            </div>

            <div className="detail-tab-content">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="detail-section-title">{t('aboutThisProperty')}</h2>
                  <p className="detail-description">{property.description}</p>
                </div>
              )}
              {activeTab === 'contact' && (
                <div>
                  <h2 className="detail-section-title">{t('contactOwner')}</h2>
                  <div className="agent-info"><div className="agent-name">{property.owner}</div></div>
                  {isAuthenticated ? (
                    <a href={`tel:${property.ownerPhone}`} className="agent-schedule-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                      <Phone className="w-5 h-5" /> {property.ownerPhone}
                    </a>
                  ) : (
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>{t('signInToContact')}</p>
                      <Link to="/login" className="agent-schedule-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>{t('signIn')}</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="agent-card">
              <div className="agent-card-title">{t('listedBy')}</div>
              <div className="agent-info"><div className="agent-name">{property.owner}</div></div>
              {isAuthenticated ? (
                <div className="agent-contact-item"><Phone className="w-5 h-5" /><span>{property.ownerPhone}</span></div>
              ) : (
                <Link to="/login" className="agent-schedule-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>{t('signInToContact')}</Link>
              )}
            </div>

            <div className="share-card">
              <div className="share-title">{t('shareThisProperty')}</div>
              <div className="share-btns">
                <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}><Copy className="w-4 h-4" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> {t('copyLink')}</button>
                <button className={`share-btn ${isFav ? 'saved' : ''}`} onClick={() => toggleFavorite(favoriteId)}>
                  <Heart className="w-4 h-4" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} fill={isFav ? 'currentColor' : 'none'} />
                  {isFav ? t('savedFavorites') : t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {similarProperties.length > 0 && (
          <div className="similar-section">
            <h2 className="similar-title">{t('similarProperties')}</h2>
            <div className="similar-grid">
              {similarProperties.map((similar) => (
                <Link key={similar.id} to={`/property/${similar.id}`} style={{ textDecoration: 'none' }}>
                  <div className="home-card">
                    <div className="home-card-img-wrap">
                      <img src={similar.imageUrl} alt={similar.title} className="home-card-img" />
                      <span className={`home-card-badge ${similar.status === 'FOR_SALE' ? 'sale' : 'rent'}`}>
                        {similar.status === 'FOR_RENT'
                          ? (language === 'my' ? 'ငှားရန်' : 'For Rent')
                          : (language === 'my' ? 'ရောင်းရန်' : 'For Sale')}
                      </span>
                    </div>
                    <div className="home-card-body">
                      <div className="home-card-price">MMK {similar.price.toLocaleString()}</div>
                      <div className="home-card-title">{similar.title}</div>
                      <div className="home-card-address"><MapPin className="w-4 h-4" /> {similar.location}</div>
                      <div className="home-card-stats">
                        <span>{similar.bedrooms} {t('beds')}</span>
                        <span>{similar.bathrooms} {t('baths')}</span>
                        <span>{similar.area.toLocaleString()} {t('sqft')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
