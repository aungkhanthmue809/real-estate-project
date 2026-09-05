import {
  Bell,
  Building2,
  CheckCircle2,
  Database,
  GraduationCap,
  Home as HomeIcon,
  KeyRound,
  Layers3,
  Map,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UrbanNestLogo } from '../components/UrbanNestLogo';

const CAPABILITIES = [
  {
    icon: Search,
    number: '01',
    title: 'Property Discovery',
    description: 'Browse approved listings for sale or rent and refine results by township, property type, bedrooms, and price.',
    details: ['Approved listings', 'URL-driven filters', 'MMK price display'],
  },
  {
    icon: Building2,
    number: '02',
    title: 'Property Listing',
    description: 'Owners can create and edit structured listings, upload a property image, and select an exact map location.',
    details: ['Guided listing form', 'Local image upload', 'Map coordinates'],
  },
  {
    icon: UserRound,
    number: '03',
    title: 'User Workspace',
    description: 'A personal workspace keeps owned properties, approval states, saved favorites, and notifications together.',
    details: ['Property management', 'Per-user favorites', 'Persisted notifications'],
  },
  {
    icon: ShieldCheck,
    number: '04',
    title: 'Admin Moderation',
    description: 'Administrators review submissions, approve or reject listings, manage fees, users, and contact messages.',
    details: ['Moderation workflow', 'Posting-fee settings', 'Contact inbox'],
  },
];

const PRINCIPLES = [
  { icon: Layers3, title: 'Structured information', text: 'Consistent property fields make listings easier to understand and compare.' },
  { icon: MapPin, title: 'Yangon focused', text: 'Township-aware discovery reflects the geographic scope currently supported.' },
  { icon: CheckCircle2, title: 'Visible moderation', text: 'Owners can follow whether a submission is pending, approved, or rejected.' },
  { icon: Map, title: 'Open map tools', text: 'Leaflet and OpenStreetMap provide interactive property location context.' },
  { icon: KeyRound, title: 'Role-based access', text: 'Public, owner, and administrator experiences respect their intended permissions.' },
  { icon: SlidersHorizontal, title: 'Responsive workflows', text: 'Discovery and management interfaces adapt across desktop and mobile screens.' },
];

const TECHNOLOGIES = [
  'React + TypeScript',
  'Spring Boot REST API',
  'PostgreSQL',
  'JWT authentication',
  'Flyway migrations',
  'Leaflet + OpenStreetMap',
];

export function AboutUs() {
  return (
    <div className="about-page about-showcase-page">
      <div className="about-showcase-ambient about-showcase-ambient-one" />
      <div className="about-showcase-ambient about-showcase-ambient-two" />
      <div className="about-showcase-ambient about-showcase-ambient-three" />

      <main className="about-showcase-main">
        <section className="about-showcase-hero">
          <div className="about-showcase-hero-copy">
            <span className="about-showcase-kicker"><i />About UrbanNest</span>
            <h1>A more thoughtful way to <em>discover property.</em></h1>
            <p>UrbanNest brings property discovery, listing management, moderation, and location tools into one streamlined full-stack platform centered on Yangon.</p>
            <div className="about-showcase-actions">
              <Link to="/" className="primary">Explore Properties</Link>
              <Link to="/contact" className="secondary">Contact Us</Link>
            </div>
          </div>

          <div className="about-showcase-hero-visual" aria-label="UrbanNest property workflow">
            <div className="about-showcase-visual-head">
              <span><HomeIcon /></span>
              <div><strong>One connected platform</strong><small>Yangon property workflow</small></div>
              <i>Live</i>
            </div>
            <div className="about-showcase-map-grid">
              <span className="about-showcase-map-road road-one" />
              <span className="about-showcase-map-road road-two" />
              <span className="about-showcase-map-road road-three" />
              <span className="about-showcase-map-pin"><MapPin /></span>
              <div className="about-showcase-map-label"><strong>Yangon</strong><small>Current city coverage</small></div>
            </div>
            <div className="about-showcase-flow">
              <div><span><Search /></span><strong>Discover</strong><small>Approved listings</small></div>
              <i />
              <div><span><Upload /></span><strong>List</strong><small>Owner submissions</small></div>
              <i />
              <div><span><ShieldCheck /></span><strong>Moderate</strong><small>Admin review</small></div>
            </div>
          </div>
        </section>

        <section className="about-showcase-story">
          <div className="about-showcase-story-statement">
            <span className="about-showcase-kicker"><i />The project story</span>
            <h2>Built to make property information clearer and easier to manage.</h2>
          </div>
          <div className="about-showcase-story-copy">
            <p>UrbanNest is a university full-stack real-estate application designed around the needs of public visitors, property owners, and administrators.</p>
            <p>Rather than claiming to replace real-world legal or financial processes, the platform focuses on the digital workflow it can support well: structured listings, focused discovery, owner controls, transparent moderation, and useful location context.</p>
            <div className="about-showcase-story-facts">
              <div><strong>1</strong><span>City currently covered</span></div>
              <div><strong>3</strong><span>Connected user experiences</span></div>
              <div><strong>Full-stack</strong><span>Academic implementation</span></div>
            </div>
          </div>
        </section>

        <section className="about-showcase-section">
          <div className="about-showcase-section-head">
            <div><span className="about-showcase-kicker"><i />Purpose and direction</span><h2>Mission &amp; vision</h2></div>
            <p>A practical foundation for organizing property discovery and listing workflows without overstating what the platform currently provides.</p>
          </div>
          <div className="about-showcase-mv-grid">
            <article>
              <span className="about-showcase-card-number">01 / Mission</span>
              <div className="about-showcase-card-icon"><MapPin /></div>
              <h3>Make local property discovery more coherent.</h3>
              <p>Give people a clear place to browse structured Yangon listings while giving owners practical tools to publish and manage their property information.</p>
            </article>
            <article>
              <span className="about-showcase-card-number">02 / Vision</span>
              <div className="about-showcase-card-icon"><Bell /></div>
              <h3>Keep every participant informed.</h3>
              <p>Develop a dependable workflow in which property details, moderation decisions, saved homes, and important updates remain accessible and understandable.</p>
            </article>
          </div>
        </section>

        <section className="about-showcase-section about-showcase-capabilities">
          <div className="about-showcase-section-head">
            <div><span className="about-showcase-kicker"><i />Platform scope</span><h2>What UrbanNest does</h2></div>
            <p>Four connected experiences built from functionality that exists in the application today.</p>
          </div>
          <div className="about-showcase-capability-grid">
            {CAPABILITIES.map((capability) => (
              <article key={capability.title}>
                <div className="about-showcase-capability-top"><span><capability.icon /></span><small>{capability.number}</small></div>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
                <ul>{capability.details.map((detail) => <li key={detail}><CheckCircle2 />{detail}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="about-showcase-principles">
          <div className="about-showcase-principles-intro">
            <span className="about-showcase-kicker"><i />Platform principles</span>
            <h2>Designed around clarity, context, and control.</h2>
            <p>The product choices reflect the current scope of a real academic implementation—not invented service claims.</p>
          </div>
          <div className="about-showcase-principle-grid">
            {PRINCIPLES.map((principle) => (
              <article key={principle.title}><span><principle.icon /></span><div><h3>{principle.title}</h3><p>{principle.text}</p></div></article>
            ))}
          </div>
        </section>

        <section className="about-showcase-academic">
          <div className="about-showcase-academic-mark"><GraduationCap /></div>
          <div className="about-showcase-academic-copy">
            <span className="about-showcase-kicker"><i />University project</span>
            <h2>A working full-stack software engineering project.</h2>
            <p>UrbanNest demonstrates frontend architecture, RESTful backend development, persistent relational data, authentication, authorization, database migrations, image handling, and interactive mapping in one integrated application.</p>
          </div>
          <div className="about-showcase-tech-list">
            {TECHNOLOGIES.map((technology) => <span key={technology}><Database />{technology}</span>)}
          </div>
        </section>

        <section className="about-showcase-cta">
          <div><span className="about-showcase-kicker"><i />Explore the platform</span><h2>Find your way around UrbanNest.</h2><p>Browse the current property catalog or get in touch through the working contact form.</p></div>
          <div><Link to="/" className="primary">Explore Properties</Link><Link to="/contact" className="secondary">Contact Us</Link></div>
        </section>
      </main>

      <footer className="home-footer about-showcase-footer">
        <div className="home-footer-inner">
          <div className="home-footer-top">
            <Link to="/" className="home-footer-brand"><UrbanNestLogo className="home-footer-logo" /><span>UrbanNest Real Estate</span></Link>
            <nav className="home-footer-nav" aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/dashboard">Dashboard</Link></nav>
          </div>
          <div className="home-footer-bottom"><p>© {new Date().getFullYear()} UrbanNest Real Estate. All rights reserved.</p><div className="home-footer-meta"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><span>Property discovery in Yangon, Myanmar.</span></div></div>
        </div>
      </footer>
    </div>
  );
}
