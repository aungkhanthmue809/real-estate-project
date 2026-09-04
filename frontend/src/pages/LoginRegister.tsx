import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Home, Lock, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertiesContext';

function AuthStats({ approvedListingCount }: { approvedListingCount: number }) {
  return (
    <div className="auth-stats-grid" aria-label="UrbanNest statistics">
      <div className="auth-stat-box">
        <div className="auth-stat-value">{approvedListingCount}</div>
        <div className="auth-stat-label">Listings</div>
      </div>
      <div className="auth-stat-box">
        <div className="auth-stat-value">1</div>
        <div className="auth-stat-label">City Covered</div>
      </div>
      <div className="auth-stat-box">
        <div className="auth-stat-value">0</div>
        <div className="auth-stat-label">Happy Buyers</div>
      </div>
    </div>
  );
}

export function LoginRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { properties } = useProperties();

  const isLogin = location.pathname === '/login';
  const approvedListingCount = properties.filter(
    (property) => property.approvalStatus === 'APPROVED',
  ).length;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signinForm, setSigninForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(signinForm.username, signinForm.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }
    setLoading(true);
    try {
      await register(signupForm.username, signupForm.email, signupForm.password, signupForm.phone);
      navigate('/dashboard');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page auth-showcase-page ${isLogin ? 'is-login' : 'is-register'}`}>
      <div className="auth-ambient" aria-hidden="true"><span /><span /><span /></div>

      <main className="auth-shell">
        <section className="auth-story-panel">
          <div className="auth-story-grid" aria-hidden="true" />
          <div className="auth-story-content">
            <Link to="/" className="auth-story-brand" aria-label="UrbanNest home">
              <span><Home /></span>
              <strong>UrbanNest</strong>
            </Link>

            <div className="auth-story-copy">
              <p className="auth-kicker"><ShieldCheck /> Your property journey, secured</p>
              <h1>{isLogin ? 'Welcome back to a better way home.' : 'Your next chapter starts at home.'}</h1>
              <p>
                {isLogin
                  ? 'Sign in to manage your properties, favorites, and account activity in one considered space.'
                  : 'Create your UrbanNest account to save homes and manage property listings across Yangon.'}
              </p>
            </div>

            <AuthStats approvedListingCount={approvedListingCount} />
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-form-heading">
              <span className="auth-form-mark"><Home /></span>
              <p className="auth-form-eyebrow">{isLogin ? 'Member access' : 'Join UrbanNest'}</p>
              <h2>{isLogin ? 'Sign in to UrbanNest' : 'Create your account'}</h2>
              <p>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <Link to={isLogin ? '/register' : '/login'}>
                  {isLogin ? 'Create one free' : 'Sign in'} <ArrowRight />
                </Link>
              </p>
            </div>

            <div className="auth-divider"><span>{isLogin ? 'Secure account access' : 'Account details'}</span></div>
            {error && <div className="auth-error" role="alert">{error}</div>}

            {isLogin ? (
              <form onSubmit={handleSignIn} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="login-username">Username</label>
                  <div className="auth-field-row">
                    <Mail aria-hidden="true" />
                    <input id="login-username" type="text" placeholder="Enter your username" value={signinForm.username} onChange={(event) => setSigninForm({ ...signinForm, username: event.target.value })} required />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="auth-field-row">
                    <Lock aria-hidden="true" />
                    <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={signinForm.password} onChange={(event) => setSigninForm({ ...signinForm, password: event.target.value })} required />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-loading" aria-label="Signing in" /> : <>Sign In <ArrowRight aria-hidden="true" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="auth-form auth-register-form">
                <div className="auth-register-fields">
                  <div className="auth-field">
                    <label htmlFor="register-username">Username</label>
                    <div className="auth-field-row"><UserRound aria-hidden="true" /><input id="register-username" type="text" placeholder="Enter username" value={signupForm.username} onChange={(event) => setSignupForm({ ...signupForm, username: event.target.value })} required /></div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="register-email">Email address</label>
                    <div className="auth-field-row"><Mail aria-hidden="true" /><input id="register-email" type="email" placeholder="alex@example.com" value={signupForm.email} onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })} required /></div>
                  </div>

                  <div className="auth-field auth-field-wide">
                    <label htmlFor="register-phone">Phone</label>
                    <div className="auth-field-row"><Phone aria-hidden="true" /><input id="register-phone" type="tel" placeholder="09-XXXXXXXXX" value={signupForm.phone} onChange={(event) => setSignupForm({ ...signupForm, phone: event.target.value })} required /></div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="register-password">Password</label>
                    <div className="auth-field-row">
                      <Lock aria-hidden="true" />
                      <input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={signupForm.password} onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })} minLength={8} required />
                      <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}>
                        {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="register-confirm-password">Confirm password</label>
                    <div className="auth-field-row"><Lock aria-hidden="true" /><input id="register-confirm-password" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={signupForm.confirmPassword} onChange={(event) => setSignupForm({ ...signupForm, confirmPassword: event.target.value })} required /></div>
                  </div>
                </div>

                <div className="auth-terms-check">
                  <input type="checkbox" id="agree" checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} />
                  <label htmlFor="agree">I agree to UrbanNest's <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</label>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="auth-loading" aria-label="Creating account" /> : <>Create Account <ArrowRight aria-hidden="true" /></>}
                </button>
              </form>
            )}

            {isLogin && <p className="auth-terms">By signing in, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
