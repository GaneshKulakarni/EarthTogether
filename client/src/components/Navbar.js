import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Search, User, Bell, LogOut } from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import axios from 'axios';

/* Pages that use the dark navbar style */
const DARK_ROUTES = ['/welcome'];

const NAV_LINKS = [
  { label: 'Home',       path: '/welcome' },
  { label: 'Dashboard',  path: '/dashboard' },
  { label: 'Charts',     path: '/leaderboard' },
  { label: 'Profile',    path: '/profile' },
  { label: 'Challenges', path: '/challenges' },
];

const Navbar = () => {
  const [isOpen, setIsOpen]             = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults]   = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId]   = useState(null);

  const { isAuthenticated, logout, user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isDark = DARK_ROUTES.includes(location.pathname);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); setShowResults(false); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/users/search?q=${q}`, { headers: { 'x-auth-token': token } });
      setSearchResults(res.data);
      setShowResults(true);
    } catch (_) {}
  };

  const handleUserSelect = (uid) => {
    setSelectedUserId(uid); setShowUserProfile(true);
    setShowResults(false); setSearchQuery('');
  };

  /* ── Styles ── */
  const navStyle = isDark
    ? { background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }
    : { background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 20px rgba(0,0,0,0.08)', borderBottom: '1px solid #f0f0f0' };

  const textColor  = isDark ? '#e6edf3' : '#374151';
  const mutedColor = isDark ? '#8b949e' : '#6b7280';
  const inputBg    = isDark ? '#0f1923'  : '#f3f4f6';
  const inputBorder= isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, ...navStyle }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 64, gap: 16 }}>

          {/* ── Logo (EarthTogether Brand) ── */}
          <Link to="/welcome" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 8, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#34d399,#059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 14px rgba(52,211,153,0.4)' }}>
              🌿
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: textColor, letterSpacing: '0.01em' }}>EarthTogether</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Verdant Collective</span>
            </div>
          </Link>

          {/* ── Centered Search ── */}
          {isAuthenticated && (
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: mutedColor }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder="Search the greenhouse…"
                  style={{
                    paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                    background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 10,
                    color: isDark ? '#e6edf3' : '#111827', fontSize: 13, outline: 'none', width: 320,
                    fontFamily: 'inherit', transition: 'all 0.2s ease',
                  }}
                />
                {showResults && searchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', marginTop: 8, left: '50%', transform: 'translateX(-50%)', width: 320, background: isDark ? '#1a2030' : '#fff', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.25)', border: `1px solid ${inputBorder}`, maxHeight: 300, overflowY: 'auto', zIndex: 100 }}>
                    {searchResults.map((u) => (
                      <div key={u._id} onClick={() => handleUserSelect(u._id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#1f2840' : '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {u.avatar ? <img src={u.avatar} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} color="#fff" />}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isDark ? '#e6edf3' : '#111' }}>{u.username}</p>
                          {u.bio && <p style={{ margin: 0, fontSize: 11, color: mutedColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{u.bio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Spacer ── */}
          <div style={{ flex: 1 }} />

          {/* ── Desktop nav links ── */}
          {isAuthenticated && (
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: 4 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8 }}>
                <Bell size={20} />
              </button>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: isDark ? '#1a2030' : '#f3f4f6', borderRadius: 50, cursor: 'pointer', border: `1px solid ${inputBorder}` }}
                onClick={() => navigate('/profile')}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#34d399,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden' }}>
                  {user?.avatar ? <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.username?.[0]?.toUpperCase() || 'U')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e6edf3' : '#111', lineHeight: 1.2 }}>{user?.username || 'User'}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Eco-Guardian</span>
                </div>
              </div>

              {/* Mobile hamburger */}
              <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, padding: 4 }}>
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          )}

          {/* Guest links */}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', color: '#34d399', border: '1px solid rgba(52,211,153,0.4)' }}>Log in</Link>
              <Link to="/register" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: '#34d399', color: '#0a2818' }}>Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isAuthenticated && isOpen && (
          <div style={{ background: isDark ? '#161b22' : '#fff', borderTop: `1px solid ${inputBorder}`, padding: '10px 16px' }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.path} to={l.path} onClick={() => setIsOpen(false)}
                style={{ display: 'block', padding: '10px 8px', fontSize: 14, fontWeight: 500, color: textColor, textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
            <button onClick={() => { handleLogout(); setIsOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 8px', fontSize: 14, fontWeight: 500, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </nav>

      <UserProfileModal userId={selectedUserId} isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
    </>
  );
};

export default Navbar;
