import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, Image, Award, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePosts: 0,
    pendingMemes: 0,
    totalChallenges: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  // Restrict access to test@gmail.com only
  if (user?.email !== 'test@gmail.com') {
    return <Navigate to="/welcome" replace />;
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/stats', {
        headers: { 'x-auth-token': token }
      });
      setStats(response.data);
      setRecentActivity(response.data.recentActivity || []);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  const adminTabs = [
    { key: 'overview', label: 'Overview', icon: <Shield className="w-5 h-5" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { key: 'posts', label: 'Posts', icon: <FileText className="w-5 h-5" /> },
    { key: 'memes', label: 'Memes', icon: <Image className="w-5 h-5" /> },
    { key: 'challenges', label: 'Challenges', icon: <Award className="w-5 h-5" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🛡️ Admin Panel</h1>
        <p className="text-gray-600">Manage platform content and spotlight eco-leaders</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="flex overflow-x-auto">
          {adminTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
              <p className="text-gray-600">Total Users</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.activePosts}</h3>
              <p className="text-gray-600">Active Posts</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Image className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingMemes}</h3>
              <p className="text-gray-600">Pending Memes</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalChallenges}</h3>
              <p className="text-gray-600">Total Challenges</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>{activity.message}</span>
                    <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other tabs content */}
      {activeTab !== 'overview' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {adminTabs.find(tab => tab.key === activeTab)?.icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {adminTabs.find(tab => tab.key === activeTab)?.label} Management
          </h3>
          <p className="text-gray-600">
            {activeTab === 'users' && 'Manage user accounts, roles, and permissions'}
            {activeTab === 'posts' && 'Review and moderate community posts'}
            {activeTab === 'memes' && 'Approve or reject submitted memes'}
            {activeTab === 'challenges' && 'Create and manage eco-challenges'}
            {activeTab === 'settings' && 'Configure platform settings and preferences'}
          </p>
          <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
            Manage {adminTabs.find(tab => tab.key === activeTab)?.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;