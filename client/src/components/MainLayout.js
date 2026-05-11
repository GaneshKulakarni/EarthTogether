import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import '../dark-theme.css';

// Pages that manage their own full-bleed layout (no outer sidebar/padding)
const FULL_BLEED_ROUTES = ['/welcome'];

const SIDEBAR_LINKS = [
  { name: 'News',              path: '/news',             emoji: '📰' },
  { name: 'Research',          path: '/researches',       emoji: '🔬' },
  { name: 'Quiz & Flashcards', path: '/quizzes',          emoji: '🧠' },
  { name: 'Waste Management',  path: '/waste-management', emoji: '♻️' },
  { name: 'Memes',             path: '/memes',            emoji: '😄' },
  { name: 'Leaderboard',       path: '/leaderboard',      emoji: '🏆' },
];

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);

  const links = [...SIDEBAR_LINKS];
  if (user?.role === 'admin') links.push({ name: 'Admin Panel', path: '/admin', emoji: '⚙️' });

  if (isFullBleed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0d1117' }}>
        <Navbar />
        <div style={{ marginTop: 64, flex: 1 }}>
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="dark-layout">
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── Dark Sidebar ── */}
        {isAuthenticated && (
          <aside className="dark-sidebar">
            <p className="dark-sidebar-section-title">Explore</p>
            <nav style={{ flex: 1 }}>
              {links.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`dark-sidebar-link${active ? ' active' : ''}`}
                  >
                    <span style={{ fontSize: 15 }}>{link.emoji}</span>
                    <span className="dark-sidebar-dot" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom accent */}
            <div style={{
              margin: '16px 12px 0',
              padding: '14px',
              borderRadius: 12,
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.18)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>🌿 Eco Tip</p>
              <p style={{ fontSize: 11, color: '#8b949e', lineHeight: 1.5 }}>
                Every small action counts — keep building your streak!
              </p>
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <main
          className="dark-main"
          style={{ marginLeft: isAuthenticated ? 240 : 0 }}
        >
          <div style={{ padding: '32px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
