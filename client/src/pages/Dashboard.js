import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Trophy, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/habits', {
        headers: { 'x-auth-token': token }
      });
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const markHabitComplete = async (habitId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/habits/${habitId}/complete`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchHabits(); // Refresh habits
    } catch (error) {
      console.error('Error marking habit complete:', error);
    }
  };

  const dailyQuotes = [
    "Every small eco-action counts towards a greener tomorrow! 🌱",
    "Your daily choices shape the world's future. Choose wisely! 🌍",
    "Small steps, big impact. Keep going! ✨",
    "Today's eco-habit is tomorrow's clean planet! 🌿",
    "You're making a difference, one habit at a time! 💚"
  ];

  const randomQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.username}! 🌱
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {randomQuote}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{user?.ecoPoints || 0}</h3>
            <p className="text-gray-600">Eco Points</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{user?.currentStreak || 0}</h3>
            <p className="text-gray-600">Day Streak</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{user?.totalCarbonSaved || 0} kg</h3>
            <p className="text-gray-600">CO₂ Saved</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{habits.length}</h3>
            <p className="text-gray-600">Active Habits</p>
          </div>
        </div>

        {/* Today's Habits */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Eco-Habits</h2>
          </div>
          
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No habits set up yet</p>
              <p className="text-gray-400">Create your first eco-habit to start making a difference!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => (
                <div key={habit._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      habit.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{habit.name}</h3>
                      <p className="text-sm text-gray-600">{habit.category} • {habit.frequency}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Streak: {habit.currentStreak} days
                    </span>
                    <button
                      onClick={() => markHabitComplete(habit._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors">
                Add New Habit
              </button>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors">
                Share Progress
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors">
                Join Challenge
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            {user?.badges && user.badges.length > 0 ? (
              <div className="space-y-3">
                {user.badges.slice(0, 3).map((badge, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{badge.name}</p>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No badges yet</p>
                <p className="text-gray-400 text-sm">Complete habits to earn badges!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
