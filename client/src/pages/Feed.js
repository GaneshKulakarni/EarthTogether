import React, { useState, useEffect } from 'react';
import { Plus, Image, Send } from 'lucide-react';
import PostCard from '../components/PostCard';
import axios from 'axios';
import toast from 'react-hot-toast';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userChallenges, setUserChallenges] = useState([]);
  const [newPost, setNewPost] = useState({
    content: '',
    category: 'energy',
    type: 'eco-action'
  });

  useEffect(() => {
    fetchPosts();
    fetchUserChallenges();
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

  const fetchUserChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/challenges', {
        headers: { 'x-auth-token': token }
      });
      const joinedChallenges = response.data.filter(challenge => 
        challenge.participants.some(p => p.user === JSON.parse(localStorage.getItem('user'))?._id)
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
      const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
      const post = posts.find(p => p._id === postId);
      const wasLiked = post?.likes?.some(like => 
        (typeof like.user === 'object' ? like.user._id : like.user) === currentUserId
      );
      
      const response = await axios.put(`/api/posts/like/${postId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Show notification if user just liked someone else's post
      const isNowLiked = response.data.likes?.some(like => 
        (typeof like.user === 'object' ? like.user._id : like.user) === currentUserId
      );
      
      if (!wasLiked && isNowLiked && response.data.user._id !== currentUserId) {
        toast.success(`You liked ${response.data.user.username}'s post! ❤️`, {
          duration: 3000
        });
      }
      
      // Update local state with complete post data
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? response.data
            : post
        )
      );
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
    <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Eco-Feed</h1>
          <p className="text-gray-400 text-sm mt-1">Share your eco-journey and get inspired by others</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="dark-btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <div className="dark-card p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Share Your Eco-Action</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="dark-label">Type</label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  className="dark-input"
                >
                  <option value="eco-action">Eco Action</option>
                  <option value="tip">Eco Tip</option>
                  <option value="achievement">Achievement</option>
                  <option value="challenge">Challenge</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="dark-label">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="dark-input"
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
              <label className="dark-label">What's on your mind?</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows="4"
                className="dark-input"
                placeholder="Share your eco-action, tip, or achievement..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="dark-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="dark-btn-primary"
              >
                <Send className="w-4 h-4 mr-1" />
                <span>Share</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="dark-card dark-empty p-8 sm:p-12 text-center">
            <Image className="w-14 h-14 text-gray-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-4 text-sm">Be the first to share your eco-journey!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="dark-btn-primary"
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
              onJoinChallenge={joinChallenge}
              userChallenges={userChallenges}
            />
          ))
        )}
      </div>
    </div>
  );
};


export default Feed;
