import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy } from 'lucide-react';
import '../dark-theme.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ecoPoints');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
        const res = await axios.get(`/api/users/leaderboard?sortBy=${activeTab}`, config);
        setLeaderboard(res.data);
        setLoading(false);
      } catch (_) {
        setLeaderboard([
          { _id: '1', username: 'EcoWarrior',  ecoPoints: 1250, currentStreak: 45, totalCarbonSaved: 125 },
          { _id: '2', username: 'GreenThumb',  ecoPoints: 980,  currentStreak: 32, totalCarbonSaved: 98  },
          { _id: '3', username: 'PlantLover',  ecoPoints: 875,  currentStreak: 28, totalCarbonSaved: 87  },
        ]);
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const getRankDisplay = (index) => {
    if (index === 0) return { emoji: '🥇', color: '#f59e0b' };
    if (index === 1) return { emoji: '🥈', color: '#94a3b8' };
    if (index === 2) return { emoji: '🥉', color: '#b45309' };
    return { emoji: `#${index + 1}`, color: '#8b949e' };
  };

  const getMetricValue = (user) => {
    switch (activeTab) {
      case 'streaks': return `${user.currentStreak || 0} days`;
      case 'impact':  return `${user.totalCarbonSaved || 0} kg`;
      default:        return `${user.ecoPoints || 0} pts`;
    }
  };

  const tabs = [
    { id: 'ecoPoints', label: '🏆 Eco Points' },
    { id: 'streaks',   label: '🔥 Streaks'    },
    { id: 'impact',    label: '🌿 Impact'      },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(52,211,153,0.2)',
          borderTopColor: '#34d399',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(245,158,11,0.15)',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, margin: '0 auto 16px',
        }}>🏆</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e6edf3', margin: 0 }}>Eco-Leaderboard</h1>
        <p style={{ color: '#8b949e', marginTop: 6, fontSize: 14 }}>
          See who's making the biggest environmental impact!
        </p>
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div className="dark-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`dark-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Leaderboard List ── */}
      <div className="dark-card" style={{ overflow: 'hidden' }}>
        {leaderboard.length > 0 ? (
          leaderboard.map((u, index) => {
            const { emoji, color } = getRankDisplay(index);
            const isTop3 = index < 3;
            return (
              <div
                key={u._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  background: isTop3 ? `rgba(${index === 0 ? '245,158,11' : index === 1 ? '148,163,184' : '180,83,9'},0.05)` : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.05)'; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isTop3
                    ? `rgba(${index === 0 ? '245,158,11' : index === 1 ? '148,163,184' : '180,83,9'},0.05)`
                    : 'transparent';
                }}
              >
                {/* Left: rank + avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, textAlign: 'center', fontSize: isTop3 ? 22 : 14, fontWeight: 700, color }}>
                    {emoji}
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                    border: `2px solid ${color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color,
                  }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e6edf3' }}>{u.username}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#8b949e' }}>Rank #{index + 1}</p>
                  </div>
                </div>

                {/* Right: metric */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color }}>{getMetricValue(u)}</div>
                  <div style={{ fontSize: 11, color: '#8b949e' }}>
                    {activeTab === 'ecoPoints' && 'Total Points'}
                    {activeTab === 'streaks'   && 'Current Streak'}
                    {activeTab === 'impact'    && 'Carbon Saved'}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="dark-empty">
            <Trophy size={44} />
            <h3>No users yet</h3>
            <p>Be the first on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;