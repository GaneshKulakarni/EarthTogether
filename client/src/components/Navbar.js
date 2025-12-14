import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Leaf, LogOut, Search, User } from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import axios from 'axios';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/users/search?q=${query}`, {
        headers: { 'x-auth-token': token }
      });
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Search */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">EarthTogether</span>
              </Link>
              
              {/* Search Bar */}
              {isAuthenticated && (
                <div className="hidden md:block relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    placeholder="Search users..."
                    className="w-48 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleUserSelect(user._id)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition"
                        >
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user.username}</p>
                            {user.bio && <p className="text-sm text-gray-600 truncate">{user.bio}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-4 ml-auto">
                <Link to="/welcome" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-green-50">Home</Link>
                <Link to="/challenges" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-green-50">Challenges</Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-green-50">Dashboard</Link>
                <Link to="/chat" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-green-50">Chats</Link>
                <Link to="/profile" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-green-50">Profile</Link>
                <button onClick={handleLogout} className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <div className="md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-green-600 p-2">
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link to="/welcome" className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/challenges" className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Challenges</Link>
              <Link to="/dashboard" className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link to="/chat" className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Chats</Link>
              <Link to="/profile" className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Profile</Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium">Logout</button>
            </div>
          </div>
        )}
      </nav>

      <UserProfileModal 
        userId={selectedUserId} 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </>
  );
};

export default Navbar;
