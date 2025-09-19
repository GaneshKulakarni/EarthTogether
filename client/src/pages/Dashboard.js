import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';
import axios from 'axios';
import StatsCard from '../components/StatsCard';
import HabitCard from '../components/HabitCard';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estimatedCarbon, setEstimatedCarbon] = useState(null);

  // Simple client-side estimator: per-habit estimated kg CO2 saved per completion.
  // If a habit provides an explicit `impactKg` field we use that; otherwise we
  // fall back to a small default or category-based heuristic.
  const calculateCarbonImpact = (habitsArray) => {
    if (!habitsArray || habitsArray.length === 0) return 0;
    const categoryMap = {
      'transport': 2.5, // example: using bike instead of car
      'food': 0.5, // example: plant-based meal instead of meat
      'consumption': 0.2,
      'energy': 0.8,
      'waste': 0.1,
      'default': 0.1
    };

    let total = 0;
    habitsArray.forEach((h) => {
      // prefer explicit impactKg
      const impact = (typeof h.impactKg === 'number') ? h.impactKg : (
        (h.category && categoryMap[h.category.toLowerCase()]) || categoryMap.default
      );

      // if habit has been completed today, count it; otherwise treat as potential (still add)
      // Many apps want to show both potential and actual; here we show today's potential sum.
      total += impact;
    });

    return Number(total.toFixed(2));
  };

  const fetchHabits = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/habits', {
        headers: { 'x-auth-token': token }
      });
      setHabits(response.data);
      const est = computeCarbonFromHabits(response.data);
      setEstimatedCarbon(est);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

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

  // Simple client-side estimator: per-habit estimated kg CO2 saved per completion.
  // If a habit provides an explicit `impactKg` field we use that; otherwise we
  // fall back to a small default or category-based heuristic.
  const computeCarbonFromHabits = (habitsArray) => {
    if (!habitsArray || habitsArray.length === 0) return 0;
    const categoryMap = {
      'transport': 2.5, // example: using bike instead of car
      'food': 0.5, // example: plant-based meal instead of meat
      'consumption': 0.2,
      'energy': 0.8,
      'waste': 0.1,
      'default': 0.1
    };

    let total = 0;
    habitsArray.forEach((h) => {
      // prefer explicit impactKg
      const impact = (typeof h.impactKg === 'number') ? h.impactKg : (
        (h.category && categoryMap[h.category.toLowerCase()]) || categoryMap.default
      );

      // if habit has been completed today, count it; otherwise treat as potential (still add)
      // Many apps want to show both potential and actual; here we show today's potential sum.
      total += impact;
    });

    return Number(total.toFixed(2));
  };

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
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard icon={<Trophy className="w-6 h-6 text-green-600" />} title="Eco Points" value={user?.ecoPoints || 0} color="green" />
            <StatsCard icon={<TrendingUp className="w-6 h-6 text-blue-600" />} title="Day Streak" value={user?.currentStreak || 0} color="blue" />
            
            <StatsCard icon={<Target className="w-6 h-6 text-yellow-600" />} title="Active Habits" value={habits.length} color="yellow" />
          </div>
        </div>

        {/* Small note about the CO2 estimate when backend value is not available */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <p className="text-sm text-gray-500">Showing estimated CO₂ saved when backend value is not provided. Estimates are heuristic and for motivational purposes only.</p>
        </div>

        {/* Today's Habits */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Today's Eco-Habits</h2>
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
