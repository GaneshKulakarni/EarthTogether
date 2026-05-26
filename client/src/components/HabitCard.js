import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../dark-theme.css';

const HabitCard = ({ habit, onComplete, onHabitUpdated }) => {
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    title: habit.title || habit.name || '',
    description: habit.description || '',
    category: habit.category || 'Waste Reduction',
    frequency: habit.frequency || 'daily',
    ecoPoints: habit.ecoPoints || 10,
    carbonSaved: habit.carbonSaved || 0.5,
  });

  useEffect(() => {
    checkIfCompletedToday();
  }, [habit]);

  const checkIfCompletedToday = () => {
    if (!habit.completedDates || habit.completedDates.length === 0) {
      setIsCompletedToday(false);
      return;
    }

    const today = new Date().toDateString();
    const completedToday = habit.completedDates.some(date => {
      const completedDate = new Date(date).toDateString();
      return completedDate === today;
    });

    setIsCompletedToday(completedToday);
  };

  const handleComplete = async () => {
    if (isCompletedToday) {
      toast.info('Already completed today! Come back tomorrow.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/habits/${habit._id}/complete`, {}, {
        headers: { 'x-auth-token': token }
      });

      setIsCompletedToday(true);
      toast.success('Habit completed!');
      
      if (response.data.userStats) {
        updateUser({
          ecoPoints: response.data.userStats.ecoPoints,
          currentStreak: response.data.userStats.currentStreak,
          totalCarbonSaved: response.data.userStats.totalCarbonSaved,
        });
      }

      if (onHabitUpdated) {
        onHabitUpdated();
      }
      if (onComplete) {
        onComplete(habit._id, response.data);
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error(error.response?.data?.message || 'Failed to complete habit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${habit.title || habit.name}"?`)) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/habits/${habit._id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Habit deleted successfully!');
      if (onHabitUpdated) {
        onHabitUpdated();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error(error.response?.data?.message || 'Failed to delete habit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOpen = (e) => {
    e.stopPropagation();
    setFormData({
      title: habit.title || habit.name || '',
      description: habit.description || '',
      category: habit.category || 'Waste Reduction',
      frequency: habit.frequency || 'daily',
      ecoPoints: habit.ecoPoints || 10,
      carbonSaved: habit.carbonSaved || 0.5,
    });
    setShowEditForm(true);
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/habits/${habit._id}`, formData, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Habit updated successfully!');
      setShowEditForm(false);
      if (onHabitUpdated) {
        onHabitUpdated();
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error(error.response?.data?.message || 'Failed to update habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="dark-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <div style={{ flex: 1, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: habit.isActive !== false ? '#34d399' : 'var(--text-muted)',
              flexShrink: 0, marginTop: 4,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.title || habit.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {habit.category} &bull; {habit.frequency}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button onClick={handleEditOpen} title="Edit Habit" disabled={isLoading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <Edit size={14} />
              </button>
              <button onClick={handleDelete} title="Delete Habit" disabled={isLoading}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {habit.description || 'No description'}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Streak:</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{habit.currentStreak || 0} days</span>
          </div>
          <button
            onClick={handleComplete}
            disabled={isLoading || isCompletedToday}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 600, cursor: isLoading || isCompletedToday ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              background: isCompletedToday ? 'var(--bg-input)' : 'var(--accent)',
              color: isCompletedToday ? 'var(--text-muted)' : '#0a2818',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!isCompletedToday && !isLoading) { e.target.style.background = '#2ecc89'; e.target.style.boxShadow = '0 0 12px rgba(52,211,153,0.3)'; } }}
            onMouseLeave={e => { if (!isCompletedToday && !isLoading) { e.target.style.background = 'var(--accent)'; e.target.style.boxShadow = 'none'; } }}
          >
            <CheckCircle size={16} />
            <span>{isCompletedToday ? 'Completed Today' : isLoading ? 'Completing...' : 'Complete'}</span>
          </button>
        </div>
      </div>

      {showEditForm && (
        <div className="dark-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowEditForm(false)}>
          <div className="dark-modal" style={{ width: '100%', maxWidth: 500, background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }} onClick={e => e.stopPropagation()}>
            <div className="dark-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>Edit Habit</h2>
              <button onClick={() => setShowEditForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', display: 'flex', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="dark-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Habit Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="dark-input"
                  style={{ width: '100%', padding: '10px 12px', background: '#0f1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e6edf3', fontSize: 14 }}
                />
              </div>
              <div>
                <label className="dark-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="dark-input"
                  style={{ width: '100%', padding: '10px 12px', background: '#0f1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e6edf3', fontSize: 14 }}
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
                <label className="dark-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="dark-input"
                  placeholder="Describe your eco-habit..."
                  style={{ width: '100%', padding: '10px 12px', background: '#0f1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e6edf3', fontSize: 14, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dark-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleFormChange}
                    className="dark-input"
                    style={{ width: '100%', padding: '10px 12px', background: '#0f1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e6edf3', fontSize: 14 }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="dark-label" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eco Points</label>
                  <input
                    type="number"
                    name="ecoPoints"
                    value={formData.ecoPoints}
                    onChange={handleFormChange}
                    min="1"
                    className="dark-input"
                    style={{ width: '100%', padding: '10px 12px', background: '#0f1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e6edf3', fontSize: 14 }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button type="button" className="dark-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="dark-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HabitCard;
