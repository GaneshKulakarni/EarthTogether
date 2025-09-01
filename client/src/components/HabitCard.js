import React from 'react';
import { CheckCircle } from 'lucide-react';

const HabitCard = ({ habit, onComplete }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${habit.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <div>
          <h3 className="font-semibold text-gray-900">{habit.name}</h3>
          <p className="text-sm text-gray-600">{habit.category} • {habit.frequency}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">Streak: {habit.currentStreak} days</span>
        <button onClick={() => onComplete(habit._id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Complete</span>
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
