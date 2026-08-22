import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const CATEGORIES = [
  { key: 'all', labelKey: 'faqCatAll' },
  { key: 'general', labelKey: 'faqCatGeneral' },
  { key: 'listing', labelKey: 'faqCatListing' },
  { key: 'buying', labelKey: 'faqCatBuying' },
  { key: 'selling', labelKey: 'faqCatSelling' },
  { key: 'account', labelKey: 'faqCatAccount' },
  { key: 'technical', labelKey: 'faqCatTechnical' },
];

const FAQS = [
  { qKey: 'faq7Q', aKey: 'faq7A', cat: 'general' },
  { qKey: 'faq8Q', aKey: 'faq8A', cat: 'general' },
  { qKey: 'faq1Q', aKey: 'faq1A', cat: 'listing' },
  { qKey: 'faq2Q', aKey: 'faq2A', cat: 'listing' },
  { qKey: 'faq9Q', aKey: 'faq9A', cat: 'listing' },
  { qKey: 'faq10Q', aKey: 'faq10A', cat: 'buying' },
  { qKey: 'faq3Q', aKey: 'faq3A', cat: 'buying' },
  { qKey: 'faq4Q', aKey: 'faq4A', cat: 'buying' },
  { qKey: 'faq5Q', aKey: 'faq5A', cat: 'selling' },
  { qKey: 'faq11Q', aKey: 'faq11A', cat: 'account' },
  { qKey: 'faq12Q', aKey: 'faq12A', cat: 'account' },
  { qKey: 'faq13Q', aKey: 'faq13A', cat: 'account' },
  { qKey: 'faq14Q', aKey: 'faq14A', cat: 'account' },
  { qKey: 'faq6Q', aKey: 'faq6A', cat: 'technical' },
];

export function Faq() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCat, setActiveCat] = useState('all');

  const filtered = activeCat === 'all' ? FAQS : FAQS.filter((f) => f.cat === activeCat);

  return (
    <div className="about-page">
      <div className="how-container">
        <section className="faq-hero-new">
  <div className="faq-hero-glow faq-hero-glow-one"></div>
  <div className="faq-hero-glow faq-hero-glow-two"></div>

  <div className="faq-hero-content">
    <div className="faq-hero-badge">
      <HelpCircle size={17} />
      <span>FAQ</span>
    </div>

    <h1 className="faq-hero-title">
      {t('faqTitle')}
    </h1>

    <p className="faq-hero-sub">
      {t('faqSub')}
    </p>

    <div className="faq-hero-line">
      <span></span>
      <div className="faq-hero-dot"></div>
      <span></span>
    </div>
  </div>
</section>

        <section className="faq-cats">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`faq-cat-btn ${activeCat === cat.key ? 'active' : ''}`}
              onClick={() => { setActiveCat(cat.key); setOpenFaq(null); }}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </section>

        <section className="faq-content">
          {filtered.length === 0 ? (
            <div className="faq-empty"><HelpCircle /> No questions in this category.</div>
          ) : (
            <div className="faq-grid">
              {filtered.map((faq) => {
                const globalIndex = FAQS.indexOf(faq);
                const isOpen = openFaq === globalIndex;
                return (
                  <div className={`faq-card ${isOpen ? 'open' : ''}`} key={faq.qKey}>
                    <button
                      type="button"
                      className="faq-card-btn"
                      onClick={() => setOpenFaq(isOpen ? null : globalIndex)}
                      aria-expanded={isOpen}
                    >
                      <span className="faq-card-q">{t(faq.qKey)}</span>
                      <span className={`faq-card-icon ${isOpen ? 'open' : ''}`}>
                        <ChevronDown />
                      </span>
                    </button>
                    {isOpen && <div className="faq-card-a">{t(faq.aKey)}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="faq-cta">
          <div className="faq-cta-icon"><MessageCircle /></div>
          <h3 className="faq-cta-title">{t('faqCtaTitle')}</h3>
          <p className="faq-cta-sub">{t('faqCtaSub')}</p>
          <Link to="/contact" className="faq-cta-btn">{t('faqCtaBtn')}</Link>
        </section>
      </div>
    </div>
  );
}
