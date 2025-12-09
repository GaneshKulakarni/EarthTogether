import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Trophy, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';
import StatsCard from '../components/StatsCard';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get('/api/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      if (error.response?.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChallenges = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await axios.get('/api/challenges/joined', {
        headers: { 'x-auth-token': token }
      });
      setChallenges(response.data.slice(0, 3)); // Show only first 3
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
    fetchChallenges();
  }, [fetchHabits, fetchChallenges]);

  const markHabitComplete = async (habitId) => {
    try {
      const response = await axios.post(`/api/habits/${habitId}/complete`);
      
      // Update user stats if returned from backend
      if (response.data.userStats) {
        updateUser({
          ecoPoints: response.data.userStats.ecoPoints,
          currentStreak: response.data.userStats.currentStreak
        });
      }
      
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg mb-6">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {randomQuote}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatsCard icon={<Trophy className="w-6 h-6 text-green-600" />} title="Eco Points" value={user?.ecoPoints || 0} color="green" />
            <StatsCard icon={<TrendingUp className="w-6 h-6 text-blue-600" />} title="Day Streak" value={user?.currentStreak || 0} color="blue" />
            <StatsCard icon={<Leaf className="w-6 h-6 text-emerald-600" />} title="CO₂ Saved (kg)" value={user?.totalCarbonSaved || 0} color="emerald" />
            <StatsCard icon={<Target className="w-6 h-6 text-yellow-600" />} title="Active Habits" value={habits.length} color="yellow" />
          </div>
        </div>

        {/* Small note about the CO2 estimate when backend value is not available */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <p className="text-sm text-gray-500">Showing estimated CO₂ saved when backend value is not provided. Estimates are heuristic and for motivational purposes only.</p>
        </div>

        {/* Active Challenges */}
        {challenges.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Active Challenges</h2>
              </div>
              <button 
                onClick={() => navigate('/challenges')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <div key={challenge._id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${challenge.progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{challenge.progress || 0}% complete</span>
                    <span className="text-blue-600 font-medium">{challenge.ecoPoints} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Today's Habits */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-12">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Today's Eco-Habits</h2>
          </div>
          
          {habits.length === 0 ? (
            <EmptyState icon={<Leaf className="w-16 h-16" />} title="No habits set up yet" subtitle="Create your first eco-habit to start making a difference!" />
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => (
                <HabitCard key={habit._id} habit={habit} onComplete={markHabitComplete} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/habits')} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors">
                Add New Habit
              </button>
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Share Progress
              </button>
              <button 
                onClick={() => navigate('/challenges')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Join Challenge
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h3>
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
