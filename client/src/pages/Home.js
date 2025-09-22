import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPosts, likePost, commentOnPost, sharePost, createPost } from '../services/api';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'General' });

  // Mock posts data with plant images
  const mockPosts = [
    {
      id: 1,
      user: { name: 'Sarah Green', avatar: '🌱', title: 'Environmental Activist' },
      content: 'Just completed my 30-day plastic-free challenge! 🌍 Reduced my waste by 80% and discovered so many sustainable alternatives. Small changes make a big difference!',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop',
      likes: 24,
      comments: 8,
      shares: 3,
      timeAgo: '2h',
      liked: false,
      category: 'Waste Reduction'
    },
    {
      id: 2,
      user: { name: 'Mike Ocean', avatar: '🌊', title: 'Marine Biologist' },
      content: 'Incredible news! Our local beach cleanup removed 500kg of plastic waste this weekend. Thank you to all 50 volunteers who joined us! 🏖️',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop',
      likes: 156,
      comments: 23,
      shares: 12,
      timeAgo: '4h',
      liked: true,
      category: 'Ocean Conservation'
    },
    {
      id: 3,
      user: { name: 'Emma Solar', avatar: '☀️', title: 'Renewable Energy Engineer' },
      content: 'My home solar panels generated 150% of our energy needs this month! Selling the excess back to the grid. Solar is the future! ⚡',
      image: 'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=500&h=300&fit=crop',
      likes: 89,
      comments: 15,
      shares: 7,
      timeAgo: '6h',
      liked: false,
      category: 'Renewable Energy'
    },
    {
      id: 4,
      user: { name: 'Alex Forest', avatar: '🌳', title: 'Urban Gardener' },
      content: 'Started my rooftop garden 6 months ago and now I\'m growing 15 different vegetables! 🥬 Nothing beats homegrown organic food. Who else is growing their own food?',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop',
      likes: 67,
      comments: 19,
      shares: 8,
      timeAgo: '8h',
      liked: false,
      category: 'Urban Farming'
    },
    {
      id: 5,
      user: { name: 'Luna Plant', avatar: '🌿', title: 'Botanist' },
      content: 'Did you know that indoor plants can improve air quality by up to 87%? 🌱 Just added this beautiful peace lily to my collection. Nature is the best air purifier!',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=300&fit=crop',
      likes: 134,
      comments: 31,
      shares: 15,
      timeAgo: '12h',
      liked: true,
      category: 'Indoor Plants'
    },
    {
      id: 6,
      user: { name: 'Carlos Verde', avatar: '🌾', title: 'Permaculture Designer' },
      content: 'Transformed my backyard into a food forest! 🌳 Now producing 200kg of organic food annually while supporting local wildlife. Permaculture works!',
      image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=500&h=300&fit=crop',
      likes: 203,
      comments: 45,
      shares: 28,
      timeAgo: '1d',
      liked: false,
      category: 'Permaculture'
    },
    {
      id: 7,
      user: { name: 'Maya Bloom', avatar: '🌺', title: 'Pollinator Advocate' },
      content: 'Created a bee-friendly garden and counted 12 different pollinator species this week! 🐝 Every flower matters for our ecosystem. Plant native, save the bees!',
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=300&fit=crop',
      likes: 178,
      comments: 27,
      shares: 19,
      timeAgo: '1d',
      liked: true,
      category: 'Biodiversity'
    },
    {
      id: 8,
      user: { name: 'River Stone', avatar: '🍃', title: 'Sustainability Coach' },
      content: 'Composting update: 6 months of kitchen scraps turned into 50kg of rich soil! 🌱 My plants have never been happier. Waste to wealth in action!',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop',
      likes: 92,
      comments: 16,
      shares: 11,
      timeAgo: '2d',
      liked: false,
      category: 'Composting'
    },
    {
      id: 9,
      user: { name: 'Sage Wisdom', avatar: '🌲', title: 'Forest Conservationist' },
      content: 'Planted 100 native trees this month with local volunteers! 🌳 Each tree will absorb 22kg of CO2 annually. Together we\'re rebuilding our forests!',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop',
      likes: 267,
      comments: 38,
      shares: 42,
      timeAgo: '3d',
      liked: true,
      category: 'Reforestation'
    },
    {
      id: 10,
      user: { name: 'Ivy Green', avatar: '🌿', title: 'Vertical Garden Expert' },
      content: 'My living wall is thriving! 🌱 40 plants in 2 square meters, producing herbs and purifying air. Vertical gardening is perfect for small spaces!',
      image: 'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=500&h=300&fit=crop',
      likes: 145,
      comments: 22,
      shares: 17,
      timeAgo: '4d',
      liked: false,
      category: 'Vertical Gardening'
    }
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      // Always start with mock posts to ensure content is visible
      setPosts(mockPosts);
      
      try {
        const data = await getPosts();
        if (data && data.length > 0) {
          // Format real posts to match UI structure
          const formattedPosts = data.map(post => ({
            id: post._id,
            _id: post._id,
            user: {
              name: post.user?.username || 'User',
              avatar: '🌱',
              title: 'EarthTogether Member'
            },
            content: post.content,
            image: post.imageUrl || null,
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            shares: post.shares?.length || 0,
            timeAgo: new Date(post.createdAt).toLocaleDateString(),
            liked: false,
            category: post.category || 'General'
          }));
          // Add real posts to the top of mock posts
          setPosts([...formattedPosts, ...mockPosts]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Mock posts are already set, so just continue
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setPosts(posts.map(post => 
        post.id === postId || post._id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    const content = commentText[postId];
    if (!content?.trim()) return;
    
    try {
      await commentOnPost(postId, content);
      setPosts(posts.map(post => 
        post.id === postId || post._id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      ));
      setCommentText({ ...commentText, [postId]: '' });
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleShare = async (postId) => {
    try {
      await sharePost(postId);
      setPosts(posts.map(post => 
        post.id === postId || post._id === postId
          ? { ...post, shares: post.shares + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;
    
    try {
      const postData = {
        content: newPost.content,
        category: newPost.category
      };
      
      // Save to backend first
      const savedPost = await createPost(postData);
      
      // Create formatted post object
      const newPostObj = {
        id: savedPost._id,
        _id: savedPost._id,
        user: { 
          name: user?.username || 'User', 
          avatar: '🌱', 
          title: 'EarthTogether Member' 
        },
        content: newPost.content,
        image: null,
        likes: 0,
        comments: 0,
        shares: 0,
        timeAgo: 'now',
        liked: false,
        category: newPost.category
      };
      
      // Add to posts at the top
      setPosts([newPostObj, ...posts]);
      
      // Reset form
      setNewPost({ content: '', category: 'General' });
      setShowCreatePost(false);
      
    } catch (error) {
      console.error('Error creating post:', error);
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 EarthTogether Feed</h1>
          <p className="text-gray-600">Your daily dose of eco-inspiration and community updates</p>
        </div>

        {/* Create Post */}
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
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="What's your eco-story today?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-green-500"
                rows={4}
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {setShowCreatePost(false); setNewPost({content: '', category: 'General'});}}
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
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
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