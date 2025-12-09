import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePost } from '../context/PostContext';
import { useNavigate } from 'react-router-dom';
import { User, Edit, Trophy, Target, Leaf, Calendar, Newspaper, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import HabitCard from '../components/HabitCard';
import PostCard from '../components/PostCard';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loadUser, isAuthenticated } = useAuth();
  const { fetchUserPosts } = usePost();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userHabits, setUserHabits] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldFetchHabits, setShouldFetchHabits] = useState(false);
  const [shouldFetchPosts, setShouldFetchPosts] = useState(false);

  // Load user data when component mounts or when user changes
  useEffect(() => {
    console.log('Profile useEffect - Initial load', { user, isAuthenticated, loading });
    
    let isMounted = true;
    
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        if (!user && isAuthenticated) {
          console.log('User not loaded but authenticated, calling loadUser()');
          await loadUser();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (isMounted) {
          toast.error('Failed to load profile data');
        }
      } finally {
        if (isMounted) {
          console.log('Finished loading user data, setting loading to false');
          setLoading(false);
        }
      }
    };

    fetchUserData();
    
    // Cleanup function
    return () => {
      console.log('Profile component unmounting or dependencies changed');
      isMounted = false;
    };
  }, [user, isAuthenticated, loadUser]);

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Set up effect triggers based on active tab
  useEffect(() => {
    setShouldFetchHabits(activeTab === 'habits' && !!user);
    setShouldFetchPosts(activeTab === 'feed' && !!user);
    if (user) fetchUserChallenges();
  }, [activeTab, user]);

  const fetchUserChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/challenges', {
        headers: { 'x-auth-token': token }
      });
      const joinedChallenges = response.data.filter(challenge => 
        challenge.participants.some(p => p.user === user?._id)
      );
      setUserChallenges(joinedChallenges.map(c => c._id));
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/challenges/${challengeId}/join`, {}, {
        headers: { 'x-auth-token': token }
      });
      setUserChallenges(prev => [...prev, challengeId]);
      toast.success('Successfully joined the challenge!');
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error(error.response?.data?.msg || 'Failed to join challenge');
    }
  };

  // Fetch user's habits when needed
  useEffect(() => {
    const fetchUserHabits = async () => {
      if (!shouldFetchHabits) return;
      
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/habits', {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        setUserHabits(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Error fetching user habits:', error);
        toast.error('Failed to load habits.');
      }
    };

    fetchUserHabits();
  }, [shouldFetchHabits]);

  // Fetch user's posts when needed
  useEffect(() => {
    const loadUserPosts = async () => {
      if (!shouldFetchPosts) return;
      
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/posts/my-posts', {
          headers: { 'x-auth-token': token }
        });
        setUserPosts(res.data);
      } catch (error) {
        console.error('Error fetching user posts:', error);
        toast.error('Failed to load posts.');
      }
    };

    loadUserPosts();
  }, [shouldFetchPosts, fetchUserPosts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/users/profile', data, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data' // Important for file uploads
        }
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
      setSelectedFile(null);
      loadUser(); // Refresh user data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Debug logging
  console.log('Profile render state:', { 
    user, 
    isAuthenticated, 
    loading, 
    hasUser: !!user,
    token: localStorage.getItem('token') ? 'exists' : 'missing' 
  });

  // Show loading state only when we're actually loading and don't have user data yet
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        <span className="ml-4 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  // If not loading but no user (and we should have one), show error
  if (!loading && !user && isAuthenticated) {
    console.error('No user data available but user is authenticated');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading profile data. Please try refreshing the page.
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const handleCreateHabit = () => {
    navigate('/habits');
  };

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8450';
  const resolvedAvatar = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation and Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2 w-full md:w-auto justify-center">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium text-sm sm:px-6 sm:text-base ${activeTab === 'profile' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`px-4 py-2 rounded-lg font-medium text-sm sm:px-6 sm:text-base ${activeTab === 'habits' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              My Habits
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm sm:px-6 sm:text-base ${activeTab === 'feed' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              My Posts
            </button>
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={handleCreateHabit}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg w-full justify-center md:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Habit</span>
            </button>
            <button
              onClick={handleCreatePost}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg w-full justify-center md:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span onClick={()=> navigate('/create-post')}>New Post</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        {activeTab === 'profile' && (
          <>
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Tell us about yourself and your eco-journey..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-sm text-gray-500">Selected file: {selectedFile.name}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {resolvedAvatar ? (
                      <img src={resolvedAvatar} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{user.username}</h2>
                    <p className="text-gray-600 mb-4">
                      {user.bio || "No bio yet. Tell us about your eco-journey!"}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{user.ecoPoints || 0}</h3>
                <p className="text-gray-600">Eco Points</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{user.currentStreak || 0}</h3>
                <p className="text-gray-600">Current Streak</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{user.totalCarbonSaved || 0} kg</h3>
                <p className="text-gray-600">CO₂ Saved</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{user.badges?.length || 0}</h3>
                <p className="text-gray-600">Badges Earned</p>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
              
              {user.badges && user.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.badges.map((badge, index) => (
                    <div key={index} className="border border-green-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
                          {badge.icon || "🏆"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                          <p className="text-sm text-gray-600">{badge.description}</p>
                          <p className="text-xs text-green-600 font-medium">
                            Earned {new Date(badge.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                  <p className="text-gray-500">Complete eco-habits and maintain streaks to earn achievements!</p>
                </div>
              )}
            </div>

            {/* Certifications Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
                <button
                  onClick={() => window.open('/images/sample_certificate.jpg', '_blank')}
                  className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  View Sample Certificate
                </button>
              </div>
              
              {user.certifications && user.certifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.certifications.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                          <p className="text-sm text-gray-600">{cert.description}</p>
                          <p className="text-xs text-gray-500">
                            Earned {new Date(cert.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No certifications yet</h3>
                  <p className="text-gray-500">Complete challenges and earn certifications for your eco-efforts!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* My Habits Section */}
        {activeTab === 'habits' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">My Habits</h2>
            {userHabits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userHabits.map(habit => (
                  <HabitCard key={habit._id} habit={habit} onHabitUpdated={() => {}} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
                <p className="text-gray-500">Start tracking your eco-habits to see them here!</p>
              </div>
            )}
          </div>
        )}

        {/* My Posts Section */}
        {activeTab === 'feed' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">My Posts</h2>
            {userPosts.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-6">
                {userPosts.map(post => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    showDelete={true}
                    onLike={async (postId) => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await axios.put(`/api/posts/like/${postId}`, {}, {
                          headers: { 'x-auth-token': token }
                        });
                        
                        // Update local state with complete post data
                        setUserPosts(prevPosts => 
                          prevPosts.map(post => 
                            post._id === postId 
                              ? response.data
                              : post
                          )
                        );
                      } catch (error) {
                        console.error('Error liking post:', error);
                      }
                    }}
                    onComment={async (postId, comment) => {
                      if (!comment.trim()) return;
                      try {
                        const token = localStorage.getItem('token');
                        await axios.post(`/api/posts/comment/${postId}`, { content: comment }, {
                          headers: { 'x-auth-token': token }
                        });
                        const posts = await fetchUserPosts();
                        setUserPosts(posts);
                      } catch (error) {
                        console.error('Error adding comment:', error);
                        toast.error('Failed to add comment');
                      }
                    }}
                    onDelete={async (postId) => {
                      if (!window.confirm('Are you sure you want to delete this post?')) return;
                      try {
                        const token = localStorage.getItem('token');
                        await axios.delete(`/api/posts/${postId}`, {
                          headers: { 'x-auth-token': token }
                        });
                        setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
                        toast.success('Post deleted successfully');
                      } catch (error) {
                        console.error('Error deleting post:', error);
                        toast.error('Failed to delete post');
                      }
                    }}
                    onJoinChallenge={joinChallenge}
                    userChallenges={userChallenges}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Share your eco-journey with the community!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
