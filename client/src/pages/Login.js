import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, RefreshCw } from 'lucide-react';
import './Auth.css';

/* ─────────────────────────────────────────────
   Inline SVG icons that match the design
───────────────────────────────────────────── */
const LeafIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const HexIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
    <path d="M2 8.5l10 6.5 10-6.5"/>
  </svg>
);

const GoogleColorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ─────────────────────────────────────────────
   Main Auth Component
───────────────────────────────────────────── */
const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register: registerUser, isAuthenticated } = useAuth();

  // Determine initial tab from URL
  const initialTab = location.pathname === '/register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [animKey, setAnimKey] = useState(0);

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  // Sync tab to URL
  useEffect(() => {
    const tab = location.pathname === '/register' ? 'register' : 'login';
    setActiveTab(tab);
    setAnimKey(k => k + 1);
  }, [location.pathname]);

  const switchTab = (tab) => {
    navigate(tab === 'login' ? '/login' : '/register', { replace: true });
  };

  /* ── Login submit ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const result = await login(loginData.email, loginData.password);
    setLoginLoading(false);
    if (result.success) {
      toast.success('Welcome back!');
      setTimeout(() => navigate('/welcome'), 100);
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  /* ── Register submit ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setRegisterLoading(true);
    try {
      const result = await registerUser(
        registerData.username,
        registerData.email,
        registerData.password
      );
      if (result.success) {
        toast.success('Welcome to EarthTogether!');
        navigate('/welcome');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Navbar ── */}
      <nav className="auth-navbar">
        <Link to="/" className="auth-navbar-logo">
          <div className="auth-navbar-logo-icon">
            <LeafIcon />
          </div>
          <span className="auth-navbar-logo-name">
            <span className="earth">Earth</span>
            <span className="together">Together</span>
          </span>
        </Link>
        <a href="/help" className="auth-navbar-help" title="Help">?</a>
      </nav>

      {/* ── Main Split ── */}
      <main className="auth-main">

        {/* ── Left — Forest Panel ── */}
        <div className="auth-left-panel">
          <img
            src="/images/forest-hero.png"
            alt="Lush forest — the world we're protecting"
            className="auth-forest-image"
          />
          <div className="auth-forest-overlay" />
          <div className="auth-forest-content">
            <div className="auth-forest-est">
              <span>EST. 2024</span>
            </div>
            <p className="auth-forest-quote">
              "The best time to plant a tree was 20 years ago. The{' '}
              <span className="highlight">second best time</span> is now."
            </p>
            <div className="auth-forest-cta">
              <span className="auth-forest-cta-icon"><HexIcon /></span>
              <span>Join 12,000+ cultivators today.</span>
            </div>
          </div>
        </div>

        {/* ── Right — Form Panel ── */}
        <div className="auth-right-panel">
          {/* Tab toggle */}
          <div className="auth-tab-group">
            <button
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
              type="button"
            >
              Login
            </button>
            <button
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => switchTab('register')}
              type="button"
            >
              Register
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {activeTab === 'login' && (
            <div key={`login-${animKey}`} className="auth-panel-enter" style={{ width: '100%', maxWidth: '380px' }}>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Welcome Back</h1>
                <p className="auth-form-subtitle">Continue your journey towards a greener future.</p>
              </div>

              <div className="auth-form-card">
                <form onSubmit={handleLogin}>
                  {/* Email */}
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Email Address</label>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="name@greenery.com"
                        value={loginData.email}
                        onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Password</label>
                      <a href="/forgot-password" className="auth-field-forgot">Forgot Password?</a>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showLoginPw ? 'text' : 'password'}
                        className="auth-input has-action"
                        placeholder="••••••••••••"
                        value={loginData.password}
                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="auth-input-action"
                        onClick={() => setShowLoginPw(v => !v)}
                        tabIndex={-1}
                      >
                        {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember toggle */}
                  <div
                    className="auth-remember"
                    onClick={() => setRememberDevice(v => !v)}
                  >
                    <button
                      type="button"
                      className={`auth-toggle ${rememberDevice ? 'on' : ''}`}
                      aria-label="Remember this device"
                    >
                      <span className="auth-toggle-knob" />
                    </button>
                    <span className="auth-remember-label">Remember this device</span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loginLoading}
                  >
                    <span className="auth-submit-btn-icon">
                      {loginLoading ? <RefreshCw size={16} className="animate-spin" /> : <LeafIcon />}
                    </span>
                    {loginLoading ? 'Signing in…' : 'Sign In to EarthTogether'}
                  </button>

                  {/* Social divider */}
                  <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or continue with</span>
                    <div className="auth-divider-line" />
                  </div>

                  {/* Social buttons */}
                  <div className="auth-social-row">
                    <button type="button" className="auth-social-btn">
                      <span className="auth-social-icon"><GoogleColorIcon /></span>
                      Google
                    </button>
                    <button type="button" className="auth-social-btn">
                      <span className="auth-social-icon">🌐</span>
                      EarthID
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer */}
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

          {/* ── REGISTER FORM ── */}
          {activeTab === 'register' && (
            <div key={`register-${animKey}`} className="auth-panel-enter" style={{ width: '100%', maxWidth: '380px' }}>
              <div className="auth-form-header">
                <h1 className="auth-form-title">Join EarthTogether</h1>
                <p className="auth-form-subtitle">Start your journey towards a greener future.</p>
              </div>

              <div className="auth-form-card">
                <form onSubmit={handleRegister}>
                  {/* Username */}
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Username</label>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="green_cultivator"
                        value={registerData.username}
                        onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Email Address</label>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="name@greenery.com"
                        value={registerData.email}
                        onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Password</label>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        className="auth-input has-action"
                        placeholder="Min. 6 characters"
                        value={registerData.password}
                        onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="auth-input-action"
                        onClick={() => setShowRegPw(v => !v)}
                        tabIndex={-1}
                      >
                        {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="auth-field-group">
                    <div className="auth-field-header">
                      <label className="auth-field-label">Confirm Password</label>
                    </div>
                    <div className="auth-input-wrapper">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showRegConfirm ? 'text' : 'password'}
                        className="auth-input has-action"
                        placeholder="Repeat your password"
                        value={registerData.confirmPassword}
                        onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="auth-input-action"
                        onClick={() => setShowRegConfirm(v => !v)}
                        tabIndex={-1}
                      >
                        {showRegConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={registerLoading}
                    style={{ marginTop: '8px' }}
                  >
                    <span className="auth-submit-btn-icon">
                      {registerLoading ? <RefreshCw size={16} className="animate-spin" /> : <LeafIcon />}
                    </span>
                    {registerLoading ? 'Creating Account…' : 'Join EarthTogether'}
                  </button>

                  {/* Social divider */}
                  <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">or continue with</span>
                    <div className="auth-divider-line" />
                  </div>

                  {/* Social buttons */}
                  <div className="auth-social-row">
                    <button type="button" className="auth-social-btn">
                      <span className="auth-social-icon"><GoogleColorIcon /></span>
                      Google
                    </button>
                    <button type="button" className="auth-social-btn">
                      <span className="auth-social-icon">🌐</span>
                      EarthID
                    </button>
                  </div>
                </form>
              </div>

              {/* Footer */}
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
