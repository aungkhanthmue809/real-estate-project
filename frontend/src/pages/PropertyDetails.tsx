import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Phone, MessageCircle, Star, Copy, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { propertyAPI } from '../utils/api';
import type { Property } from '../types';
import { PropertyImage } from '../components/PropertyImage';

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'contact'>('overview');
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    propertyAPI
      .getById(Number(id))
      .then((res) => setProperty(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !property) return;
    propertyAPI
      .getFavorites()
      .then((res) => setIsFav(res.data.some((f) => f.id === property.id)))
      .catch(() => {});
  }, [isAuthenticated, property]);

  const toggleFavorite = async () => {
    if (!property) return;
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-start justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mt-24"></div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-start justify-center px-4">
        <div className="text-center mt-16">
          <p className="text-slate-500 mb-4">Property not found or pending approval.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isRent = property.status === 'FOR_RENT';
  const badge = isRent ? 'For Rent' : 'For Sale';
  const priceFormatted = `K ${property.price.toLocaleString()}`;
  const ownerPhone = property.ownerPhone || '';
  const viberHref = ownerPhone ? `viber://chat?number=${encodeURIComponent(ownerPhone.replace(/\D/g, ''))}` : '#';
  const specs = [
    { icon: <Bed className="w-5 h-5" />, value: `${property.bedrooms ?? 0}`, label: t('beds') },
    { icon: <Bath className="w-5 h-5" />, value: `${property.bathrooms ?? 0}`, label: t('baths') },
    { icon: <Square className="w-5 h-5" />, value: `${(property.area ?? 0).toLocaleString()}`, label: t('sqft') },
    { icon: <MapPin className="w-5 h-5" />, value: property.location || '—', label: 'Location' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-5">
          <Link to="/" className="hover:text-blue-600 transition-colors">{t('home')}</Link>
          <span>/</span>
          <Link to={`/?type=${isRent ? 'rent' : 'buy'}`} className="hover:text-blue-600 transition-colors">
            {isRent ? t('rent') : t('buy')}
          </Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[220px]">{property.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="relative">
                <span className={`absolute top-4 left-4 z-10 text-xs font-semibold px-2.5 py-1 rounded-full ${isRent ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                  {badge}
                </span>
                <PropertyImage src={property.imageUrl} alt={property.title} className="w-full h-64 sm:h-96 object-cover" />
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                    {property.propertyType}
                  </span>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">{property.title}</h1>
                  <span className="text-2xl font-bold text-blue-600 whitespace-nowrap">{priceFormatted}</span>
                </div>
                <p className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <MapPin className="w-4 h-4" /> {property.location}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {specs.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    {s.icon}
                  </div>
                  <div className="text-lg font-bold text-slate-800 truncate">{s.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t('overview')}
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'contact' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t('contact')}
                  </button>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={toggleFavorite}
                    className={`text-sm font-semibold inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-colors ${isFav ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    {isFav ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>

              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-3">{t('aboutThisProperty')}</h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {property.description || 'No description provided.'}
                  </p>
                </div>
              )}

              {activeTab === 'contact' && (
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4">{t('contactOwner')}</h2>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                      {(property.owner || '?').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">{property.owner}</div>
                      <div className="text-sm text-slate-500">{property.ownerPhone || 'No phone'}</div>
                    </div>
                  </div>
                  {isAuthenticated ? (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <a
                        href={`tel:${ownerPhone}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <Phone className="w-4 h-4" /> {t('callOwner')}
                      </a>
                      <a
                        href={viberHref}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-3 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> {t('chatOnViber')}
                      </a>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                      <p className="text-slate-500 text-sm mb-4">{t('signInToContact')}</p>
                      <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg inline-flex transition-colors">
                        {t('signIn')}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">{t('listedBy')}</div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                  {(property.owner || '?').charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="font-semibold text-slate-800">{property.owner}</div>
                  <div className="text-xs text-slate-400">{t('verifiedAgent')}</div>
                  <div className="flex items-center gap-1 text-sm text-amber-500 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-semibold text-slate-700">4.9</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5 text-sm text-slate-600 mb-5">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400" /> {property.ownerPhone || 'N/A'}
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {property.location || 'N/A'}
                </div>
              </div>
              <a
                href={`tel:${ownerPhone}`}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" /> {t('scheduleViewing')}
              </a>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm">
              <div className="text-sm font-semibold text-blue-100 mb-1">{t('mortgageEstimate')}</div>
              <div className="text-xs text-blue-200 mb-4">{t('mortgageSubtitle')}</div>
              <div className="bg-white/15 rounded-xl px-4 py-3 flex items-baseline justify-between mb-3">
                <div className="text-xl font-bold">K {Math.round(property.price * 0.005).toLocaleString()}</div>
                <div className="text-xs text-blue-100">{t('perMonth')}</div>
              </div>
              <div className="text-xs text-blue-100">{t('estimateDisclaimer')}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="text-sm font-semibold text-slate-800 mb-4">{t('shareThisProperty')}</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 text-xs font-medium text-slate-600 transition-colors"
                >
                  <Copy className="w-4 h-4" /> {copied ? 'Copied!' : t('copyLink')}
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(window.location.href)}`}
                  className="flex flex-col items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 text-xs font-medium text-slate-600 transition-colors"
                >
                  <Mail className="w-4 h-4" /> {t('email')}
                </a>
                {isAuthenticated && (
                  <button
                    onClick={toggleFavorite}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-colors ${isFav ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} /> {t('save')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
