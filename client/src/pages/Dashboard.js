import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Trophy, Target, TrendingUp, Calendar, Flame } from 'lucide-react';
import axios from 'axios';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';
import ShareProgressModal from '../components/ShareProgressModal';
import '../dark-theme.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchHabits = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const response = await axios.get('/api/habits', {
        headers: { 'x-auth-token': token },
      });
      setHabits(response.data);
    } catch (error) {
      if (error.response?.status === 401) localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChallenges = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get('/api/challenges/joined', {
        headers: { 'x-auth-token': token },
      });
      setChallenges(response.data.slice(0, 3));
    } catch (_) {}
  }, []);

  useEffect(() => { fetchHabits(); fetchChallenges(); }, [fetchHabits, fetchChallenges]);

  const markHabitComplete = async (habitId) => {
    try {
      const response = await axios.post(`/api/habits/${habitId}/complete`);
      if (response.data.userStats) {
        updateUser({
          ecoPoints: response.data.userStats.ecoPoints,
          currentStreak: response.data.userStats.currentStreak,
        });
      }
      fetchHabits();
    } catch (_) {}
  };

  const dailyQuotes = [
    'Every small eco-action counts towards a greener tomorrow! 🌱',
    "Your daily choices shape the world's future. Choose wisely! 🌍",
    'Small steps, big impact. Keep going! ✨',
    "Today's eco-habit is tomorrow's clean planet! 🌿",
    "You're making a difference, one habit at a time! 💚",
  ];
  const randomQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(52,211,153,0.2)',
          borderTopColor: '#34d399',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const stats = [
    { icon: '🏆', label: 'Eco Points',     value: user?.ecoPoints || 0,          color: '#f59e0b' },
    { icon: '🔥', label: 'Day Streak',      value: user?.currentStreak || 0,       color: '#f97316' },
    { icon: '🌿', label: 'CO₂ Saved (kg)',  value: user?.totalCarbonSaved || 0,    color: '#34d399' },
    { icon: '🎯', label: 'Active Habits',   value: habits.length,                  color: '#38bdf8' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* ── Welcome Header ── */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e6edf3', margin: 0 }}>
            Welcome back, <span style={{ color: '#34d399' }}>{user?.username}</span> 👋
          </h1>
          <p style={{ color: '#8b949e', marginTop: 6, fontSize: 14 }}>{randomQuote}</p>
        </div>
        <button
          className="dark-btn-primary"
          onClick={() => setShowShareModal(true)}
        >
          📤 Share Progress
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} className="dark-stat-card">
            <div className="dark-stat-icon" style={{ background: `${s.color}18` }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div className="dark-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="dark-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: '#58646e', marginBottom: 24 }}>
        * CO₂ values are estimates for motivational purposes.
      </p>

      {/* ── Active Challenges ── */}
      {challenges.length > 0 && (
        <div className="dark-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div className="dark-section-header" style={{ marginBottom: 0 }}>
              <div className="dark-section-icon">
                <Target size={18} />
              </div>
              <span className="dark-section-title">Active Challenges</span>
            </div>
            <button
              onClick={() => navigate('/challenges')}
              style={{ fontSize: 12, color: '#34d399', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {challenges.map((ch) => (
              <div key={ch._id} style={{
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 12, padding: 16,
              }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>{ch.title}</h3>
                <div className="dark-progress-track">
                  <div className="dark-progress-fill" style={{ width: `${ch.progress || 0}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#8b949e' }}>
                  <span>{ch.progress || 0}% complete</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>{ch.ecoPoints} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Today's Habits ── */}
      <div className="dark-card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="dark-section-header">
          <div className="dark-section-icon">
            <Calendar size={18} />
          </div>
          <span className="dark-section-title">Today's Eco-Habits</span>
        </div>

        {habits.length === 0 ? (
          <div className="dark-empty">
            <Leaf size={44} />
            <h3>No habits set up yet</h3>
            <p>Create your first eco-habit to start making a difference!</p>
            <button className="dark-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/habits')}>
              + Add Habit
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {habits.map((habit) => (
              <HabitCard key={habit._id} habit={habit} onComplete={markHabitComplete} />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Actions + Achievements ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Quick Actions */}
        <div className="dark-card" style={{ padding: 24 }}>
          <div className="dark-section-header">
            <div className="dark-section-icon"><TrendingUp size={18} /></div>
            <span className="dark-section-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="dark-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/habits')}>
              🌱 Add New Habit
            </button>
            <button className="dark-btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/challenges')}>
              🎯 Join Challenge
            </button>
            <button className="dark-btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/leaderboard')}>
              🏆 View Leaderboard
            </button>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="dark-card" style={{ padding: 24 }}>
          <div className="dark-section-header">
            <div className="dark-section-icon"><Trophy size={18} /></div>
            <span className="dark-section-title">Recent Achievements</span>
          </div>

          {user?.badges && user.badges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user.badges.slice(0, 3).map((badge, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 20 }}>{badge.icon || '🏆'}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', margin: 0 }}>{badge.name}</p>
                    {badge.description && (
                      <p style={{ fontSize: 11, color: '#8b949e', margin: 0 }}>{badge.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dark-empty" style={{ padding: '24px 0' }}>
              <Trophy size={36} />
              <h3>No badges yet</h3>
              <p>Complete habits to earn badges!</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Progress Modal */}
      <ShareProgressModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} user={user} />
    </div>
  );
};

export default Dashboard;
