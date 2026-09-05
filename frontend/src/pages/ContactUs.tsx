import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Home, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { UrbanNestLogo } from '../components/UrbanNestLogo';
import { contactMessageAPI } from '../utils/api';

const CONTACT_METHODS = [
  { icon: Mail, label: 'Email Us', value: 'contact@urbannest.com', hint: 'Send us your questions.' },
  { icon: Phone, label: 'Call Us', value: '+95 9 777 000 111', hint: 'Mon–Fri, 9:00 AM – 6:00 PM.' },
  { icon: MessageCircle, label: 'Viber Us', value: '+95 9 777 000 111', hint: 'Fastest way to reach us.' },
  { icon: MapPin, label: 'Visit Us', value: 'Yangon, Myanmar', hint: 'By appointment only.' },
];

export function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { name?: string; email?: string; message?: string } = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!form.email.trim()) next.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email address.';
    if (!form.message.trim()) next.message = 'Please enter your message.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await contactMessageAPI.create({
        fullName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, message: form.message.trim(),
      });
      setSubmitted(true);
    } catch {
      setSubmitError('We could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page contact-showcase-page">
      <div className="contact-ambient contact-ambient-one" />
      <div className="contact-ambient contact-ambient-two" />
      <div className="contact-ambient contact-ambient-three" />
      <div className="contact-container">
        <nav className="contact-breadcrumb" aria-label="Breadcrumb">
          <Link to="/"><Home /> Home</Link><ArrowRight /><strong>Contact</strong>
        </nav>
        <section className="contact-hero">
          <span className="contact-hero-badge"><i />Get in touch</span>
          <h1 className="contact-hero-title">Speak With UrbanNest</h1>
          <p className="contact-hero-sub">Questions about a listing, managing your properties, or the platform itself? Send our team a message.</p>
        </section>

        <section className="contact-main">
          <div className="contact-form-card">
            <div className="contact-form-heading">
              <span><Send /></span>
              <div><h2 className="contact-form-title">Send Us a Message</h2><p className="contact-form-sub">Fill out the form and our team will review your message.</p></div>
            </div>
            {submitted ? (
              <div className="contact-success"><CheckCircle2 /><h3>Message Sent!</h3><p>We've received your message.</p></div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form-grid">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Full Name</label>
                    <input id="contact-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Your name" aria-invalid={Boolean(errors.name)} />
                    {errors.name && <span className="contact-field-error">{errors.name}</span>}
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-email">Email Address</label>
                    <input id="contact-email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
                    {errors.email && <span className="contact-field-error">{errors.email}</span>}
                  </div>
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-phone">Phone <span>Optional</span></label>
                  <input id="contact-phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+95 9 ..." />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" rows={5} value={form.message} onChange={(e) => handleChange('message', e.target.value)} placeholder="How can we help?" aria-invalid={Boolean(errors.message)} />
                  {errors.message && <span className="contact-field-error">{errors.message}</span>}
                </div>
                {submitError && <div className="contact-submit-error" role="alert">{submitError}</div>}
                <button type="submit" className="contact-submit-btn" disabled={submitting}><Send /> {submitting ? 'Sending...' : 'Send Us a Message'}</button>
              </form>
            )}
          </div>

          <aside className="contact-side">
            <div className="contact-side-card contact-details-card">
              <span className="contact-side-kicker">Contact details</span><h2>UrbanNest Team</h2>
              <div className="contact-details-list">
                {CONTACT_METHODS.map((method) => (
                  <div className="contact-detail" key={method.label}>
                    <span className="contact-side-icon"><method.icon /></span>
                    <div><small>{method.label}</small><strong>{method.value}</strong><p>{method.hint}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-side-card contact-hours-card">
              <div className="contact-hours-heading"><span className="contact-side-icon"><Clock /></span><h3>Office Hours</h3></div>
              <ul className="contact-hours">
                <li><span>Monday – Friday</span><span>9:00 AM – 6:00 PM</span></li><li><span>Saturday</span><span>9:00 AM – 1:00 PM</span></li><li><span>Sunday</span><span>Closed</span></li>
              </ul>
            </div>
          </aside>
        </section>
      </div>

      <footer className="contact-footer">
        <div className="contact-footer-top">
          <Link to="/" className="contact-footer-brand"><UrbanNestLogo className="contact-footer-logo" />UrbanNest Real Estate</Link>
          <nav aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></nav>
        </div>
        <div className="contact-footer-bottom">
          <span>© {new Date().getFullYear()} UrbanNest. All rights reserved.</span>
          <nav aria-label="Legal navigation"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></nav>
        </div>
      </footer>
    </div>
  );
}
