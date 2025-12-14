import React, { useState, useEffect } from 'react';
import { X, Mail, Building2, Award, Leaf, TrendingUp, Zap, Droplet, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserProfileModal = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState(null);
  const [activeHabits, setActiveHabits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
      checkFollowStatus();
      fetchLeaderboardRank();
      fetchUserActiveHabits();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/users/${userId}`, {
        headers: { 'x-auth-token': token }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/user', {
        headers: { 'x-auth-token': token }
      });
      const currentUser = response.data;
      setFollowing(currentUser.following?.includes(userId) || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchLeaderboardRank = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/leaderboard?sortBy=ecoPoints', {
        headers: { 'x-auth-token': token }
      });
      const rank = response.data.findIndex(u => u._id === userId) + 1;
      setLeaderboardRank(rank || null);
    } catch (error) {
      console.error('Error fetching leaderboard rank:', error);
    }
  };

  const fetchUserActiveHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/habits', {
        headers: { 'x-auth-token': token }
      });
      const habits = Array.isArray(response.data) ? response.data : [];
      const active = habits.filter(h => h.user === userId && h.isActive).slice(0, 3);
      setActiveHabits(active);
    } catch (error) {
      console.error('Error fetching active habits:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/users/${userId}/follow`, {}, {
        headers: { 'x-auth-token': token }
      });
      setFollowing(!following);
      toast.success(following ? 'Unfollowed' : 'Following');
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleMessage = () => {
    onClose();
    navigate('/chat', { state: { userId, username: user.username } });
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
          <p className="text-center text-gray-600">User not found</p>
          <button onClick={onClose} className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white px-6 py-4 flex justify-between items-center rounded-t-xl z-10 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user.avatar || 'https://via.placeholder.com/120'}
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg object-cover mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
            {user.email && <p className="text-gray-500 text-sm mt-1">{user.email}</p>}
            {user.bio && <p className="text-gray-600 text-center text-sm mt-2 max-w-md">{user.bio}</p>}
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleFollowToggle}
                className={`font-semibold py-2 px-8 rounded-lg transition ${
                  following ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
              {following && (
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 font-semibold py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{user.ecoPoints || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Eco Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">#{leaderboardRank || '-'}</p>
              <p className="text-xs text-gray-600 mt-1">Rank</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{user.badges?.length || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Badges</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{user.followers?.length || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Followers</p>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-center">
              <Droplet className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-cyan-700">{user.totalWasteReduced || 0}kg</p>
              <p className="text-xs text-gray-600">Plastic Saved</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <Zap className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-700">{user.totalCarbonSaved || 0}kg</p>
              <p className="text-xs text-gray-600">Carbon Saved</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-indigo-700">{user.currentStreak || 0}</p>
              <p className="text-xs text-gray-600">Day Streak</p>
            </div>
          </div>

          {/* About Section */}
          {(user.institution || user.education) && (
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-3">About</p>
              <div className="space-y-2">
                {user.institution && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Building2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{user.institution}</span>
                  </div>
                )}
                {user.education && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{user.education}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Habits */}
          {activeHabits.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                Active Habits
              </p>
              <div className="space-y-2">
                {activeHabits.map((habit, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">{habit.name}</span>
                    </div>
                    {habit.currentStreak && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                        {habit.currentStreak} days
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-3">Achievements</p>
              <div className="flex flex-wrap gap-2">
                {user.badges.slice(0, 8).map((badge, idx) => (
                  <span key={idx} className="bg-yellow-200 text-yellow-900 text-xs px-3 py-1 rounded-full font-medium">
                    {typeof badge === 'string' ? badge : badge.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
