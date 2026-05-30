import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  Globe,
  Users,
  Award,
  TrendingUp,
  BarChart2,
  CheckCircle,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  Flame,
  Target,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- Stat Counter Component for Stats Section ---
const StatCard = ({ valueStr, endValue, label, icon }) => {
  const [count, setCount] = useState(0);
  const cardRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * endValue));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(endValue);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [endValue]);

  return (
    <div
      ref={cardRef}
      className="dark-card p-6 flex flex-col items-center text-center relative overflow-hidden"
      style={{
        background: 'rgba(26, 32, 48, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)';
        e.currentTarget.style.boxShadow = '0 0 25px rgba(52, 211, 153, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          color: '#34d399',
        }}
      >
        {icon}
      </div>
      <div className="text-3xl font-extrabold text-white mb-2">
        {count}
        {valueStr.replace(/[0-9]/g, '')}
      </div>
      <div className="text-sm font-medium text-gray-400">{label}</div>
    </div>
  );
};

export default function AboutUs() {
  const { isAuthenticated } = useAuth();

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: 'Inter, sans-serif',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background Animated Particles/Glows */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.06) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px 80px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* ================= HERO SECTION ================= */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center py-16 md:py-24 relative"
        >
          {/* Subtle Floating Leaf */}
          <motion.div
            animate={{
              y: [0, -12, 0],
              rotate: [0, 8, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              fontSize: '48px',
              display: 'inline-block',
              marginBottom: '20px',
            }}
          >
            🍃
          </motion.div>

          <h1
            className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6"
            style={{
              lineHeight: 1.15,
            }}
          >
            We're not just an app.<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              We're a movement.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 font-medium leading-relaxed">
            EarthTogether is where your daily eco-choices become visible, celebrated, and contagious.
          </p>

          <p className="text-sm md:text-md text-emerald-400 font-semibold uppercase tracking-wider max-w-2xl mx-auto">
            A community platform that turns sustainable living into a habit, a game, and a social experience — all in one place.
          </p>
        </motion.section>

        {/* ================= WHAT IS EARTHTOGETHER? ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="py-12 border-t border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Visual Icon with Glow */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center relative"
            >
              <div
                style={{
                  width: '260px',
                  height: '260px',
                  borderRadius: '30%',
                  background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.2)',
                  boxShadow: '0 0 40px rgba(52, 211, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Globe size={110} color="#34d399" style={{ opacity: 0.8 }} />
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: '-10px',
                    borderRadius: '30%',
                    border: '1.5px dashed rgba(52, 211, 153, 0.3)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </motion.div>

            {/* Right Column: Story Copy */}
            <motion.div variants={itemVariants} className="flex flex-col justify-center">
              <h2 className="text-3xl font-extrabold text-white mb-6 flex items-center gap-3">
                <Leaf className="text-emerald-400" size={28} /> What Is EarthTogether?
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed font-normal">
                <p>
                  Every year, millions of people want to live more sustainably. They read the articles, feel the guilt, try for a week — and then quietly stop. Not because they don't care. Because there's no system, no community, and no reason to keep going.
                </p>
                <p className="font-semibold text-white">
                  EarthTogether was built to fix that.
                </p>
                <p>
                  We created a platform that treats eco-living the way Duolingo treats language learning — with streaks, points, social accountability, and genuine fun. We mixed that with the social feed you love from Instagram and the professional recognition you find on LinkedIn, but made it entirely about one thing: our planet.
                </p>
                <p>
                  The result? A space where your eco-actions are tracked, shared, rewarded, and celebrated — by a community that actually gets it.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Our Mission Glass Card */}
          <motion.div
            variants={itemVariants}
            className="mt-12 p-8 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 32, 48, 0.5) 0%, rgba(13, 17, 23, 0.5) 100%)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Target size={30} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Our Mission</h3>
                <p className="text-gray-300 leading-relaxed">
                  To make sustainable living the easiest, most rewarding, and most social thing you do every day.
                  We believe the future of the planet doesn't rest in the hands of governments alone. It rests in the hands of everyday people, making better choices, one habit at a time. EarthTogether is the accountability partner, the community, and the celebration space you never had for going green.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ================= HOW IT WORKS (6-Step Flow) ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="py-16 border-t border-gray-800"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">How EarthTogether Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Follow our simple, gamified loop designed to turn small daily actions into massive global impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Track Your Habits',
                icon: <Leaf size={22} />,
                desc: 'Build a personal eco-routine. Log daily actions like reducing plastic, saving water, cycling instead of driving, or composting your kitchen waste. Each habit earns you eco-points and keeps your streak alive.',
              },
              {
                step: '02',
                title: 'Join the Community',
                icon: <Users size={22} />,
                desc: 'Share your eco-journey through posts and photos on the unified home feed. Discover what others are doing, get inspired by eco-leaders, and celebrate milestones together.',
              },
              {
                step: '03',
                title: 'Take On Challenges',
                icon: <Award size={22} />,
                desc: 'Join time-bound eco-challenges, upload evidence of your actions, and unlock exclusive badges and achievement certificates. Healthy competition, real-world impact.',
              },
              {
                step: '04',
                title: 'Learn and Explore',
                icon: <BookOpen size={22} />,
                desc: 'Dive into our research section, read curated eco-news, flip through sustainability flashcards, and test your knowledge with eco-quizzes. Every interaction earns you points.',
              },
              {
                step: '05',
                title: 'Measure Your Impact',
                icon: <TrendingUp size={22} />,
                desc: "Track the waste you've avoided — plastic, paper, e-waste. See your estimated carbon savings auto-calculated in real time. Because what gets measured, gets improved.",
              },
              {
                step: '06',
                title: 'Earn Recognition',
                icon: <CheckCircle size={22} />,
                desc: 'Rise on the leaderboard, unlock badges, and earn auto-generated achievement certificates that prove your eco-commitment — to yourself and the world.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="dark-card p-6 flex flex-col relative overflow-hidden"
                style={{
                  background: 'rgba(22, 27, 34, 0.4)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(52, 211, 153, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="absolute top-4 right-4 text-xs font-black text-emerald-500/25 tracking-widest">
                  STEP {item.step}
                </div>
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-5 text-emerald-400"
                  style={{
                    background: 'rgba(52, 211, 153, 0.08)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ================= THE PROBLEM WE'RE SOLVING ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="py-16 px-6 md:px-12 rounded-3xl relative overflow-hidden my-8"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 78, 59, 0.08) 100%)',
            border: '1px solid rgba(52, 211, 153, 0.15)',
          }}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4">The Problem We're Solving</h2>
            <p className="text-gray-300 leading-relaxed font-normal">
              The climate crisis is real, but motivation fades. Most sustainability apps are boring trackers. Most communities are passive news feeds. Nobody is making eco-living feel like something worth showing up for every single day.
              <br />
              <span className="font-semibold text-emerald-400 mt-2 block">
                That's the gap we fill. EarthTogether is built on one key insight: people don't change habits alone. They change them together.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Streaks & Gamification',
                icon: <Flame size={20} />,
                desc: 'Never miss a day when your streak is on the line. Eco-points, badges, and leaderboards make sustainability addictive.',
              },
              {
                title: 'Community & Social Feed',
                icon: <Users size={20} />,
                desc: 'Share your journey, discover others, and feel the power of collective action. Going green alone is hard. Going green together is unstoppable.',
              },
              {
                title: 'Real Impact Tracking',
                icon: <BarChart2 size={20} />,
                desc: 'See your actual carbon savings and waste reduction. This isn\'t about feeling good — it\'s about doing good, measurably.',
              },
            ].map((prop, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(13, 17, 23, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                  {prop.icon}
                </div>
                <h4 className="text-md font-bold text-white mb-2">{prop.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ================= CHALLENGES & ACHIEVEMENTS SHOWCASE ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="py-16 border-t border-gray-800"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Prove Your Impact. Earn What You Deserve.
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              On EarthTogether, your eco-actions don't disappear into thin air. Every challenge you complete, every habit you maintain, and every milestone you hit gets recognized — visibly, officially, and permanently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Plastic-Free Week',
                badge: 'Ocean Guardian',
                desc: 'Go 7 days without single-use plastic. Document your alternatives, share your journey, and prove it to the community.',
                emoji: '🌊',
              },
              {
                title: 'Zero-Carbon Commute Challenge',
                badge: 'Green Commuter',
                desc: 'Walk, cycle, or use public transport for 10 consecutive days. Upload your daily log and earn the Green Commuter certificate.',
                emoji: '🚴',
              },
              {
                title: '30-Day Habit Streak',
                badge: 'Streak Master',
                desc: 'Maintain any eco-habit for 30 straight days. Consistency is the hardest part — and the most rewarded.',
                emoji: '🌱',
              },
              {
                title: 'Waste Warrior',
                badge: 'Waste Warrior',
                desc: 'Track and reduce your household waste across plastic, paper, and e-waste over one month. Hit your target.',
                emoji: '🗑️',
              },
              {
                title: 'Eco-Knowledge Quiz Champion',
                badge: 'EcoScholar',
                desc: 'Score 100% on 5 different eco-quizzes. Show the world you don\'t just act green — you think green.',
                emoji: '💡',
              },
              {
                title: 'Community Champion',
                badge: 'Community Champion',
                desc: 'Post 10 eco-updates, encourage 5 peers, and help someone complete their first challenge.',
                emoji: '🤝',
              },
            ].map((ch, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="dark-card p-6 flex flex-col relative overflow-hidden group"
                style={{
                  background: 'rgba(26, 32, 48, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(52, 211, 153, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Badge corner icon */}
                <div className="absolute top-4 right-4 text-emerald-400/30 group-hover:text-emerald-400 transition-colors duration-300">
                  <Award size={18} />
                </div>

                <div className="text-3xl mb-4">{ch.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{ch.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{ch.desc}</p>
                <div
                  className="mt-auto pt-3 border-t border-gray-800 text-xs font-semibold flex items-center gap-1.5"
                  style={{ color: '#34d399' }}
                >
                  <Sparkles size={12} /> Reward: {ch.badge}
                </div>
              </motion.div>
            ))}
          </div>

          <div
            className="mt-10 p-6 rounded-2xl text-center max-w-4xl mx-auto"
            style={{
              background: 'rgba(22, 27, 34, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.03)',
            }}
          >
            <p className="text-gray-300 text-sm leading-relaxed">
              Every badge you earn shows up on your public profile. Every certificate is auto-generated with your name, the challenge, and the date — ready to download and share on LinkedIn, Instagram, or wherever you want the world to see your commitment.
              <br />
              <span className="font-semibold text-emerald-400 block mt-2">
                This isn't just a game. These are proof of real action. Real change. And real dedication to the planet.
              </span>
            </p>
          </div>
        </motion.section>

        {/* ================= ACHIEVEMENT TIERS (Progress Ladder) ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="py-16 border-t border-gray-800"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-3">Your Eco-Journey Has Levels</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From an absolute beginner planting their first habit to a seasoned carbon-neutral champion.
            </p>
          </div>

          {/* Ladder visual representation */}
          <div className="relative flex flex-col md:flex-row justify-between items-stretch gap-8 md:gap-4 px-4">
            {/* Dashed connector line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-emerald-500/20 md:left-4 md:right-4 md:top-1/2 md:bottom-auto md:w-auto md:h-0.5 md:border-t-2 md:border-l-0"
              style={{ transform: 'translate(-50%, 0)', zIndex: 1 }}
            />

            {[
              {
                title: 'Seedling',
                icon: '🌿',
                desc: 'Just getting started. Your first habit logged, your first post shared.',
                active: false,
              },
              {
                title: 'Eco-Advocate',
                icon: '🌳',
                desc: '7-day streak, first challenge completed, first badge earned.',
                active: false,
              },
              {
                title: 'Green Champion',
                icon: '🔥',
                desc: '30-day streak, 3 challenges completed, active community member.',
                active: false,
              },
              {
                title: 'EarthGuardian',
                icon: '🌍',
                desc: 'Multiple streaks, leaderboard presence, 5+ badges, certified eco-leader.',
                active: true, // Pulsing active state
              },
              {
                title: 'Planet Hero',
                icon: '🏅',
                desc: 'Top of the leaderboard, all major challenges completed, recognized by the community.',
                active: false,
              },
            ].map((tier, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex-1 relative z-10 flex flex-col items-center text-center"
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: tier.active
                      ? 'radial-gradient(circle, #34d399 0%, #059669 100%)'
                      : 'rgba(26, 32, 48, 0.8)',
                    border: tier.active
                      ? '3px solid #6ee7b7'
                      : '2px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: tier.active
                      ? '0 0 25px rgba(52, 211, 153, 0.5), 0 0 50px rgba(52, 211, 153, 0.2)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    marginBottom: '16px',
                    position: 'relative',
                    animation: tier.active ? 'pulseGlow 2.5s infinite ease-in-out' : 'none',
                  }}
                >
                  {tier.icon}
                  {tier.active && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <h4
                  className="font-bold text-md mb-2"
                  style={{ color: tier.active ? '#34d399' : '#fff' }}
                >
                  {tier.title}
                </h4>
                <p className="text-gray-400 text-xs px-2 leading-relaxed max-w-xs">{tier.desc}</p>
              </motion.div>
            ))}
          </div>

          <style>{`
            @keyframes pulseGlow {
              0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(52, 211, 153, 0.4); }
              50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(52, 211, 153, 0.6); }
            }
          `}</style>
        </motion.section>

        {/* ================= THE TEAM ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="py-16 border-t border-gray-800"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              The People Behind EarthTogether
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              EarthTogether was designed and built by a team of passionate developers who believe technology can be a force for environmental good. We're students, builders, and eco-advocates — united by the conviction that a better planet starts with better daily habits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto justify-center">
            {[
              { name: 'Ganesh K.', role: 'Founder & Full Stack Lead', initials: 'GK' },
              { name: 'Ajay K.', role: 'Lead Architect', initials: 'AK' },
              { name: 'Rohan S.', role: 'Frontend Engineer', initials: 'RS' },
            ].map((member, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="dark-card p-6 flex flex-col items-center text-center"
                style={{
                  background: 'rgba(26, 32, 48, 0.25)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '16px',
                }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-emerald-400 mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '1.5px solid rgba(52, 211, 153, 0.3)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  }}
                >
                  {member.initials}
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{member.name}</h4>
                <p className="text-sm text-gray-400">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ================= STATS SECTION ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="py-16 border-t border-gray-800"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">EarthTogether By The Numbers</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Real community metrics showing our combined strides toward carbon reduction and daily sustainability.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              valueStr="10+"
              endValue={10}
              label="Eco Habit Categories"
              icon={<Leaf size={22} />}
            />
            <StatCard
              valueStr="12500"
              endValue={12500}
              label="Kg Carbon Saved"
              icon={<Shield size={22} />}
            />
            <StatCard
              valueStr="6"
              endValue={6}
              label="Active Challenges"
              icon={<Award size={22} />}
            />
            <StatCard
              valueStr="5"
              endValue={5}
              label="Achievement Tiers"
              icon={<Zap size={22} />}
            />
          </div>
        </motion.section>

        {/* ================= CALL TO ACTION ================= */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-16 px-8 rounded-3xl text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 32, 48, 0.6) 0%, rgba(13, 17, 23, 0.8) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">
            Ready to Start Your Eco-Journey?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 relative z-10 leading-relaxed font-normal">
            The planet doesn't need a few people doing sustainability perfectly. It needs millions of people doing it imperfectly, together. That's what EarthTogether is for.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            {isAuthenticated ? (
              <Link to="/welcome" className="dark-btn-primary py-3 px-8 text-md font-bold rounded-xl flex items-center gap-2">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="dark-btn-primary py-3 px-8 text-md font-bold rounded-xl flex items-center gap-2">
                  Join EarthTogether — It's Free <ArrowRight size={18} />
                </Link>
                <Link to="/" className="dark-btn-secondary py-3 px-8 text-md font-semibold rounded-xl">
                  Or explore how it works first →
                </Link>
              </>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
