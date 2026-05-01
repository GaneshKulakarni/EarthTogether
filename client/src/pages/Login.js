import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, RefreshCw } from 'lucide-react';
import './Auth.css';

/* ─────────────────────────────────────────────
   Inline SVG icons
───────────────────────────────────────────── */
const LeafIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const HexIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
  </svg>
);

const GoogleColorIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ─────────────────────────────────────────────
   Slide data — 3 slides cycling every 3s
───────────────────────────────────────────── */
const SLIDES = [
  {
    id: 0,
    image: '/images/forest-hero.png',
    badge: 'EST. 2024',
    quoteParts: ['"The best time to plant a tree was 20 years ago. The ', 'second best time', ' is now."'],
    cta: 'Join 12,000+ cultivators today.',
  },
  {
    id: 1,
    image: '/images/community-garden.jpg',
    badge: 'COMMUNITY',
    quoteParts: ['"', 'Grow together', ', feed the soul — Our Local Resilience Plan."'],
    cta: 'Growing sustainable communities worldwide.',
  },
  {
    id: 2,
    image: '/images/rainforest-river.png',
    badge: 'PLANET FIRST',
    quoteParts: ['"The Earth does not belong to us — we ', 'belong to the Earth', '."'],
    cta: 'Protecting 1M+ acres of wilderness together.',
  },
];

const INTERVAL_MS = 3000;
const ANIM_MS = 850;

/* ─────────────────────────────────────────────
   Image Carousel
───────────────────────────────────────────── */
const ImageCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState(null);
  const [busy, setBusy]       = useState(false);
  const [progKey, setProgKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const goTo = useCallback((next) => {
    if (busy || next === current) return;
    setBusy(true);
    setPrev(current);
    setCurrent(next);
    setProgKey(k => k + 1);
    setTimeout(() => { setPrev(null); setBusy(false); }, ANIM_MS);
  }, [busy, current]);

  // Auto-advance
  useEffect(() => {
    const t = setTimeout(() => goTo((current + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [current, goTo]);

  const slideClass = (idx) => {
    if (!mounted) return idx === 0 ? 'auth-slide slide-active' : 'auth-slide slide-next';
    if (idx === current) return 'auth-slide slide-enter';
    if (idx === prev)    return 'auth-slide slide-exit';
    return 'auth-slide slide-next';
  };

  return (
    <div className="auth-left-panel">
      {/* Green progress bar */}
      <div className="auth-slide-progress">
        <div key={progKey} className="auth-slide-progress-bar" />
      </div>

      {SLIDES.map((slide, idx) => (
        <div key={slide.id} className={slideClass(idx)}>
          <img src={slide.image} alt={`Eco scene ${idx + 1}`} className="auth-slide-image" />
          <div className="auth-slide-overlay" />
          <div className="auth-slide-content">
            <div className="auth-slide-text">
              <div className="auth-forest-est"><span>{slide.badge}</span></div>
              <p className="auth-forest-quote">
                {slide.quoteParts[0]}
                <span className="highlight">{slide.quoteParts[1]}</span>
                {slide.quoteParts[2]}
              </p>
              <div className="auth-forest-cta">
                <span className="auth-forest-cta-icon"><HexIcon /></span>
                <span>{slide.cta}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dot indicators */}
      <div className="auth-slide-dots">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`auth-slide-dot${idx === current ? ' dot-active' : ''}`}
            onClick={() => goTo(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Auth Page
───────────────────────────────────────────── */
const Login = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { login, register: registerUser, isAuthenticated } = useAuth();

  const initialTab = location.pathname === '/register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [animKey,   setAnimKey]   = useState(0);

  // Login state
  const [loginData,   setLoginData]   = useState({ email: '', password: '' });
  const [rememberDev, setRememberDev] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoad,   setLoginLoad]   = useState(false);

  // Register state
  const [regData,        setRegData]        = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showRegPw,      setShowRegPw]      = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regLoad,        setRegLoad]        = useState(false);

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  useEffect(() => {
    const tab = location.pathname === '/register' ? 'register' : 'login';
    setActiveTab(tab);
    setAnimKey(k => k + 1);
  }, [location.pathname]);

  const switchTab = (tab) =>
    navigate(tab === 'login' ? '/login' : '/register', { replace: true });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoad(true);
    const res = await login(loginData.email, loginData.password);
    setLoginLoad(false);
    if (res.success) { toast.success('Welcome back!'); setTimeout(() => navigate('/welcome'), 100); }
    else toast.error(res.error || 'Login failed');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) return toast.error('Passwords do not match');
    if (regData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setRegLoad(true);
    try {
      const res = await registerUser(regData.username, regData.email, regData.password);
      if (res.success) { toast.success('Welcome to EarthTogether!'); navigate('/welcome'); }
      else toast.error(res.error || 'Registration failed');
    } catch { toast.error('An error occurred. Please try again.'); }
    finally { setRegLoad(false); }
  };

  return (
    <div className="auth-page">
      {/* Navbar */}
      <nav className="auth-navbar">
        <Link to="/" className="auth-navbar-logo">
          <div className="auth-navbar-logo-icon"><LeafIcon /></div>
          <span className="auth-navbar-logo-name">
            <span className="earth">Earth</span>
            <span className="together">Together</span>
          </span>
        </Link>
        <a href="/help" className="auth-navbar-help" title="Help">?</a>
      </nav>

      <main className="auth-main">
        {/* Left — 3-slide carousel */}
        <ImageCarousel />

        {/* Right — Form panel */}
        <div className="auth-right-panel">
          {/* Tab toggle */}
          <div className="auth-tab-group">
            <button className={`auth-tab-btn${activeTab === 'login' ? ' active' : ''}`}
              onClick={() => switchTab('login')} type="button">Login</button>
            <button className={`auth-tab-btn${activeTab === 'register' ? ' active' : ''}`}
              onClick={() => switchTab('register')} type="button">Register</button>
          </div>

          {/* ── LOGIN ── */}
          {activeTab === 'login' && (
            <div key={`l-${animKey}`} className="auth-panel-enter" style={{ width: '100%', maxWidth: '360px' }}>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Welcome Back</h1>
                <p className="auth-form-subtitle">Continue your journey towards a greener future.</p>
              </div>
              <div className="auth-form-card">
                <form onSubmit={handleLogin}>
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Email Address</label>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><Mail size={15} /></span>
                      <input type="email" className="auth-input" placeholder="name@greenery.com"
                        value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})}
                        required autoComplete="email" />
                    </div>
                  </div>
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Password</label>
                      <a href="/forgot-password" className="auth-field-forgot">Forgot Password?</a>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><Lock size={15} /></span>
                      <input type={showLoginPw ? 'text' : 'password'} className="auth-input has-action"
                        placeholder="••••••••••••" value={loginData.password}
                        onChange={e => setLoginData({...loginData, password: e.target.value})}
                        required autoComplete="current-password" />
                      <button type="button" className="auth-input-action" onClick={() => setShowLoginPw(v => !v)} tabIndex={-1}>
                        {showLoginPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="auth-remember" onClick={() => setRememberDev(v => !v)}>
                    <button type="button" className={`auth-toggle${rememberDev ? ' on' : ''}`} aria-label="Remember this device">
                      <span className="auth-toggle-knob" />
                    </button>
                    <span className="auth-remember-label">Remember this device</span>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={loginLoad}>
                    <span className="auth-submit-btn-icon">{loginLoad ? <RefreshCw size={15} /> : <LeafIcon />}</span>
                    {loginLoad ? 'Signing in…' : 'Sign In to EarthTogether'}
                  </button>
                  <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or continue with</span>
                    <div className="auth-divider-line" />
                  </div>
                  <div className="auth-social-row">
                    <button type="button" className="auth-social-btn"><span className="auth-social-icon"><GoogleColorIcon /></span>Google</button>
                    <button type="button" className="auth-social-btn"><span className="auth-social-icon">🌐</span>EarthID</button>
                  </div>
                </form>
              </div>
              <div className="auth-page-footer">
                <p className="auth-footer-copy">© 2024 EarthTogether. Cultivating the digital greenhouse.</p>
                <div className="auth-footer-links">
                  <a href="/privacy" className="auth-footer-link">Privacy Policy</a>
                  <a href="/terms" className="auth-footer-link">Terms of Service</a>
                  <a href="/community" className="auth-footer-link">Community Guidelines</a>
                </div>
              </div>
            </div>
          )}

          {/* ── REGISTER ── */}
          {activeTab === 'register' && (
            <div key={`r-${animKey}`} className="auth-panel-enter" style={{ width: '100%', maxWidth: '360px' }}>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Join EarthTogether</h1>
                <p className="auth-form-subtitle">Start your journey towards a greener future.</p>
              </div>
              <div className="auth-form-card">
                <form onSubmit={handleRegister}>
                  <div className="auth-field-group">
                    <div className="auth-field-header"><label className="auth-field-label">Username</label></div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><User size={15} /></span>
                      <input type="text" className="auth-input" placeholder="green_cultivator"
                        value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})}
                        required autoComplete="username" />
                    </div>
                  </div>
                  <div className="auth-field-group">
                    <div className="auth-field-header"><label className="auth-field-label">Email Address</label></div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><Mail size={15} /></span>
                      <input type="email" className="auth-input" placeholder="name@greenery.com"
                        value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
                        required autoComplete="email" />
                    </div>
                  </div>
                  <div className="auth-field-group">
                    <div className="auth-field-header"><label className="auth-field-label">Password</label></div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><Lock size={15} /></span>
                      <input type={showRegPw ? 'text' : 'password'} className="auth-input has-action"
                        placeholder="Min. 6 characters" value={regData.password}
                        onChange={e => setRegData({...regData, password: e.target.value})}
                        required autoComplete="new-password" />
                      <button type="button" className="auth-input-action" onClick={() => setShowRegPw(v => !v)} tabIndex={-1}>
                        {showRegPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="auth-field-group">
                    <div className="auth-field-header"><label className="auth-field-label">Confirm Password</label></div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon"><Lock size={15} /></span>
                      <input type={showRegConfirm ? 'text' : 'password'} className="auth-input has-action"
                        placeholder="Repeat your password" value={regData.confirmPassword}
                        onChange={e => setRegData({...regData, confirmPassword: e.target.value})}
                        required autoComplete="new-password" />
                      <button type="button" className="auth-input-action" onClick={() => setShowRegConfirm(v => !v)} tabIndex={-1}>
                        {showRegConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={regLoad} style={{ marginTop: '4px' }}>
                    <span className="auth-submit-btn-icon">{regLoad ? <RefreshCw size={15} /> : <LeafIcon />}</span>
                    {regLoad ? 'Creating Account…' : 'Join EarthTogether'}
                  </button>
                  <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or continue with</span>
                    <div className="auth-divider-line" />
                  </div>
                  <div className="auth-social-row">
                    <button type="button" className="auth-social-btn"><span className="auth-social-icon"><GoogleColorIcon /></span>Google</button>
                    <button type="button" className="auth-social-btn"><span className="auth-social-icon">🌐</span>EarthID</button>
                  </div>
                </form>
              </div>
              <div className="auth-page-footer">
                <p className="auth-footer-copy">© 2024 EarthTogether. Cultivating the digital greenhouse.</p>
                <div className="auth-footer-links">
                  <a href="/privacy" className="auth-footer-link">Privacy Policy</a>
                  <a href="/terms" className="auth-footer-link">Terms of Service</a>
                  <a href="/community" className="auth-footer-link">Community Guidelines</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
