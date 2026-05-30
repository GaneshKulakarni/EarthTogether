import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  Trash2,
  BarChart2,
  Award,
  ChevronDown,
  ChevronRight,
  Newspaper,
  Laugh,
  FlaskConical,
  Users,
  LogOut,
  Info,
} from 'lucide-react';
import '../pages/Home.css';

/* ─── Links config (matches Home.js exactly) ─── */
const SIDEBAR_LINKS = [
  { name: 'Waste Management', path: '/waste-management', icon: <Trash2   size={18} /> },
  { name: 'Leaderboard',      path: '/leaderboard',     icon: <BarChart2 size={18} /> },
  { name: 'Challenges',       path: '/challenges',      icon: <Award     size={18} /> },
];

const GREEN_MEDIA_LINKS = [
  { name: 'News',     path: '/news',       icon: <Newspaper    size={16} /> },
  { name: 'Research', path: '/researches', icon: <FlaskConical size={16} /> },
  { name: 'Memes',    path: '/memes',      icon: <Laugh        size={16} /> },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  // Always open by default so every page matches the Home page sidebar
  const [greenMediaOpen, setGreenMediaOpen] = useState(true);

  return (
    <aside className="home-sidebar">
      <nav className="sidebar-nav" style={{ marginTop: 8 }}>

        {/* ── Green Media Dropdown ── */}
        <button
          className={`sidebar-link sidebar-dropdown-trigger ${greenMediaOpen ? 'active' : ''}`}
          onClick={() => setGreenMediaOpen((o) => !o)}
        >
          <LayoutGrid size={18} />
          <span style={{ flex: 1 }}>Green Media</span>
          {greenMediaOpen
            ? <ChevronDown  size={15} style={{ marginLeft: 'auto' }} />
            : <ChevronRight size={15} style={{ marginLeft: 'auto' }} />}
        </button>

        {/* Sub-links */}
        {greenMediaOpen && (
          <div className="sidebar-sub-links">
            {GREEN_MEDIA_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link sidebar-sub-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* Main nav links */}
        {SIDEBAR_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <Link
          to="/about"
          className={`sidebar-link ${location.pathname === '/about' ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <Info size={18} />
          About Us
        </Link>
        <button
          className="sidebar-link"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
        >
          <Users size={18} />
          Support
        </button>
        <button
          className="sidebar-link"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: '#f87171' }}
          onClick={() => { logout(); navigate('/'); }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
