import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Target, Leaf, Medal } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ecoPoints');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        };
        const res = await axios.get(`/api/users/leaderboard?sortBy=${activeTab}`, config);
        setLeaderboard(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        // Mock data for development
        setLeaderboard([
          { _id: '1', username: 'EcoWarrior', ecoPoints: 1250, currentStreak: 45, totalCarbonSaved: 125 },
          { _id: '2', username: 'GreenThumb', ecoPoints: 980, currentStreak: 32, totalCarbonSaved: 98 },
          { _id: '3', username: 'PlantLover', ecoPoints: 875, currentStreak: 28, totalCarbonSaved: 87 }
        ]);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{index + 1}</span>;
  };

  const getMetricValue = (user) => {
    switch (activeTab) {
      case 'streaks': return `${user.currentStreak || 0} days`;
      case 'impact': return `${user.totalCarbonSaved || 0} kg CO₂`;
      default: return `${user.ecoPoints || 0} points`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🏆 Eco-Leaderboard</h1>
        <p className="text-gray-600">See who's making the biggest environmental impact!</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2">
          <button
            onClick={() => setActiveTab('ecoPoints')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'ecoPoints' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Eco Points
          </button>
          <button
            onClick={() => setActiveTab('streaks')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'streaks' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Streaks
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'impact' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Leaf className="w-4 h-4 inline mr-2" />
            Impact
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {leaderboard.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((user, index) => (
              <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                      <p className="text-gray-500">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{getMetricValue(user)}</div>
                    <div className="text-sm text-gray-500">
                      {activeTab === 'ecoPoints' && 'Total Points'}
                      {activeTab === 'streaks' && 'Current Streak'}
                      {activeTab === 'impact' && 'Carbon Saved'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found on the leaderboard yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;