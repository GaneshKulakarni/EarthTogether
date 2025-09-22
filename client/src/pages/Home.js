import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPosts,
  likePost,
  commentOnPost,
  sharePost,
  createPost,
} from "../services/api";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, duration: 0.5 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", category: "General" });

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      user: { name: "Sarah Green", avatar: "🌱", title: "Environmental Activist" },
      content:
        "Just completed my 30-day plastic-free challenge! 🌍 Reduced my waste by 80% and discovered so many sustainable alternatives.",
      image:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop",
      likes: 24,
      comments: 8,
      shares: 3,
      timeAgo: "2h",
      liked: false,
      category: "Waste Reduction",
    },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setPosts(mockPosts); // Always show mock posts first
      try {
        const data = await getPosts();
        if (data && data.length > 0) {
          const formattedPosts = data.map((post) => ({
            id: post._id,
            _id: post._id,
            user: {
              name: post.user?.username || "User",
              avatar: "🌱",
              title: "EarthTogether Member",
            },
            content: post.content,
            image: post.imageUrl || null,
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            shares: post.shares?.length || 0,
            timeAgo: new Date(post.createdAt).toLocaleDateString(),
            liked: false,
            category: post.category || "General",
          }));
          setPosts([...formattedPosts, ...mockPosts]);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setPosts(
        posts.map((post) =>
          post.id === postId || post._id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId) => {
    const content = commentText[postId];
    if (!content?.trim()) return;

    try {
      await commentOnPost(postId, content);
      setPosts(
        posts.map((post) =>
          post.id === postId || post._id === postId
            ? { ...post, comments: post.comments + 1 }
            : post
        )
      );
      setCommentText({ ...commentText, [postId]: "" });
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  const handleShare = async (postId) => {
    try {
      await sharePost(postId);
      setPosts(
        posts.map((post) =>
          post.id === postId || post._id === postId
            ? { ...post, shares: post.shares + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error sharing post:", error);
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
        category: newPost.category,
      };

      const savedPost = await createPost(postData);

      const newPostObj = {
        id: savedPost._id,
        _id: savedPost._id,
        user: {
          name: user?.username || "User",
          avatar: "🌱",
          title: "EarthTogether Member",
        },
        content: newPost.content,
        image: null,
        likes: 0,
        comments: 0,
        shares: 0,
        timeAgo: "now",
        liked: false,
        category: newPost.category,
      };

      setPosts([newPostObj, ...posts]);
      setNewPost({ content: "", category: "General" });
      setShowCreatePost(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
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
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg mb-6">
          <span className="text-3xl">🏠</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-4">
          EarthTogether Feed
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your daily dose of eco-inspiration, community posts, and sustainability
          updates
        </p>
      </div>

      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        {!showCreatePost ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.[0]?.toUpperCase() || "U"}
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
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user?.username || "User"}
                </h3>
                <select
                  value={newPost.category}
                  onChange={(e) =>
                    setNewPost({ ...newPost, category: e.target.value })
                  }
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
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
              placeholder="What's your eco-story today?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-green-500"
              rows={4}
            />
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setShowCreatePost(false);
                  setNewPost({ content: "", category: "General" });
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
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">
            No posts yet. Be the first to share!
          </p>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post._id || post.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {/* Post Header */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  {post.user.avatar}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">
                    {post.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {post.user.title} • {post.timeAgo}
                  </p>
                </div>
                <button className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {post.category}
                </span>
                <p className="text-gray-800 mt-2">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-64 object-cover rounded-lg mt-4"
                  />
                )}
              </div>

              {/* Post Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-2">
                <span>{post.likes} likes</span>
                <div className="flex space-x-4">
                  <span>{post.comments} comments</span>
                  <span>{post.shares} shares</span>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-around mt-3 border-t border-gray-100 pt-3">
                <button
                  onClick={() => handleLike(post.id || post._id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    post.liked
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${post.liked ? "fill-current" : ""}`}
                  />
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

              {/* Comments Section */}
              {showComments[post.id || post._id] && (
                <div className="mt-4 border-t border-gray-100 pt-3 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post.id || post._id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post.id || post._id]: e.target.value,
                          })
                        }
                        className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-500"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleComment(post.id || post._id)
                        }
                      />
                      <button
                        onClick={() => handleComment(post.id || post._id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sample Comment */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                        J
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-lg px-3 py-2">
                          <p className="text-sm font-semibold text-gray-900">
                            John Eco
                          </p>
                          <p className="text-sm text-gray-700">
                            Great work! This is so inspiring! 🌱
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-3">2h ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Home;
