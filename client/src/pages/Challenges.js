import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, Users, Trophy, Plus, Star, TrendingUp, CheckCircle, Clock, Zap, Leaf, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        };
        const res = await axios.get('/api/challenges', config);
        const challengesWithJoinStatus = res.data.map(challenge => ({
          ...challenge,
          isJoined: challenge.participants.some(p => p.user === user._id)
        }));
        setChallenges(challengesWithJoinStatus);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch challenges.');
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user._id]);

  const joinChallenge = async (challengeId) => {
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      await axios.post(`/api/challenges/${challengeId}/join`, {}, config);
      setChallenges(prev => prev.map(c => 
        c._id === challengeId ? { ...c, isJoined: true, participants: [...c.participants, { user: user._id, joinedAt: new Date(), progress: 0 }] } : c
      ));
      toast.success('Successfully joined the challenge!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || 'Failed to join challenge');
    }
  };

  const leaveChallenge = async (challengeId) => {
    try {
      // Assuming there's a leave endpoint or simply remove from frontend for now
      // If a backend endpoint is needed, it would be similar to joinChallenge
      setChallenges(prev => prev.map(c => 
        c._id === challengeId ? { ...c, isJoined: false, participants: c.participants.filter(p => p.user !== user._id) } : c
      ));
      toast.success('Left the challenge');
    } catch (error) {
      console.error(error);
      toast.error('Failed to leave challenge');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Waste Reduction': return <Leaf className="w-4 h-4" />;
      case 'Transportation': return <Zap className="w-4 h-4" />;
      case 'Energy': return <Target className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading challenges...</p>
        </div>
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const joinedChallenges = challenges.filter(c => c.isJoined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Eco-Challenges</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join exciting challenges, compete with eco-warriors, and earn rewards while saving the planet
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{activeChallenges.length}</h3>
              <p className="text-gray-600">Active Challenges</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{joinedChallenges.length}</h3>
              <p className="text-gray-600">Joined</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {joinedChallenges.reduce((sum, c) => sum + c.ecoPoints, 0)}
              </h3>
              <p className="text-gray-600">Points Available</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Challenges ({activeChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'joined'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Challenges ({joinedChallenges.length})
          </button>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(activeTab === 'active' ? activeChallenges : joinedChallenges).map((challenge) => (
            <div key={challenge._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Challenge Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(challenge.category)}
                      <span className="text-sm font-medium text-gray-500">{challenge.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{challenge.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    {challenge.isJoined && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Joined</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar for joined challenges */}
                {challenge.isJoined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Challenge Stats */}
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{challenge.duration}</div>
                    <div className="text-xs text-gray-500">Days</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{challenge.participants.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Participants</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{challenge.ecoPoints}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">{challenge.carbonSaved} kg</div>
                    <div className="text-xs text-gray-500">CO₂ Saved</div>
                  </div>
                </div>
              </div>

              {/* Challenge Footer */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{getDaysRemaining(challenge.endDate)} days remaining</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{challenge.rewards.length} rewards</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {challenge.isJoined ? (
                    <>
                      <button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Update Progress</span>
                      </button>
                      <button
                        onClick={() => leaveChallenge(challenge._id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        Leave
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => joinChallenge(challenge._id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Join Challenge</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedChallenge(challenge)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {activeTab === 'joined' && joinedChallenges.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Challenges Joined Yet</h3>
            <p className="text-gray-500 mb-6">Join your first eco-challenge and start earning rewards!</p>
            <button
              onClick={() => setActiveTab('active')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Challenges
            </button>
          </div>
        )}

        {/* Challenge Details Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedChallenge.title}</h2>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-6">{selectedChallenge.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {selectedChallenge.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Rewards</h4>
                    <ul className="space-y-1">
                      {selectedChallenge.rewards.map((reward, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span>{reward}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {!selectedChallenge.isJoined ? (
                    <button
                      onClick={() => {
                        joinChallenge(selectedChallenge._id);
                        setSelectedChallenge(null);
                      }}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Join Challenge
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedChallenge(null)}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Update Progress
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
