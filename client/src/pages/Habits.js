import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Calendar, Target, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../dark-theme.css';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Waste Reduction',
    frequency: 'daily',
    ecoPoints: 10,
    carbonSaved: 0.5,
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get('/api/habits', {
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      if (response.data) {
        setHabits(Array.isArray(response.data) ? response.data : []);
      } else {
        setHabits([]);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Please log in to view habits');
        } else if (error.response.status === 404) {
          toast.error('Habits endpoint not found. Please check the API URL.');
        } else {
          toast.error(error.response.data.message || 'Failed to fetch habits');
        }
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('Error: ' + error.message);
      }
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const headers = { 'x-auth-token': token, 'Content-Type': 'application/json' };

      if (editingHabit) {
        await axios.put(`/api/habits/${editingHabit._id}`, formData, { headers });
        toast.success('Habit updated successfully!');
      } else {
        await axios.post('/api/habits', formData, { headers });
        toast.success('Habit created successfully!');
      }

      setShowForm(false);
      setEditingHabit(null);
      resetForm();
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to save habit');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('Error: ' + error.message);
      }
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      ecoPoints: habit.ecoPoints || 10,
      carbonSaved: habit.carbonSaved || 0.5,
    });
    setShowForm(true);
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        await axios.delete(`/api/habits/${habitId}`, {
          headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        });

        toast.success('Habit deleted successfully!');
        fetchHabits();
      } catch (error) {
        console.error('Error deleting habit:', error);
        if (error.response) {
          toast.error(error.response.data.message || 'Failed to delete habit');
        } else {
          toast.error('Error: ' + error.message);
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Waste Reduction',
      frequency: 'daily',
      ecoPoints: 10,
      carbonSaved: 0.5,
      carbonSavedFrequency: 'weekly',
      targetDays: 7,
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getCategoryBadgeStyle = (category) => {
    const styles = {
      'Waste Reduction': { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
      'Energy': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
      'Transportation': { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
      'Water': { bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
      'Food': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
      'General': { bg: 'rgba(139,148,158,0.15)', color: '#8b949e' },
    };
    return styles[category] || styles['General'];
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(52,211,153,0.2)', borderTopColor: '#34d399', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '32px 0' }}>
      <div className="dark-main" style={{ marginTop: 0, padding: 0 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 12,
              }}>🌱</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>My Habits</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Track your eco-friendly habits and earn points</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setFormData({
                  title: '',
                  description: '',
                  category: 'Waste Reduction',
                  frequency: 'daily',
                  ecoPoints: 10,
                  carbonSaved: 0.5,
                });
                setEditingHabit(null);
              }}
              className="dark-btn-primary"
            >
              <Plus size={16} />
              Create New Habit
            </button>
          </div>

          {showForm && (
            <div className="dark-modal-overlay" onClick={() => { setShowForm(false); setEditingHabit(null); resetForm(); }}>
              <div className="dark-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                <div className="dark-modal-header">
                  <h2>{editingHabit ? 'Edit Habit' : 'Create New Habit'}</h2>
                  <button onClick={() => { setShowForm(false); setEditingHabit(null); resetForm(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', display: 'flex' }}>
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="dark-label">Habit Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="dark-input"
                      placeholder="e.g., Use reusable water bottle"
                    />
                  </div>
                  <div>
                    <label className="dark-label">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="dark-input"
                    >
                      <option value="Waste Reduction">Waste Reduction</option>
                      <option value="Energy">Energy</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Water">Water</option>
                      <option value="Food">Food</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="dark-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="dark-input"
                      placeholder="Describe your eco-habit..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="dark-label">Frequency</label>
                      <select
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleChange}
                        className="dark-input"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="dark-label">Eco Points</label>
                      <input
                        type="number"
                        name="ecoPoints"
                        value={formData.ecoPoints}
                        onChange={handleChange}
                        min="1"
                        className="dark-input"
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="dark-label">Carbon Saved (kg)</label>
                      <input
                        type="number"
                        name="carbonSaved"
                        value={formData.carbonSaved}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="dark-input"
                      />
                      <select
                        name="carbonSavedFrequency"
                        value={formData.carbonSavedFrequency}
                        onChange={handleChange}
                        className="dark-input"
                        style={{ marginTop: 8 }}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="dark-label">Target Days</label>
                      <input
                        type="number"
                        name="targetDays"
                        value={formData.targetDays}
                        onChange={handleChange}
                        min="1"
                        max="31"
                        className="dark-input"
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                    <button type="button" className="dark-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => { setShowForm(false); setEditingHabit(null); resetForm(); }}>
                      Cancel
                    </button>
                    <button type="submit" className="dark-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      {editingHabit ? 'Update Habit' : 'Create Habit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {habits.length === 0 ? (
            <div className="dark-card dark-empty" style={{ padding: '56px 24px' }}>
              <Target size={48} />
              <h3>No habits yet</h3>
              <p>Start building your eco-friendly routine!</p>
              <button className="dark-btn-primary" style={{ marginTop: 16 }}
                onClick={() => {
                  setShowForm(true);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'Waste Reduction',
                    frequency: 'daily',
                    ecoPoints: 10,
                    carbonSaved: 0.5,
                  });
                  setEditingHabit(null);
                }}>
                <Plus size={14} /> Create Your First Habit
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {habits.map((habit) => {
                const badgeStyle = getCategoryBadgeStyle(habit.category);
                return (
                  <div key={habit._id} className="dark-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: habit.isActive !== false ? '#34d399' : 'var(--text-muted)',
                            flexShrink: 0,
                          }} />
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {habit.title}
                          </h3>
                          <span style={{
                            padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 600,
                            background: badgeStyle.bg, color: badgeStyle.color,
                          }}>
                            {habit.category}
                          </span>
                        </div>
                        {habit.description && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 8px', lineHeight: 1.5 }}>
                            {habit.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={12} /> {habit.frequency}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Target size={12} /> Streak: {habit.currentStreak || 0} days
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> {habit.totalCompletions || 0} completions
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => handleEdit(habit)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 8 }}
                          onMouseEnter={e => e.target.style.background = 'var(--accent-dim)'}
                          onMouseLeave={e => e.target.style.background = 'none'}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(habit._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 8 }}
                          onMouseEnter={e => { e.target.style.background = 'rgba(248,113,113,0.15)'; e.target.style.color = '#f87171'; }}
                          onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--text-muted)'; }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;
