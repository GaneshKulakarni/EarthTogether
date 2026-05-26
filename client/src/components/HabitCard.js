import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../dark-theme.css';

const HabitCard = ({ habit, onComplete, onHabitUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);

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
      if (onHabitUpdated) {
        onHabitUpdated();
      }
      if (onComplete) {
        onComplete(habit._id);
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error(error.response?.data?.message || 'Failed to complete habit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: habit.isActive !== false ? '#34d399' : 'var(--text-muted)',
            flexShrink: 0, marginTop: 4,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{habit.name}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
              {habit.category} &bull; {habit.frequency}
            </p>
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
  );
};

export default HabitCard;
