import { useState, type FormEvent } from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'contact@urbannest.com',
    hint: 'We reply within 24 hours.',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+95 9 777 000 111',
    hint: 'Mon–Fri, 9:00 AM – 6:00 PM.',
  },
  {
    icon: MessageCircle,
    label: 'Viber Us',
    value: '+95 9 777 000 111',
    hint: 'Fastest way to reach us.',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'Yangon, Myanmar',
    hint: 'By appointment only.',
  },
];

export function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const next: {
      name?: string;
      email?: string;
      message?: string;
    } = {};

    if (!form.name.trim()) {
      next.name = 'Please enter your name.';
    }

    if (!form.email.trim()) {
      next.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email address.';
    }

    if (!form.message.trim()) {
      next.message = 'Please enter your message.';
    }

    setErrors(next);

    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
  };

  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-modern-hero">
        <div className="contact-modern-hero-inner">
          <span className="contact-modern-kicker">
            CONTACT
          </span>

          <h1 className="contact-modern-title">
            Contact Us
          </h1>

          <p className="contact-modern-sub">
            We're here to help with questions about UrbanNest.
          </p>
        </div>
      </section>

      {/* CONTACT METHODS */}
      <section className="contact-modern-methods">
        {CONTACT_METHODS.map((method) => {
          const Icon = method.icon;

          return (
            <div
              className="contact-modern-method"
              key={method.label}
            >
              <div className="contact-modern-method-icon">
                <Icon />
              </div>

              <div>
                <span className="contact-modern-method-label">
                  {method.label}
                </span>

                <strong className="contact-modern-method-value">
                  {method.value}
                </strong>

                <p className="contact-modern-method-hint">
                  {method.hint}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* MAIN CONTENT */}
      <section className="contact-modern-main">

        {/* LEFT SIDE */}
        <div className="contact-modern-left">

          <div className="contact-modern-intro">
            <span>
              GET IN TOUCH
            </span>

            <h2>
              Reach out to us!
            </h2>

            <p>
              Have a question or need help? Send us a message and our
              team will get back to you as soon as possible.
            </p>
          </div>

          {submitted ? (
            <div className="contact-success">
              <CheckCircle2 />

              <h3>
                Message Sent!
              </h3>

              <p>
                Thank you, {form.name.trim()}. We've received your
                message and will reply within 24 hours.
                </p>
            </div>
          ) : (
            <form
              className="contact-modern-form"
              onSubmit={handleSubmit}
              noValidate
            >

              <div className="contact-modern-field">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleChange('name', e.target.value)
                  }
                  placeholder="Your name"
                />

                {errors.name && (
                  <span className="contact-field-error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="contact-modern-field">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    handleChange('email', e.target.value)
                  }
                  placeholder="you@example.com"
                />

                {errors.email && (
                  <span className="contact-field-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="contact-modern-field">
                <label>
                  Phone (optional)
                </label>

                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    handleChange('phone', e.target.value)
                  }
                  placeholder="+95 9 ..."
                />
              </div>

              <div className="contact-modern-field">
                <label>
                  Message
                </label>

                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    handleChange('message', e.target.value)
                  }
                  placeholder="How can we help?"
                />

                {errors.message && (
                  <span className="contact-field-error">
                    {errors.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="contact-modern-submit"
              >
                <Send />
                Send Message
              </button>

            </form>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="contact-modern-side">

          <div className="contact-modern-side-card">
            <div className="contact-modern-side-head">

              <div className="contact-modern-side-icon">
                <Clock />
              </div>

              <div>
                <span>
                  AVAILABLE
                </span>

                <h3>
                  Office Hours
                </h3>
              </div>

            </div>

            <ul className="contact-modern-hours">
              <li>
                <span>
                  Monday – Friday
                </span>

                <strong>
                  9:00 AM – 6:00 PM
                </strong>
              </li>

              <li>
                <span>
                  Saturday
                </span>

                <strong>
                  9:00 AM – 1:00 PM
                </strong>
              </li>

              <li>
                <span>
                  Sunday
                </span>

                <strong>
                  Closed
                </strong>
              </li>
            </ul>
          </div>

          <div className="contact-modern-side-card">
            <div className="contact-modern-side-head">

              <div className="contact-modern-side-icon">
                <MapPin />
              </div>

              <div>
                <span>
                  LOCATION
                </span>

                <h3>
                  Our Office
                </h3>
              </div>

            </div>

            <p className="contact-modern-office">
              UrbanNest Real Estate Co., Ltd.
              <br />
              Yangon, Myanmar
            </p>
          </div>

        </div>
      </section>

      {/* DARK NAVY FOOTER */}
      <footer className="contact-footer">

        <div className="contact-footer-inner">

          <div className="contact-footer-brand">
            <h2>
              UrbanNest
            </h2>

            <p>
              Making property discovery and real estate management
              simpler, faster and more organized.
            </p>

            <div className="contact-footer-contact">

              <span>
                <Mail />
                contact@urbannest.com
              </span>

              <span>
                <Phone />
                +95 9 777 000 111
              </span>

            </div>
          </div>

          <div className="contact-footer-column">
            <h3>
              UrbanNest
            </h3>

            <Link to="/">
              Home
            </Link>

            <Link to="/about">
              About Us
            </Link>

            <Link to="/contact">
              Contact Us
            </Link>
          </div>

          <div className="contact-footer-column">
            <h3>
              Property
            </h3>

            <Link to="/">
              Browse Properties
            </Link>

            <span>
              Property Search
            </span>

            <span>
              Property Listings
            </span>
          </div>

          <div className="contact-footer-column">
            <h3>
              Help &amp; Support
            </h3>

            <span>
              Frequently Asked Questions
            </span>

            <span>
              Buyer &amp; Renter Help
            </span>

            <span>
              Property Owner Help
            </span>
          </div>

        </div>

        <div className="contact-footer-bottom">
          <span>
            © 2026 UrbanNest. Academic Software Engineering Project.
          </span>

          <span>
            Yangon, Myanmar
          </span>
        </div>

      </footer>

    </div>
  );
}
              