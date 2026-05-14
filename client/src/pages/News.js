import React from 'react';
import EnvironmentNews from '../components/EnvironmentNews';
import '../dark-theme.css';

const News = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '32px 0' }}>
      <div className="dark-main" style={{ marginTop: 0, padding: 0 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, margin: '0 auto 16px',
            }}>🌍</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Environment & Sustainability News
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 24px', fontSize: 14, lineHeight: 1.6 }}>
              Stay informed about the latest developments in environmental protection, climate change, and sustainability efforts worldwide.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="dark-btn-primary"
              style={{ margin: '0 auto' }}
            >
              Refresh News
            </button>
          </div>
          <EnvironmentNews />
        </div>
      </div>
    </div>
  );
};

export default News;
