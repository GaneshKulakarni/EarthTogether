import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
      toast.success('Habit completed! 🎉');
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex-1 mb-4">
        <div className="flex items-start space-x-3 mb-3">
          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${habit.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{habit.name}</h3>
            <p className="text-sm text-gray-600">{habit.category} • {habit.frequency}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-3">{habit.description || 'No description'}</p>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Streak:</span>
          <span className="text-lg font-bold text-green-600">{habit.currentStreak || 0} days</span>
        </div>
        <button 
          onClick={handleComplete}
          disabled={isLoading || isCompletedToday}
          className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            isCompletedToday
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isCompletedToday ? 'Completed Today' : isLoading ? 'Completing...' : 'Complete'}</span>
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
