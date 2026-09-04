import React from 'react';
import EnvironmentNews from '../components/EnvironmentNews';
import '../dark-theme.css';

const News = () => {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, margin: '0 auto 14px',
        }}>🌍</div>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          Environment & Sustainability News
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 20px', fontSize: 14, lineHeight: 1.6, padding: '0 8px' }}>
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
  );
};

export default News;
