import React, { useState, useEffect } from 'react';

import { Plus, Image, Send } from 'lucide-react';
import PostCard from '../components/PostCard';
import axios from 'axios';
import toast from 'react-hot-toast';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    category: 'energy',
    type: 'eco-action'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) {
      toast.error('Please write something to share!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/posts', newPost, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Post shared successfully!');
      setNewPost({ content: '', category: 'energy', type: 'eco-action' });
      setShowCreateForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/posts/like/${postId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchPosts(); // Refresh to get updated like count
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/posts/comment/${postId}`, { content: comment }, {
        headers: { 'x-auth-token': token }
      });
      fetchPosts(); // Refresh to get new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eco-Feed</h1>
            <p className="text-gray-600 mt-2">Share your eco-journey and get inspired by others</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>

        {/* Create Post Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Eco-Action</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="eco-action">Eco Action</option>
                    <option value="tip">Eco Tip</option>
                    <option value="achievement">Achievement</option>
                    <option value="challenge">Challenge</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="energy">Energy</option>
                    <option value="waste">Waste</option>
                    <option value="transport">Transport</option>
                    <option value="water">Water</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Share your eco-action, tip, or achievement..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share your eco-journey!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Share Your First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};


export default Feed;
