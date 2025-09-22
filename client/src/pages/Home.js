import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion'; // Import motion

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.03, rotate: 1, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)" },
    tap: { scale: 0.98 },
  };

  const containerVariants = {
    visible: { transition: { staggerChildren: 0.1 } },
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        };
        const res = await axios.get('/api/posts', config);
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch posts.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-8">Loading posts...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg mb-6">
          <span className="text-3xl">🏠</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-4">
          EarthTogether Feed
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Your daily dose of eco-inspiration, community posts, and sustainability updates</p>
      </div>
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet. Be the first to share!</p>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post._id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <div className="flex items-center mb-4">
                <img
                  src={post.user.avatar || 'https://via.placeholder.com/40'}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full mr-4 object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{post.user.username}</h2>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-green-600 mb-2">Category: {post.category}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
              )}
              <p className="text-gray-700 mb-4">{post.content}</p>
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <div className="flex items-center space-x-4">
                  <span>{post.likes.length} Likes</span>
                  <span>{post.comments.length} Comments</span>
                </div>
                <span>{post.ecoImpact} EcoPoints</span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Home;