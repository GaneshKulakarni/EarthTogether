import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, Search, User, Bell, LogOut, Leaf,
  LayoutGrid, Award, BarChart2, MessageCircle,
  Newspaper, FlaskConical, Laugh, Trash2, Info, Brain
} from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import axios from 'axios';

/* Auth pages that should have a light navbar */
const LIGHT_ROUTES = ['/login', '/register', '/'];

const NAV_LINKS = [
  { label: 'Home', path: '/welcome' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Chat', path: '/chat' },
];

const MOBILE_NAV_SECTIONS = [
  {
    title: 'Explore',
    links: [
      { label: 'Home / Feed', path: '/welcome', icon: LayoutGrid },
      { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
      { label: 'Habits Tracker', path: '/habits', icon: Leaf },
      { label: 'Challenges', path: '/challenges', icon: Award },
      { label: 'Leaderboard', path: '/leaderboard', icon: BarChart2 },
      { label: 'Chat & Community', path: '/chat', icon: MessageCircle },
    ]
  },
  {
    title: 'Green Media & Tools',
    links: [
      { label: 'News Hub', path: '/news', icon: Newspaper },
      { label: 'Research Articles', path: '/researches', icon: FlaskConical },
      { label: 'Eco Memes', path: '/memes', icon: Laugh },
      { label: 'Quiz Games', path: '/quizzes', icon: Brain },
      { label: 'Waste Management', path: '/waste-management', icon: Trash2 },
    ]
  },
  {
    title: 'Account & Platform',
    links: [
      { label: 'My Profile', path: '/profile', icon: User },
      { label: 'About Us', path: '/about', icon: Info },
    ]
  }
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dark navbar on all authenticated pages; light only on public routes
  const isDark = !LIGHT_ROUTES.includes(location.pathname);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); setShowResults(false); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/users/search?q=${q}`, { headers: { 'x-auth-token': token } });
      setSearchResults(res.data);
      setShowResults(true);
    } catch (_) { }
  };

  const handleUserSelect = (uid) => {
    setSelectedUserId(uid); setShowUserProfile(true);
    setShowResults(false); setSearchQuery(''); setIsOpen(false);
  };

  /* ── Styles ── */
  const navStyle = isDark
    ? { background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }
    : { background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 20px rgba(0,0,0,0.08)', borderBottom: '1px solid #f0f0f0' };

  const textColor = isDark ? '#e6edf3' : '#374151';
  const mutedColor = isDark ? '#8b949e' : '#6b7280';
  const inputBg = isDark ? '#0f1923' : '#f3f4f6';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, ...navStyle }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', height: 64, gap: 12 }}>

          {/* ── Logo (EarthTogether Brand) ── */}
          <Link to="/welcome" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 4, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(34,197,94,0.3)', flexShrink: 0 }}>
              <Leaf size={18} color="#fff" fill="none" strokeWidth={2} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: textColor }}>Earth</span>
              <span style={{ color: '#22c55e' }}>Together</span>
            </span>
          </Link>

          {/* ── Search (Responsive: hidden on xs, flex on sm+) ── */}
          {isAuthenticated && (
            <div className="hidden sm:block" style={{ position: 'relative', marginLeft: 12, flex: 1, maxWidth: 280 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: mutedColor }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Search greenhouse…"
                style={{
                  paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 10,
                  color: isDark ? '#e6edf3' : '#111827', fontSize: 13, outline: 'none', width: '100%',
                  fontFamily: 'inherit', transition: 'all 0.2s ease', boxSizing: 'border-box'
                }}
              />
              {showResults && searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', marginTop: 8, left: 0, width: '100%', background: isDark ? '#1a2030' : '#fff', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.25)', border: `1px solid ${inputBorder}`, maxHeight: 300, overflowY: 'auto', zIndex: 100 }}>
                  {searchResults.map((u) => (
                    <div key={u._id} onClick={() => handleUserSelect(u._id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#1f2840' : '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {u.avatar ? <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} color="#fff" />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isDark ? '#e6edf3' : '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</p>
                        {u.bio && <p style={{ margin: 0, fontSize: 11, color: mutedColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Spacer ── */}
          <div style={{ flex: 1 }} />

          {/* ── Desktop nav links (visible on lg: >=1024px) ── */}
          {isAuthenticated && (
            <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 4 }}>
              {NAV_LINKS.map((l) => {
                const active = location.pathname === l.path;
                return (
                  <Link
                    key={l.path}
                    to={l.path}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: active ? 600 : 500,
                      textDecoration: 'none', transition: 'all 0.15s',
                      color: active ? '#34d399' : textColor,
                      borderBottom: active ? '2px solid #34d399' : '2px solid transparent',
                    }}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Bell + User ── */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                aria-label="Notifications"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8 }}
              >
                <Bell size={20} />
              </button>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: isDark ? '#1a2030' : '#f3f4f6', borderRadius: 50, cursor: 'pointer', border: `1px solid ${inputBorder}` }}
                onClick={() => navigate('/profile')}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#34d399,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                  {user?.avatar ? <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.username?.[0]?.toUpperCase() || 'U')}
                </div>
                <div className="hidden md:flex" style={{ flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e6edf3' : '#111', lineHeight: 1.2 }}>{user?.username || 'User'}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Eco-Guardian</span>
                </div>
              </div>

              {/* Mobile / Tablet Menu Button (shown on screens < 1024px) */}
              <button
                className="lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, padding: 6, display: 'flex', alignItems: 'center', borderRadius: 8 }}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}

          {/* Guest links */}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: '#34d399', border: '1px solid rgba(52,211,153,0.4)' }}>Log in</Link>
              <Link to="/register" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: '#34d399', color: '#0a2818' }}>Sign up</Link>
            </div>
          )}
        </div>

        {/* ── Mobile & Tablet Drawer / Menu ── */}
        {isAuthenticated && isOpen && (
          <div
            style={{
              background: isDark ? '#161b22' : '#fff',
              borderTop: `1px solid ${inputBorder}`,
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
              padding: '16px 20px 24px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
            }}
          >
            {/* Mobile Search input if on small screen */}
            <div className="block sm:hidden" style={{ marginBottom: 16, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: mutedColor }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search greenhouse…"
                style={{
                  paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                  background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 10,
                  color: isDark ? '#e6edf3' : '#111827', fontSize: 13, outline: 'none', width: '100%',
                  fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
              {showResults && searchResults.length > 0 && (
                <div style={{ marginTop: 8, background: isDark ? '#1a2030' : '#fff', borderRadius: 10, border: `1px solid ${inputBorder}`, maxHeight: 200, overflowY: 'auto' }}>
                  {searchResults.map((u) => (
                    <div key={u._id} onClick={() => handleUserSelect(u._id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {u.avatar ? <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={14} color="#fff" />}
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isDark ? '#e6edf3' : '#111' }}>{u.username}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Structured Sections */}
            {MOBILE_NAV_SECTIONS.map((section, sIdx) => (
              <div key={sIdx} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 8 }}>
                  {section.title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                  {section.links.map((l) => {
                    const active = location.pathname === l.path;
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.path}
                        to={l.path}
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          fontSize: 13,
                          fontWeight: active ? 600 : 500,
                          color: active ? '#34d399' : textColor,
                          textDecoration: 'none',
                          borderRadius: 10,
                          background: active ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.02)',
                          border: active ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent',
                          transition: 'all 0.15s'
                        }}
                      >
                        <Icon size={16} color={active ? '#34d399' : mutedColor} />
                        <span>{l.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${inputBorder}`, paddingTop: 12, marginTop: 12 }}>
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <UserProfileModal userId={selectedUserId} isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
    </>
  );
};

export default Navbar;
