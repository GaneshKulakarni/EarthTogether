import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, Users, Trophy, Plus, Star, TrendingUp, CheckCircle, Clock, Zap, Leaf, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard';
import '../dark-theme.css';

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges]         = useState([]);
  const [challengePosts, setChallengePosts] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [activeTab, setActiveTab]           = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChallenge, setNewChallenge]     = useState({
    title: '', description: '', category: 'General', difficulty: 'Medium',
    duration: 7, ecoPoints: 100, carbonSaved: 5, requirements: [''], rewards: [''],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
        const challengesRes = await axios.get('/api/challenges', config);
        const challenges = Array.isArray(challengesRes.data) ? challengesRes.data : [];
        const withJoin = challenges.map(c => ({
          ...c,
          isJoined: (c.participants || []).some(p => {
            if (!p.user) return false;
            const pid = typeof p.user === 'object' ? p.user._id : p.user;
            return pid ? pid.toString() === user?._id?.toString() : false;
          }),
        }));
        setChallenges(withJoin);
        try {
          const postsRes = await axios.get('/api/posts', config);
          const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
          setChallengePosts(posts.filter(p => p.category === 'Challenge' || p.type === 'challenge'));
        } catch (_) {}
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch data.');
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  const joinChallenge = async (id) => {
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      await axios.post(`/api/challenges/${id}/join`, {}, config);
      setChallenges(prev => prev.map(c =>
        c._id === id ? { ...c, isJoined: true, participants: [...c.participants, { user: user._id, joinedAt: new Date(), progress: 0 }] } : c
      ));
      toast.success('Joined challenge!');
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to join'); }
  };

  const leaveChallenge = async (id) => {
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      await axios.post(`/api/challenges/${id}/leave`, {}, config);
      setChallenges(prev => prev.map(c =>
        c._id === id ? { ...c, isJoined: false, participants: c.participants.filter(p => (typeof p.user === 'object' ? p.user._id : p.user) !== user._id) } : c
      ));
      toast.success('Left the challenge');
    } catch (_) { toast.error('Failed to leave'); }
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
      const data = {
        ...newChallenge,
        duration: String(newChallenge.duration),
        ecoPoints: Number(newChallenge.ecoPoints),
        carbonSaved: Number(newChallenge.carbonSaved),
        requirements: newChallenge.requirements.filter(r => r.trim()),
        rewards: newChallenge.rewards.filter(r => r.trim()),
      };
      const res = await axios.post('/api/challenges', data, config);
      setChallenges(prev => [...prev, { ...res.data, isJoined: false }]);
      setShowCreateModal(false);
      setNewChallenge({ title: '', description: '', category: 'General', difficulty: 'Medium', duration: 7, ecoPoints: 100, carbonSaved: 5, requirements: [''], rewards: [''] });
      toast.success('Challenge created!');
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Failed to create challenge';
      toast.error(msg);
    }
  };

  const getDifficultyStyle = (d) => ({
    Easy:   { background: 'rgba(52,211,153,0.15)', color: '#34d399' },
    Medium: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    Hard:   { background: 'rgba(248,113,113,0.15)', color: '#f87171' },
  }[d] || { background: 'rgba(139,148,158,0.15)', color: '#8b949e' });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Waste Reduction': return <Leaf   size={14} />;
      case 'Transportation':  return <Zap    size={14} />;
      case 'Energy':          return <Target size={14} />;
      default:                return <Star   size={14} />;
    }
  };

  const getDaysRemaining = (endDate) => {
    const d = Math.ceil((new Date(endDate) - new Date()) / 86400000);
    return d > 0 ? d : 0;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(52,211,153,0.2)', borderTopColor: '#34d399', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const joinedChallenges = challenges.filter(c => c.isJoined);
  const displayed        = activeTab === 'active' ? activeChallenges : joinedChallenges;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, margin: '0 auto 16px',
        }}>🎯</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e6edf3', margin: 0 }}>Eco-Challenges</h1>
        <p style={{ color: '#8b949e', marginTop: 6, fontSize: 14 }}>
          Join exciting challenges, compete with eco-warriors, and earn rewards while saving the planet
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { emoji: '🎯', label: 'Active Challenges', value: activeChallenges.length, color: '#34d399' },
          { emoji: '👥', label: 'Joined',             value: joinedChallenges.length, color: '#38bdf8' },
          { emoji: '⭐', label: 'Points Available',   value: joinedChallenges.reduce((s, c) => s + (c.ecoPoints || 0), 0), color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="dark-stat-card">
            <div className="dark-stat-icon" style={{ background: `${s.color}18` }}>
              <span style={{ fontSize: 20 }}>{s.emoji}</span>
            </div>
            <div className="dark-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="dark-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs + Create ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="dark-tabs">
          <button className={`dark-tab${activeTab === 'active' ? ' active' : ''}`} onClick={() => setActiveTab('active')}>
            All ({activeChallenges.length})
          </button>
          <button className={`dark-tab${activeTab === 'joined' ? ' active' : ''}`} onClick={() => setActiveTab('joined')}>
            My Challenges ({joinedChallenges.length})
          </button>
        </div>
        <button className="dark-btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} /> Create Challenge
        </button>
      </div>

      {/* ── Challenge Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {displayed.map((ch) => {
          const diffStyle = getDifficultyStyle(ch.difficulty);
          return (
            <div key={ch._id} className="dark-card" style={{ overflow: 'hidden' }}>
              {/* Card top */}
              <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#8b949e', fontSize: 12 }}>
                      {getCategoryIcon(ch.category)}
                      <span>{ch.category}</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3', margin: '0 0 6px' }}>{ch.title}</h3>
                    <p style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5, margin: 0 }}>{ch.description}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 12 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, ...diffStyle }}>{ch.difficulty}</span>
                    {ch.isJoined && (
                      <span style={{ fontSize: 11, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={12} /> Joined
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {ch.isJoined && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
                      <span>Progress</span><span>{ch.progress || 0}%</span>
                    </div>
                    <div className="dark-progress-track">
                      <div className="dark-progress-fill" style={{ width: `${ch.progress || 0}%` }} />
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, textAlign: 'center', marginTop: 12 }}>
                  {[
                    { val: ch.duration,              sub: 'Days' },
                    { val: ch.participants?.length,   sub: 'Members' },
                    { val: ch.ecoPoints,              sub: 'Pts', color: '#34d399' },
                    { val: `${ch.carbonSaved}kg`,     sub: 'CO₂',  color: '#38bdf8' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '6px 0', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: item.color || '#e6edf3' }}>{item.val}</div>
                      <div style={{ fontSize: 10, color: '#8b949e' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {getDaysRemaining(ch.endDate)} days left
                  </span>
                  <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Trophy size={12} style={{ color: '#f59e0b' }} /> {ch.rewards?.length || 0} rewards
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ch.isJoined ? (
                    <>
                      <button className="dark-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedChallenge(ch)}>
                        <TrendingUp size={13} /> Update Progress
                      </button>
                      <button className="dark-btn-danger" onClick={() => leaveChallenge(ch._id)}>Leave</button>
                    </>
                  ) : (
                    <button className="dark-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => joinChallenge(ch._id)}>
                      <Plus size={13} /> Join Challenge
                    </button>
                  )}
                  <button className="dark-btn-secondary" onClick={() => setSelectedChallenge(ch)}>Details</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {activeTab === 'joined' && joinedChallenges.length === 0 && (
        <div className="dark-card dark-empty" style={{ padding: '48px 24px' }}>
          <Target size={44} />
          <h3>No Challenges Joined Yet</h3>
          <p>Join your first eco-challenge and start earning rewards!</p>
          <button className="dark-btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('active')}>
            Browse Challenges
          </button>
        </div>
      )}

      {/* Challenge Posts */}
      {challengePosts.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div className="dark-section-header" style={{ marginBottom: 20 }}>
            <div className="dark-section-icon"><Trophy size={18} /></div>
            <span className="dark-section-title">Challenge Posts</span>
          </div>
          <div style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {challengePosts.map(post => (
              <PostCard
                key={post._id} post={post}
                onLike={async (postId) => {
                  try {
                    const token = localStorage.getItem('token');
                    const res = await axios.put(`/api/posts/like/${postId}`, {}, { headers: { 'x-auth-token': token } });
                    setChallengePosts(prev => prev.map(p => p._id === postId ? res.data : p));
                  } catch (_) {}
                }}
                onComment={async (postId, comment) => {
                  if (!comment.trim()) return;
                  try {
                    const token = localStorage.getItem('token');
                    await axios.post(`/api/posts/comment/${postId}`, { content: comment }, { headers: { 'x-auth-token': token } });
                    const res = await axios.get('/api/posts', { headers: { 'x-auth-token': token } });
                    setChallengePosts(res.data.filter(p => p.category === 'Challenge' || p.type === 'challenge'));
                  } catch (_) { toast.error('Failed to add comment'); }
                }}
                onJoinChallenge={joinChallenge}
                userChallenges={joinedChallenges.map(c => c._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Details Modal ── */}
      {selectedChallenge && (
        <div className="dark-modal-overlay" onClick={() => setSelectedChallenge(null)}>
          <div className="dark-modal" onClick={e => e.stopPropagation()}>
            <div className="dark-modal-header">
              <h2>{selectedChallenge.title}</h2>
              <button onClick={() => setSelectedChallenge(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 20 }}>{selectedChallenge.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>Requirements</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedChallenge.requirements?.map((r, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#8b949e' }}>
                        <CheckCircle size={13} style={{ color: '#34d399', flexShrink: 0, marginTop: 1 }} /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Rewards</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedChallenge.rewards?.map((r, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#8b949e' }}>
                        <Trophy size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedChallenge.isJoined && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 6 }}>
                    <span>Your Progress</span><span>{selectedChallenge.progress || 0}%</span>
                  </div>
                  <div className="dark-progress-track" style={{ height: 8 }}>
                    <div className="dark-progress-fill" style={{ width: `${selectedChallenge.progress || 0}%` }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                {selectedChallenge.isJoined ? (
                  <button className="dark-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedChallenge(null)}>
                    <TrendingUp size={14} /> Update Progress
                  </button>
                ) : (
                  <button className="dark-btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => { joinChallenge(selectedChallenge._id); setSelectedChallenge(null); }}>
                    <Plus size={14} /> Join Challenge
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="dark-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="dark-modal" onClick={e => e.stopPropagation()}>
            <div className="dark-modal-header">
              <h2>Create New Challenge</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createChallenge} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dark-label">Title</label>
                  <input className="dark-input" value={newChallenge.title} onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })} required />
                </div>
                <div>
                  <label className="dark-label">Category</label>
                  <select className="dark-input" value={newChallenge.category} onChange={e => setNewChallenge({ ...newChallenge, category: e.target.value })}>
                    {['Waste Reduction','Energy','Transportation','Water','Food','General'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="dark-label">Description</label>
                <textarea className="dark-input" rows={3} value={newChallenge.description} onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })} required style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div>
                  <label className="dark-label">Difficulty</label>
                  <select className="dark-input" value={newChallenge.difficulty} onChange={e => setNewChallenge({ ...newChallenge, difficulty: e.target.value })}>
                    {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="dark-label">Duration (days)</label>
                  <input className="dark-input" type="number" min="1" max="365" value={newChallenge.duration} onChange={e => setNewChallenge({ ...newChallenge, duration: parseInt(e.target.value) })} required />
                </div>
                <div>
                  <label className="dark-label">Eco Points</label>
                  <input className="dark-input" type="number" min="10" value={newChallenge.ecoPoints} onChange={e => setNewChallenge({ ...newChallenge, ecoPoints: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button type="button" className="dark-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit"  className="dark-btn-primary"   style={{ flex: 1, justifyContent: 'center' }}>Create Challenge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
