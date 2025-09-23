import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, Trophy, Target, Zap, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const featureItems = [
  {
    icon: <Leaf className="w-8 h-8 text-green-600" />,
    title: "Track Eco-Habits",
    description: "Monitor your daily sustainable actions and build consistent eco-friendly routines.",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    icon: <Users className="w-8 h-8 text-blue-600" />,
    title: "Community Support",
    description: "Connect with like-minded individuals and share your eco-journey with the world.",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    icon: <Trophy className="w-8 h-8 text-purple-600" />,
    title: "Earn Rewards",
    description: "Get recognized for your contributions with badges, certificates, and eco-points.",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    icon: <Target className="w-8 h-8 text-yellow-600" />,
    title: "Join Challenges",
    description: "Participate in fun eco-challenges and compete with others to make a difference.",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
  },
  {
    icon: <Zap className="w-8 h-8 text-red-600" />,
    title: "Learn & Grow",
    description: "Access educational content, quizzes, and tips to expand your environmental knowledge.",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
  },
  {
    icon: <Globe className="w-8 h-8 text-indigo-600" />,
    title: "Global Impact",
    description: "See the real impact of your actions with carbon savings and environmental metrics.",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-600",
  },
];

const Landing = () => {
  const {user} = useAuth();

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const ctaButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } },
    hover: { scale: 1.05, boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        className="relative overflow-hidden"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="./videos/landing_video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div> {/* Overlay for text readability */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-20">
          <div className="text-center">
            <motion.h1
              variants={heroVariants}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              🌍 EarthTogether
            </motion.h1>
            <motion.p
              variants={heroVariants}
              transition={{ delay: 0.2, ...heroVariants.visible.transition }}
              className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto"
            >
              Join the global movement to save our planet. Track eco-habits, share your journey, 
              and inspire millions to act daily for the environment.
            </motion.p>
            <motion.div
              variants={heroVariants}
              transition={{ delay: 0.4, ...heroVariants.visible.transition }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!user ? <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Get Started
              </Link> : ''}
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
               {user ? 'Profile' : 'Sign In'}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EarthTogether?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make sustainable living fun, social, and rewarding through gamification 
              and community support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureItems.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * index + 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)" }}
                className="text-center p-6 bg-gray-50 rounded-lg shadow-md"
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        transition={{ delay: 1.0, ...heroVariants.visible.transition }}
        className="py-20 bg-gradient-to-r from-green-500 to-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white mb-8">
            Join thousands of eco-warriors already making the world a better place, one habit at a time.
          </p>
          {!user && (
            <motion.div
              variants={ctaButtonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="/register"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 inline-block"
              >
                Start Your Eco-Journey Today
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
