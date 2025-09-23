import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePost } from '../context/PostContext';
import { useNotifications } from '../context/NotificationContext';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { posts, loading, fetchPosts, addPost, toggleLike, addComment, sharePost } = usePost();
  const { fetchNotifications } = useNotifications();
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'General' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = (postId) => toggleLike(postId);

  const handleComment = async (postId) => {
    const content = commentText[postId];
    if (!content?.trim()) return;
    
    await addComment(postId, content);
    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleShare = (postId) => sharePost(postId);

  const toggleComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    
    try {
      const postData = {
        content: newPost.content,
        category: newPost.category
      };
      
      if (selectedImage) {
        postData.imageUrl = imagePreview;
      }
      
      await addPost(postData);
      
      setNewPost({ content: '', category: 'General' });
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreatePost(false);
    } catch (error) {
      alert('Failed to create post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 EarthTogether Feed</h1>
          <p className="text-gray-600">Your daily dose of eco-inspiration and community updates</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          {!showCreatePost ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <button 
                onClick={() => setShowCreatePost(true)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-left text-gray-500 transition-colors"
              >
                Share your eco-journey...
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.username || 'User'}</h3>
                  <select 
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="text-sm text-gray-600 bg-transparent border-none focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Tip">Tip</option>
                    <option value="Question">Question</option>
                    <option value="Challenge">Challenge</option>
                  </select>
                </div>
              </div>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's your eco-story today?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-green-500"
                rows={4}
              />

              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm">Click to add an image</span>
                    </>
                  )}
                </label>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPost({ content: '', category: 'General' });
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.content.trim()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id || post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Post Header */}
              <div className="p-4 pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                      {post.user.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                      <p className="text-sm text-gray-500">{post.user.title} • {post.timeAgo}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <p className="text-gray-800 mb-4">{post.content}</p>
                
                {/* Post Image */}
                {post.image && (
                  <img 
                    src={post.image} 
                    alt="Post content" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
              </div>

              {/* Post Stats */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.likes} likes</span>
                  <div className="flex space-x-4">
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex items-center justify-around">
                  <button 
                    onClick={() => handleLike(post.id || post._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      post.liked 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                  </button>
                  
                  <button 
                    onClick={() => toggleComments(post.id || post._id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Comment</span>
                  </button>
                  
                  <button 
                    onClick={() => handleShare(post.id || post._id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id || post._id] && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post.id || post._id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id || post._id]: e.target.value })}
                        className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id || post._id)}
                      />
                      <button
                        onClick={() => handleComment(post.id || post._id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Sample comments */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                        J
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-lg px-3 py-2">
                          <p className="text-sm font-semibold text-gray-900">John Eco</p>
                          <p className="text-sm text-gray-700">Great work! This is so inspiring! 🌱</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-3">2h ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;