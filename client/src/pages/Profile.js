import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Edit, Trophy, Target, Leaf, Calendar, Newspaper, Plus, MapPin, GraduationCap, Building2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import HabitCard from '../components/HabitCard';
import PostCard from '../components/PostCard';
import '../dark-theme.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loadUser, isAuthenticated } = useAuth();
  const [editing, setEditing]           = useState(false);
  const [activeTab, setActiveTab]       = useState('profile');
  const [userHabits, setUserHabits]     = useState([]);
  const [userPosts, setUserPosts]       = useState([]);
  const [, setUserChallenges] = useState([]);
  const [formData, setFormData]         = useState({ username: '', bio: '', avatar: '', location: '', education: '', institution: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        if (!user && isAuthenticated) await loadUser();
      } catch (_) {
        if (isMounted) toast.error('Failed to load profile data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, [user, isAuthenticated, loadUser]);

  useEffect(() => {
    if (user) setFormData({ username: user.username || '', bio: user.bio || '', avatar: user.avatar || '', location: user.location || '', education: user.education || '', institution: user.institution || '' });
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated && !loading) navigate('/login');
  }, [isAuthenticated, loading, navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) fetchUserChallenges(); }, [user?._id]);

  const fetchUserChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/challenges', { headers: { 'x-auth-token': token } });
      const joined = res.data.filter(c => c.participants.some(p => p.user === user?._id));
      setUserChallenges(joined.map(c => c._id));
    } catch (_) {}
  };

  const fetchUserHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/habits', { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } });
      setUserHabits(Array.isArray(res.data) ? res.data : []);
    } catch (_) { toast.error('Failed to load habits.'); }
  };

  const fetchUserPostsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/posts', { headers: { 'x-auth-token': token } });
      if (Array.isArray(res.data) && user) {
        const myPosts = res.data.filter(post => {
          const postUserId = post.user?._id || post.user?.id;
          return postUserId === (user._id || user.id);
        });
        setUserPosts(myPosts);
      } else { setUserPosts([]); }
    } catch (_) { setUserPosts([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updateData = new FormData();
      if (formData.username)              updateData.append('username', formData.username);
      if (formData.bio !== undefined)     updateData.append('bio', formData.bio);
      if (formData.location !== undefined) updateData.append('location', formData.location);
      if (formData.education !== undefined) updateData.append('education', formData.education);
      if (formData.institution !== undefined) updateData.append('institution', formData.institution);
      if (selectedFile)                   updateData.append('avatar', selectedFile);
      await axios.put('/api/users/profile', updateData, { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated!');
      setEditing(false);
      setSelectedFile(null);
      loadUser();
    } catch (_) { toast.error('Failed to update profile'); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  if (loading && !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(52,211,153,0.2)', borderTopColor: '#34d399', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const resolvedAvatar = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`)
    : null;

  const statItems = [
    { icon: '🏆', label: 'Eco Points',     value: user?.ecoPoints || 0,         color: '#f59e0b' },
    { icon: '🔥', label: 'Current Streak',  value: user?.currentStreak || 0,      color: '#f97316' },
    { icon: '🌿', label: 'CO₂ Saved',       value: `${user?.totalCarbonSaved || 0} kg`, color: '#34d399' },
    { icon: '🏅', label: 'Badges Earned',   value: user?.badges?.length || 0,    color: '#38bdf8' },
  ];

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'habits',  label: '🌱 My Habits' },
    { id: 'feed',    label: '📝 My Posts' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* ── Tab Bar + Actions ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="dark-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`dark-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => {
                setActiveTab(t.id);
                if (t.id === 'habits') fetchUserHabits();
                if (t.id === 'feed')   fetchUserPostsData();
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dark-btn-primary"    onClick={() => navigate('/habits')}>  <Plus size={14} /> New Habit</button>
          <button className="dark-btn-secondary"  onClick={() => navigate('/welcome')}> <Plus size={14} /> New Post</button>
        </div>
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <>
          {/* Profile Header Card */}
          <div className="dark-card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#e6edf3', margin: 0 }}>My Profile</h1>
              <button
                className="dark-btn-secondary"
                onClick={() => setEditing(!editing)}
              >
                <Edit size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              /* ── Edit Form ── */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { name: 'username', label: 'Username', type: 'text', placeholder: 'Your username' },
                  { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
                  { name: 'education', label: 'Education', type: 'text', placeholder: 'Degree, Field of Study' },
                  { name: 'institution', label: 'Institution', type: 'text', placeholder: 'University or Organization' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="dark-label">{field.label}</label>
                    <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} className="dark-input" />
                  </div>
                ))}
                <div>
                  <label className="dark-label">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="dark-input" placeholder="Tell us about your eco-journey…" style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="dark-label">Profile Picture</label>
                  <input
                    type="file" accept="image/*" onChange={handleFileChange}
                    style={{ fontSize: 13, color: '#8b949e', width: '100%' }}
                  />
                  {selectedFile && <p style={{ fontSize: 11, color: '#34d399', marginTop: 4 }}>Selected: {selectedFile.name}</p>}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="dark-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit"  className="dark-btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              /* ── View Mode ── */
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34d399, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                  border: '3px solid rgba(52,211,153,0.4)',
                  boxShadow: '0 0 20px rgba(52,211,153,0.2)',
                  fontSize: 32, fontWeight: 800, color: '#fff',
                }}>
                  {resolvedAvatar
                    ? <img src={resolvedAvatar} alt={user?.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (user?.username?.[0]?.toUpperCase() || 'U')
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#e6edf3', margin: '0 0 4px' }}>{user?.username}</h2>
                  <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 14 }}>
                    {user?.bio || 'No bio yet. Tell us about your eco-journey!'}
                  </p>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    {user?.location && (
                      <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} style={{ color: '#34d399' }} /> {user.location}
                      </span>
                    )}
                    {user?.education && (
                      <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <GraduationCap size={12} style={{ color: '#34d399' }} /> {user.education}
                      </span>
                    )}
                    {user?.institution && (
                      <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} style={{ color: '#34d399' }} /> {user.institution}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} style={{ color: '#34d399' }} /> Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  {/* Followers */}
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { label: 'Followers', val: user?.followers?.length || 0 },
                      { label: 'Following', val: user?.following?.length  || 0 },
                    ].map((item) => (
                      <div key={item.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>{item.val}</div>
                        <div style={{ fontSize: 11, color: '#8b949e' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
            {statItems.map((s) => (
              <div key={s.label} className="dark-stat-card">
                <div className="dark-stat-icon" style={{ background: `${s.color}18` }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div className="dark-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="dark-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="dark-card" style={{ padding: 24 }}>
            <div className="dark-section-header">
              <div className="dark-section-icon"><Trophy size={18} /></div>
              <span className="dark-section-title">Achievements</span>
            </div>

            {user?.badges && user.badges.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {user.badges.map((badge, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: 'rgba(245,158,11,0.07)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 12,
                  }}>
                    <div style={{ fontSize: 24 }}>{badge.icon || '🏆'}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', margin: 0 }}>
                        {typeof badge === 'string' ? badge : badge.name}
                      </p>
                      {badge.description && <p style={{ fontSize: 11, color: '#8b949e', margin: 0 }}>{badge.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dark-empty" style={{ padding: '24px 0' }}>
                <Trophy size={40} />
                <h3>No achievements yet</h3>
                <p>Complete eco-habits and maintain streaks to earn achievements!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── My Habits Tab ── */}
      {activeTab === 'habits' && (
        <div className="dark-card" style={{ padding: 24 }}>
          <div className="dark-section-header">
            <div className="dark-section-icon"><Leaf size={18} /></div>
            <span className="dark-section-title">My Habits</span>
          </div>
          {userHabits.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {userHabits.map(h => (
                <HabitCard key={h._id} habit={h} onComplete={() => fetchUserHabits()} onHabitUpdated={() => fetchUserHabits()} />
              ))}
            </div>
          ) : (
            <div className="dark-empty">
              <Target size={44} />
              <h3>No habits yet</h3>
              <p>Start tracking your eco-habits to see them here!</p>
              <button className="dark-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/habits')}>
                + Create Habit
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── My Posts Tab ── */}
      {activeTab === 'feed' && (
        <div>
          <div className="dark-section-header" style={{ marginBottom: 20 }}>
            <div className="dark-section-icon"><Newspaper size={18} /></div>
            <span className="dark-section-title">My Posts</span>
          </div>
          {userPosts.length > 0 ? (
            <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {userPosts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    showDelete={true}
                    onDelete={async (postId) => {
                      if (!window.confirm('Delete this post?')) return;
                      try {
                        const token = localStorage.getItem('token');
                        await axios.delete(`/api/posts/${postId}`, { headers: { 'x-auth-token': token } });
                        setUserPosts(p => p.filter(x => x._id !== postId));
                        toast.success('Post deleted');
                      } catch (_) { toast.error('Failed to delete post'); }
                    }}
                    onEdit={() => fetchUserPostsData()}
                  />
              ))}
            </div>
          ) : (
            <div className="dark-card dark-empty" style={{ padding: '48px 24px' }}>
              <Newspaper size={44} />
              <h3>No posts yet</h3>
              <p>Share your eco-journey with the community!</p>
              <button className="dark-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/welcome')}>
                + Create Post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
