import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AppSidebar from './AppSidebar';
import { useAuth } from '../context/AuthContext';
import '../dark-theme.css';

// Pages that manage their own full-bleed layout (no outer sidebar/padding)
const FULL_BLEED_ROUTES = ['/welcome'];

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);
  const isChat = location.pathname === '/chat';

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
        {/* ── Shared sidebar — identical to Home page ── */}
        {isAuthenticated && (
          <div style={{
            position: 'fixed',
            left: 0,
            top: 64,
            height: 'calc(100vh - 64px)',
            width: 220,
            zIndex: 10,
            overflowY: 'auto',
          }}>
            <AppSidebar />
          </div>
        )}

        {/* ── Main content ── */}
        <main
          className="dark-main"
          style={{
            marginLeft: isAuthenticated ? 220 : 0,
            height: isChat ? 'calc(100vh - 64px)' : 'auto',
            overflow: isChat ? 'hidden' : 'visible',
            display: isChat ? 'flex' : 'block',
            flexDirection: isChat ? 'column' : 'initial'
          }}
        >
          <div style={{
            padding: isChat ? '0' : '32px',
            flex: 1,
            display: isChat ? 'flex' : 'block',
            flexDirection: isChat ? 'column' : 'initial',
            height: isChat ? '100%' : 'auto'
          }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
