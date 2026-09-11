import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, Users, Recycle, TreePine, Heart, ArrowRight, Globe, Sprout, 
  Award, TrendingUp, BookOpen, User, LogOut, Search, Play, Flame, Check, 
  MessageCircle, Share2, Compass, HelpCircle, Trash2, Sparkles, MapPin, Cloud, 
  X, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import './Landing.css';

/* ─────────────── Three.js Floating Nature Particles ─────────────── */
function FloatingLeaves({ count = 45 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 22,
        Math.random() * 14 - 3,
        (Math.random() - 0.5) * 10,
      ],
      speed: 0.15 + Math.random() * 0.35,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      swaySpeed: 0.4 + Math.random() * 1.2,
      swayAmount: 0.2 + Math.random() * 0.6,
      scale: 0.05 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    particles.forEach((particle, i) => {
      const { position, speed, rotationSpeed, swaySpeed, swayAmount, scale, phase } = particle;
      let y = position[1] - speed * 0.01;
      if (y < -4) y = 11;
      particle.position[1] = y;

      dummy.position.set(
        position[0] + Math.sin(time * swaySpeed + phase) * swayAmount,
        y,
        position[2] + Math.cos(time * swaySpeed * 0.5 + phase) * swayAmount * 0.5
      );
      dummy.rotation.x = time * rotationSpeed * 2;
      dummy.rotation.y = time * rotationSpeed * 3;
      dummy.rotation.z = Math.sin(time * swaySpeed + phase) * 0.25;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <planeGeometry args={[1, 1.2]} />
      <meshBasicMaterial color="#4ade80" transparent opacity={0.45} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// 3D Rotating Earth Wireframe Sphere
function EarthGlobe() {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = time * 0.12;
      outerRef.current.rotation.x = Math.sin(time * 0.06) * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -time * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Glow Ring */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[2.4, 28, 28]} />
        <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.32} />
      </mesh>
      {/* Inner Core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.9, 18, 18]} />
        <meshBasicMaterial color="#15803d" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* ─────────────── React Bits Spotlight Card Component ─────────────── */
function SpotlightCard({ children, className = '', ...props }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`et-spotlight-card ${className}`}
      {...props}
    >
      <div className="et-spotlight-overlay" />
      {children}
    </div>
  );
}

/* ─────────────── GSAP / Intersection CountUp Component ─────────────── */
function GsapCounter({ end, duration = 1.8, prefix = '', suffix = '', decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const obj = { value: 0 };
          gsap.to(obj, {
            value: end,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
              setVal(decimals > 0 ? obj.value.toFixed(decimals) : Math.floor(obj.value));
            },
          });
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {typeof val === 'number' ? val.toLocaleString() : val}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const Landing = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation state
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Video modal state
  const [videoOpen, setVideoOpen] = useState(false);

  // Search modal state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive habits checklist inside the mockup
  const [habits, setHabits] = useState([
    { id: 1, label: 'Used reusable bottle', pts: '+10', done: true },
    { id: 2, label: 'Walked instead of driving', pts: '+20', done: true },
    { id: 3, label: 'Avoided single-use plastic', pts: '+15', done: false },
  ]);
  const [userEcoPoints, setUserEcoPoints] = useState(184);

  // Floating card GSAP tilt / hover
  const ecoGoalCardRef = useRef(null);

  // Community cards like states
  const [likes, setLikes] = useState({
    post1: { count: 52, liked: false },
    post2: { count: 132, liked: false },
    post3: { count: 86, liked: false },
  });

  // Scroll listener for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GSAP Gentle floating effect on the Today's Eco-Goal card
  useEffect(() => {
    if (ecoGoalCardRef.current) {
      gsap.to(ecoGoalCardRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, []);

  // Toggle habit in the interactive preview
  const toggleHabit = (id, pts) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextState = !h.done;
          const delta = parseInt(pts.replace('+', ''), 10) || 10;
          setUserEcoPoints((curr) => (nextState ? curr + delta : curr - delta));
          return { ...h, done: nextState };
        }
        return h;
      })
    );
  };

  // Toggle like on community post cards
  const toggleLike = (key) => {
    setLikes((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked,
        },
      };
    });
  };

  // Smooth scroll handler
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="et-landing-root">
      {/* ─── 1. TOP NAVIGATION BAR ─── */}
      <header className={`et-navbar ${scrolled ? 'et-navbar-scrolled' : ''}`}>
        <Link to="/" className="et-brand" aria-label="EarthTogether Home">
          <div className="et-brand-icon">
            <Leaf size={22} strokeWidth={2.5} />
          </div>
          <span className="et-brand-title">
            Earth<span>Together</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav>
          <ul className="et-nav-links">
            <li>
              <button 
                type="button" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="et-nav-link active bg-transparent border-0 cursor-pointer"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => scrollToSection('features')} 
                className="et-nav-link bg-transparent border-0 cursor-pointer"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => scrollToSection('community')} 
                className="et-nav-link bg-transparent border-0 cursor-pointer"
              >
                Community
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => scrollToSection('impact')} 
                className="et-nav-link bg-transparent border-0 cursor-pointer"
              >
                Impact
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => scrollToSection('resources')} 
                className="et-nav-link bg-transparent border-0 cursor-pointer"
              >
                Resources
              </button>
            </li>
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="et-nav-actions">
          <button
            type="button"
            className="et-icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            title="Search EarthTogether"
          >
            <Search size={18} />
          </button>

          {isAuthenticated ? (
            <div className="et-profile-container" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="et-profile-btn"
                aria-label="User Menu"
              >
                <div className="et-profile-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username || 'User'} />
                  ) : (
                    user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || <User size={18} />
                  )}
                </div>
                <span className="et-profile-name">
                  {user?.username || user?.name?.split(' ')[0] || 'My Account'}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="et-profile-dropdown">
                  <div className="et-dropdown-header">
                    <p className="et-dropdown-user">{user?.username || user?.name || 'Eco-Warrior'}</p>
                    <p className="et-dropdown-email">{user?.email || 'Member'}</p>
                  </div>
                  <div className="et-dropdown-divider" />
                  <Link
                    to="/dashboard"
                    className="et-dropdown-item"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Compass size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="et-dropdown-item"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    type="button"
                    className="et-dropdown-item et-dropdown-logout"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="et-btn-ghost">
                Log In
              </Link>
              <Link to="/register" className="et-btn-pill-white">
                <span className="et-btn-pill-text">Join EarthTogether</span>
                <ArrowRight size={16} />
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="et-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile & Tablet Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="et-mobile-drawer"
            >
              <nav className="et-mobile-nav">
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                  className="et-mobile-nav-link"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection('features');
                    setMobileMenuOpen(false);
                  }}
                  className="et-mobile-nav-link"
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection('community');
                    setMobileMenuOpen(false);
                  }}
                  className="et-mobile-nav-link"
                >
                  Community
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection('impact');
                    setMobileMenuOpen(false);
                  }}
                  className="et-mobile-nav-link"
                >
                  Impact
                </button>
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection('resources');
                    setMobileMenuOpen(false);
                  }}
                  className="et-mobile-nav-link"
                >
                  Resources
                </button>
              </nav>

              <div className="et-mobile-auth">
                {isAuthenticated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="et-btn-pill-white"
                      style={{ textAlign: 'center', justifyContent: 'center' }}
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="et-btn-ghost"
                      style={{ textAlign: 'center', justifyContent: 'center', color: '#f87171' }}
                    >
                      <LogOut size={16} style={{ marginRight: 6 }} />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="et-btn-ghost"
                      style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="et-btn-pill-white"
                      style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
                    >
                      <span>Join</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── 2. HERO SECTION ─── */}
      <section className="et-hero">
        {/* Forest Background Image */}
        <div className="et-hero-bg-wrapper">
          <img
            src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2000&q=85"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `${process.env.PUBLIC_URL || ''}/images/forest-hero.jpg`;
            }}
            alt="Misty lush green forest mountains"
            className="et-hero-bg-img"
          />
          <div className="et-hero-overlay" />
        </div>

        {/* 3D Subtle Floating Nature Particles */}
        <div className="et-hero-particles">
          <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <FloatingLeaves count={40} />
          </Canvas>
        </div>

        {/* Top Right Handwritten Script Accent */}
        <div className="et-hero-script-doodle et-handwriting">
          A cleaner brighter<br />future together
        </div>

        <div className="et-hero-container">
          {/* Left Column: Headline & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="et-eyebrow">
              PEOPLE • HABITS • A GREENER TOMORROW
            </div>

            <h1 className="et-hero-title et-serif">
              Live Greener.<br />
              <span className="highlight">Together.</span>
            </h1>

            <p className="et-hero-subtitle">
              Turn everyday sustainable actions into habits, achievements and real community impact.
            </p>

            <div className="et-hero-actions">
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="et-btn-pill-emerald">
                <span>Start My Eco-Journey</span>
                <ArrowRight size={18} />
              </Link>

              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="et-btn-pill-glass"
              >
                <Play size={16} fill="white" />
                <span>Watch Video</span>
              </button>
            </div>

            {/* Social Proof Avatars */}
            <div className="et-hero-social">
              <div className="et-avatar-stack">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Member 1"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Member 2"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Member 3"
                />
              </div>
              <span className="et-hero-social-text">
                12,000+ eco-warriors already joined
              </span>
            </div>
          </motion.div>

          {/* Right Column: Floating "Today's Eco-Goal" Card */}
          <div className="et-hero-card-col">
            <motion.div
              ref={ecoGoalCardRef}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="et-eco-goal-card"
            >
              <div className="et-goal-header">Today's Eco-Goal</div>

              <div className="et-goal-task-row">
                <div className="et-goal-icon-box">
                  <Recycle size={24} />
                </div>
                <div>
                  <div className="et-goal-task-title">Carry a reusable bottle today</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="et-goal-progress-wrap">
                <div className="et-goal-progress-bar">
                  <div className="et-goal-progress-fill" style={{ width: '68%' }} />
                </div>
                <div className="et-goal-progress-label">68%</div>
              </div>

              {/* Stats Row */}
              <div className="et-goal-stats-row">
                <div className="et-goal-stat-pill">
                  <div className="et-goal-stat-badge et-badge-green">
                    <Sprout size={16} />
                  </div>
                  <div>
                    <div className="et-goal-stat-val">+25</div>
                    <div className="et-goal-stat-lbl">Eco-Points</div>
                  </div>
                </div>

                <div className="et-goal-stat-pill">
                  <div className="et-goal-stat-badge et-badge-orange">
                    <Flame size={16} />
                  </div>
                  <div>
                    <div className="et-goal-stat-val">12</div>
                    <div className="et-goal-stat-lbl">Day Streak</div>
                  </div>
                </div>
              </div>

              <p className="et-goal-quote et-serif">
                “Small actions make big change.”
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 3. METRICS RIBBON BAR ─── */}
      <section className="et-metrics-ribbon-section">
        <div className="et-metrics-ribbon-card">
          <div className="et-metric-col">
            <div className="et-metric-icon-circle">
              <Leaf size={22} />
            </div>
            <div className="et-metric-value">
              <GsapCounter end={184293} suffix="+" />
            </div>
            <div className="et-metric-label">Eco-actions completed</div>
          </div>

          <div className="et-metric-col">
            <div className="et-metric-icon-circle">
              <Users size={22} />
            </div>
            <div className="et-metric-value">
              <GsapCounter end={12840} suffix="+" />
            </div>
            <div className="et-metric-label">Active members</div>
          </div>

          <div className="et-metric-col">
            <div className="et-metric-icon-circle">
              <Cloud size={22} />
            </div>
            <div className="et-metric-value">
              <GsapCounter end={38.6} decimals={1} suffix="M kg" />
            </div>
            <div className="et-metric-label">CO₂ avoided (estimated)</div>
          </div>

          <div className="et-metric-col">
            <div className="et-metric-icon-circle">
              <Award size={22} />
            </div>
            <div className="et-metric-value">
              <GsapCounter end={1240} suffix="+" />
            </div>
            <div className="et-metric-label">Community challenges</div>
          </div>

          <div className="et-metric-col">
            <div className="et-metric-icon-circle">
              <MapPin size={22} />
            </div>
            <div className="et-metric-value">
              <GsapCounter end={86} suffix="+" />
            </div>
            <div className="et-metric-label">Local initiatives</div>
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURES GRID ─── */}
      <section id="features" className="et-section">
        <div className="et-section-container">
          <div className="et-section-header">
            <h2 className="et-section-title et-serif">
              Everything you need to <span className="accent">live more sustainably</span>
            </h2>
            <p className="et-section-subtitle">
              Track habits, join challenges, learn, share and make a real impact — all in one place.
            </p>
          </div>

          <div className="et-features-grid">
            {/* Card 1: Build Better Habits */}
            <SpotlightCard className="et-feature-card">
              <div className="et-feature-icon-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Leaf size={24} />
              </div>
              <h3 className="et-feature-title">Build Better Habits</h3>
              <p className="et-feature-desc">
                Track everyday eco-actions and build streaks that stick.
              </p>
              <Link to="/habits" className="et-feature-link">
                <span>Track My Habits</span>
                <ArrowRight size={16} />
              </Link>
              <div className="et-feature-visual-wrap">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=320&q=80"
                  alt="Sprouting plant in soil"
                  className="et-feature-visual-img"
                />
              </div>
            </SpotlightCard>

            {/* Card 2: Take on Challenges */}
            <SpotlightCard className="et-feature-card">
              <div className="et-feature-icon-badge" style={{ background: '#ffedd5', color: '#ea580c' }}>
                <Award size={24} />
              </div>
              <h3 className="et-feature-title">Take on Challenges</h3>
              <p className="et-feature-desc">
                Join weekly community challenges, complete actions and earn badges and certificates.
              </p>
              <Link to="/challenges" className="et-feature-link">
                <span>Explore Challenges</span>
                <ArrowRight size={16} />
              </Link>
              <div className="et-feature-visual-wrap">
                <img
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=320&q=80"
                  alt="Mountain summit flag"
                  className="et-feature-visual-img"
                />
              </div>
            </SpotlightCard>

            {/* Card 3: Connect with People */}
            <SpotlightCard className="et-feature-card">
              <div className="et-feature-icon-badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                <Users size={24} />
              </div>
              <h3 className="et-feature-title">Connect with People</h3>
              <p className="et-feature-desc">
                Share your journey, get inspired and be part of a global community.
              </p>
              <Link to="/feed" className="et-feature-link">
                <span>Join the Community</span>
                <ArrowRight size={16} />
              </Link>
              <div className="et-feature-visual-wrap">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=320&q=80"
                  alt="Community members together"
                  className="et-feature-visual-img"
                />
              </div>
            </SpotlightCard>

            {/* Card 4: Learn & Grow */}
            <SpotlightCard className="et-feature-card">
              <div className="et-feature-icon-badge" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                <BookOpen size={24} />
              </div>
              <h3 className="et-feature-title">Learn & Grow</h3>
              <p className="et-feature-desc">
                Read latest news, research, take quizzes and learn simple ways to make a difference.
              </p>
              <Link to="/researches" className="et-feature-link">
                <span>Explore Resources</span>
                <ArrowRight size={16} />
              </Link>
              <div className="et-feature-visual-wrap">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"
                  alt="Books stacked with plant"
                  className="et-feature-visual-img"
                />
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ─── 5. HOW EARTHTOGETHER WORKS ─── */}
      <section className="et-how-works-section">
        <div className="et-section-container">
          <div className="et-how-header-row">
            <div>
              <h2 className="et-section-title et-serif" style={{ textAlign: 'left', marginBottom: 6 }}>
                How EarthTogether <span className="accent">Works</span>
              </h2>
              <p className="et-section-subtitle" style={{ textAlign: 'left' }}>
                From a simple action to a cleaner, healthier planet — it's easy.
              </p>
            </div>
            <div className="et-handwriting" style={{ fontSize: '2rem', color: '#15803d', transform: 'rotate(-4deg)' }}>
              Small steps.<br />Big impact. ↗
            </div>
          </div>

          <div className="et-steps-grid">
            {/* Step 01 */}
            <div className="et-step-card">
              <div className="et-step-icon-badge">
                <Leaf size={26} />
              </div>
              <div className="et-step-number-title">
                <span className="et-step-num">01</span>
                <span>Choose a Habit</span>
              </div>
              <p className="et-step-desc">
                Pick from everyday eco-actions like saving water, reducing waste or using public transport.
              </p>
              <div className="et-step-connector">→</div>
            </div>

            {/* Step 02 */}
            <div className="et-step-card">
              <div className="et-step-icon-badge">
                <TrendingUp size={26} />
              </div>
              <div className="et-step-number-title">
                <span className="et-step-num">02</span>
                <span>Track It</span>
              </div>
              <p className="et-step-desc">
                Log your actions, earn eco-points and build your streak.
              </p>
              <div className="et-step-connector">→</div>
            </div>

            {/* Step 03 */}
            <div className="et-step-card">
              <div className="et-step-icon-badge">
                <Users size={26} />
              </div>
              <div className="et-step-number-title">
                <span className="et-step-num">03</span>
                <span>Join Others</span>
              </div>
              <p className="et-step-desc">
                Participate in community challenges and inspire others.
              </p>
              <div className="et-step-connector">→</div>
            </div>

            {/* Step 04 */}
            <div className="et-step-card">
              <div className="et-step-icon-badge">
                <Globe size={26} />
              </div>
              <div className="et-step-number-title">
                <span className="et-step-num">04</span>
                <span>See Your Impact</span>
              </div>
              <p className="et-step-desc">
                Watch your personal impact grow and contribute to a greener planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. THE PLATFORM SHOWCASE (INTERACTIVE MOCKUP) ─── */}
      <section className="et-platform-section">
        <div className="et-section-container">
          <div className="et-platform-layout">
            {/* Left: macOS Window Mockup */}
            <div className="et-mockup-window">
              <div className="et-mockup-titlebar">
                <div className="et-mockup-dots">
                  <span className="et-mockup-dot et-dot-red" />
                  <span className="et-mockup-dot et-dot-yellow" />
                  <span className="et-mockup-dot et-dot-green" />
                </div>
                <div className="et-mockup-address">
                  earthtogether.app/dashboard
                </div>
                <div style={{ width: 40 }} />
              </div>

              <div className="et-mockup-body">
                {/* Mini Sidebar */}
                <div className="et-mockup-sidebar">
                  <div className="et-mockup-nav-item active">
                    <Compass size={14} />
                    <span>Home</span>
                  </div>
                  <div className="et-mockup-nav-item">
                    <Leaf size={14} />
                    <span>Habits</span>
                  </div>
                  <div className="et-mockup-nav-item">
                    <Award size={14} />
                    <span>Challenges</span>
                  </div>
                  <div className="et-mockup-nav-item">
                    <Users size={14} />
                    <span>Community</span>
                  </div>
                  <div className="et-mockup-nav-item">
                    <TrendingUp size={14} />
                    <span>Leaderboard</span>
                  </div>
                  <div className="et-mockup-nav-item">
                    <BookOpen size={14} />
                    <span>News</span>
                  </div>
                  <div className="et-mockup-nav-item">
                    <Recycle size={14} />
                    <span>Waste Mgmt</span>
                  </div>
                  <div className="et-mockup-nav-item">
                    <Sparkles size={14} />
                    <span>Resources</span>
                  </div>
                </div>

                {/* Mini Dashboard Content */}
                <div className="et-mockup-content">
                  <div className="et-mockup-greeting">Good morning, Ganesh 👋</div>
                  <div className="et-mockup-subgreet">Let's make today count!</div>

                  {/* Stat Ribbon */}
                  <div className="et-mockup-stat-ribbon">
                    <div className="et-mockup-pill">
                      <Flame size={14} color="#ea580c" />
                      <span>12 Day Streak</span>
                    </div>
                    <div className="et-mockup-pill">
                      <Sprout size={14} color="#16a34a" />
                      <span>{userEcoPoints} Eco-Points</span>
                    </div>
                    <div className="et-mockup-pill">
                      <Award size={14} color="#d97706" />
                      <span>3 Badges</span>
                    </div>
                  </div>

                  <div className="et-mockup-inner-grid">
                    {/* Today's Habits Checklist */}
                    <div className="et-mockup-card">
                      <div className="et-mockup-card-title">Today's Habits</div>
                      {habits.map((item) => (
                        <div
                          key={item.id}
                          className={`et-habit-item ${item.done ? 'done' : ''}`}
                          onClick={() => toggleHabit(item.id, item.pts)}
                          title="Click to toggle completion!"
                        >
                          <div className="et-habit-left">
                            <div className="et-habit-check">
                              {item.done && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className="et-habit-label">{item.label}</span>
                          </div>
                          <span className="et-habit-pts">{item.pts}</span>
                        </div>
                      ))}
                    </div>

                    {/* Community Challenge Card */}
                    <div className="et-mockup-card">
                      <div className="et-mockup-card-title">Community Challenge</div>
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=260&q=80"
                        alt="Outdoor nature hike"
                        className="et-mockup-challenge-img"
                      />
                      <div className="et-mockup-challenge-title">Plastic-Free Week</div>
                      <div className="et-mockup-challenge-progress">
                        <div style={{ width: '65%', height: '100%', background: '#16a34a', borderRadius: 4 }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/challenges')}
                        className="et-mockup-btn"
                      >
                        Join Challenge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Feature Badges & Overview */}
            <div>
              <div className="et-platform-eyebrow">THE PLATFORM</div>
              <h2 className="et-platform-title">
                Your sustainability life, in one place.
              </h2>
              <p className="et-platform-desc">
                Track habits. Join challenges. Share progress. Learn. Compete. Create impact.
              </p>

              {/* 8 Feature Pills Grid */}
              <div className="et-platform-modules-grid">
                <Link to="/habits" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <Leaf size={16} />
                  </div>
                  <span className="et-platform-pill-name">Habits</span>
                </Link>

                <Link to="/challenges" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    <Award size={16} />
                  </div>
                  <span className="et-platform-pill-name">Challenges</span>
                </Link>

                <Link to="/feed" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <MessageCircle size={16} />
                  </div>
                  <span className="et-platform-pill-name">Feed</span>
                </Link>

                <Link to="/leaderboard" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                    <TrendingUp size={16} />
                  </div>
                  <span className="et-platform-pill-name">Leaderboard</span>
                </Link>

                <Link to="/news" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
                    <BookOpen size={16} />
                  </div>
                  <span className="et-platform-pill-name">News</span>
                </Link>

                <Link to="/quizzes" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                    <HelpCircle size={16} />
                  </div>
                  <span className="et-platform-pill-name">Quizzes</span>
                </Link>

                <Link to="/waste-management" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#dcfce7', color: '#059669' }}>
                    <Trash2 size={16} />
                  </div>
                  <span className="et-platform-pill-name">Waste Mgmt</span>
                </Link>

                <Link to="/researches" className="et-platform-pill">
                  <div className="et-platform-pill-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
                    <Sparkles size={16} />
                  </div>
                  <span className="et-platform-pill-name">Research</span>
                </Link>
              </div>

              <Link to="/register" className="et-btn-forest">
                <span>Explore the Platform</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. GAMIFICATION BANNER ─── */}
      <section className="et-gamify-section">
        <div className="et-section-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: 960, margin: '0 auto 36px' }}>
            <div>
              <h2 className="et-section-title et-serif" style={{ textAlign: 'left', marginBottom: 6 }}>
                Make sustainability addictive — in a good way.
              </h2>
              <p className="et-section-subtitle" style={{ textAlign: 'left' }}>
                Earn points, unlock badges, climb the leaderboard and stay motivated.
              </p>
            </div>
            <div className="et-handwriting" style={{ fontSize: '1.9rem', color: '#16a34a', transform: 'rotate(5deg)' }}>
              Progress Feels Good 😊
            </div>
          </div>

          <div className="et-gamify-cards-row">
            <div className="et-gamify-card">
              <div className="et-gamify-icon-wrap" style={{ background: '#ffedd5', color: '#ea580c' }}>
                <Flame size={24} />
              </div>
              <div>
                <div className="et-gamify-num">
                  <GsapCounter end={21} />
                </div>
                <div className="et-gamify-label">Day Streak</div>
              </div>
            </div>

            <div className="et-gamify-card">
              <div className="et-gamify-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Leaf size={24} />
              </div>
              <div>
                <div className="et-gamify-num">
                  <GsapCounter end={1240} />
                </div>
                <div className="et-gamify-label">Eco-Points</div>
              </div>
            </div>

            <div className="et-gamify-card">
              <div className="et-gamify-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Award size={24} />
              </div>
              <div>
                <div className="et-gamify-num">
                  <GsapCounter end={3} />
                </div>
                <div className="et-gamify-label">Badges Unlocked</div>
              </div>
            </div>

            <div className="et-gamify-card">
              <div className="et-gamify-icon-wrap" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div className="et-gamify-num">
                  #<GsapCounter end={12} />
                </div>
                <div className="et-gamify-label">On Leaderboard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. COMMUNITY FEED (REAL PEOPLE. REAL ACTIONS.) ─── */}
      <section id="community" className="et-community-section">
        <div className="et-section-container">
          <div className="et-community-layout">
            {/* Left Description Column */}
            <div>
              <div className="et-community-eyebrow">COMMUNITY</div>
              <h2 className="et-community-title">
                Real people.<br />Real actions.
              </h2>
              <p className="et-community-desc">
                Get inspired by a growing community of eco-warriors making a difference every day.
              </p>
              <Link to="/feed" className="et-btn-pill-white">
                <span>View Community</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Cards Row (3 Cards) */}
            <div className="et-community-cards-row">
              {/* Card 1 */}
              <div className="et-community-post-card">
                <div className="et-post-header">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                    alt="Aarav Sharma"
                    className="et-post-avatar"
                  />
                  <div>
                    <div className="et-post-author">Aarav Sharma</div>
                    <div className="et-post-meta">Mumbai • 2h ago</div>
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=400&q=80"
                  alt="Beach cleanup"
                  className="et-post-image"
                />
                <p className="et-post-caption">
                  Completed my 30-day plastic-free challenge! 🌊
                </p>
                <div className="et-post-points-pill">
                  <Sprout size={13} />
                  <span>+150 Eco-Points</span>
                </div>
                <div className="et-post-actions">
                  <button
                    type="button"
                    onClick={() => toggleLike('post1')}
                    className={`et-post-action-btn ${likes.post1.liked ? 'liked' : ''}`}
                  >
                    <Heart size={14} fill={likes.post1.liked ? '#ef4444' : 'none'} />
                    <span>{likes.post1.count}</span>
                  </button>
                  <div className="et-post-action-btn">
                    <MessageCircle size={14} />
                    <span>14</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="et-community-post-card">
                <div className="et-post-header">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80"
                    alt="Priya Patel"
                    className="et-post-avatar"
                  />
                  <div>
                    <div className="et-post-author">Priya Patel</div>
                    <div className="et-post-meta">Delhi • Yesterday</div>
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80"
                  alt="Planting saplings"
                  className="et-post-image"
                />
                <p className="et-post-caption">
                  Started a community cleanup drive! 🌱
                </p>
                <div className="et-post-points-pill" style={{ background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd' }}>
                  <Users size={13} />
                  <span>24 people joined</span>
                </div>
                <div className="et-post-actions">
                  <button
                    type="button"
                    onClick={() => toggleLike('post2')}
                    className={`et-post-action-btn ${likes.post2.liked ? 'liked' : ''}`}
                  >
                    <Heart size={14} fill={likes.post2.liked ? '#ef4444' : 'none'} />
                    <span>{likes.post2.count}</span>
                  </button>
                  <div className="et-post-action-btn">
                    <MessageCircle size={14} />
                    <span>35</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="et-community-post-card">
                <div className="et-post-header">
                  <img
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80"
                    alt="Rohan Kulkarni"
                    className="et-post-avatar"
                  />
                  <div>
                    <div className="et-post-author">Rohan Kulkarni</div>
                    <div className="et-post-meta">Pune • 3h ago</div>
                  </div>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80"
                  alt="Morning misty forest"
                  className="et-post-image"
                />
                <p className="et-post-caption">
                  21-day sustainability streak and counting! 🔥
                </p>
                <div className="et-post-points-pill">
                  <Flame size={13} />
                  <span>+210 Eco-Points</span>
                </div>
                <div className="et-post-actions">
                  <button
                    type="button"
                    onClick={() => toggleLike('post3')}
                    className={`et-post-action-btn ${likes.post3.liked ? 'liked' : ''}`}
                  >
                    <Heart size={14} fill={likes.post3.liked ? '#ef4444' : 'none'} />
                    <span>{likes.post3.count}</span>
                  </button>
                  <div className="et-post-action-btn">
                    <MessageCircle size={14} />
                    <span>9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. OUR COLLECTIVE IMPACT ─── */}
      <section id="impact" className="et-impact-section">
        <div className="et-section-container">
          <div className="et-impact-layout">
            {/* Left: 3D Earth Globe Visual */}
            <div className="et-earth-visual-wrap">
              <div className="et-earth-canvas-container">
                <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }}>
                  <ambientLight intensity={0.8} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} />
                  <EarthGlobe />
                </Canvas>
              </div>
            </div>

            {/* Right: Metrics & Inspirational Callout */}
            <div>
              <h2 className="et-section-title et-serif" style={{ textAlign: 'left' }}>
                Our Collective Impact
              </h2>
              <p className="et-section-subtitle" style={{ textAlign: 'left', marginBottom: 32 }}>
                Together, we're creating a cleaner, healthier and more sustainable planet.
              </p>

              <div className="et-impact-grid">
                <div className="et-impact-card">
                  <div className="et-impact-icon-circle">
                    <TreePine size={22} />
                  </div>
                  <div className="et-impact-stat-num">
                    <GsapCounter end={12500} suffix="+" />
                  </div>
                  <div className="et-impact-stat-label">Trees planted</div>
                </div>

                <div className="et-impact-card">
                  <div className="et-impact-icon-circle">
                    <Cloud size={22} />
                  </div>
                  <div className="et-impact-stat-num">
                    <GsapCounter end={38.6} decimals={1} suffix="M kg" />
                  </div>
                  <div className="et-impact-stat-label">CO₂ avoided</div>
                </div>

                <div className="et-impact-card">
                  <div className="et-impact-icon-circle">
                    <Users size={22} />
                  </div>
                  <div className="et-impact-stat-num">
                    <GsapCounter end={12840} suffix="+" />
                  </div>
                  <div className="et-impact-stat-label">Active members</div>
                </div>

                <div className="et-impact-card">
                  <div className="et-impact-icon-circle">
                    <Recycle size={22} />
                  </div>
                  <div className="et-impact-stat-num">
                    <GsapCounter end={240} suffix="+" />
                  </div>
                  <div className="et-impact-stat-label">Local initiatives</div>
                </div>
              </div>

              <div className="et-impact-quote-box">
                “Every statistic starts with one person's action.”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. LEARN SOMETHING. CHANGE SOMETHING. (RESOURCES) ─── */}
      <section id="resources" className="et-resources-section">
        <div className="et-section-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <h2 className="et-section-title et-serif" style={{ textAlign: 'left', marginBottom: 6 }}>
                Learn Something. Change Something.
              </h2>
              <p className="et-section-subtitle" style={{ textAlign: 'left' }}>
                Explore the latest in sustainability research, quizzes and waste management.
              </p>
            </div>
            <Link to="/researches" className="et-btn-pill-emerald">
              <span>View All Resources</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="et-resources-grid">
            {/* News Card */}
            <div className="et-resource-card">
              <img
                src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=500&q=80"
                alt="Plastic ocean debris"
                className="et-resource-img"
              />
              <div className="et-resource-body">
                <div className="et-resource-tag">LATEST NEWS</div>
                <h3 className="et-resource-title">
                  What actually happens to the plastic you throw away?
                </h3>
                <Link to="/news" className="et-resource-link">
                  <span>Read Article</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Research Card */}
            <div className="et-resource-card">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80"
                alt="Seedling in rich sunlight"
                className="et-resource-img"
              />
              <div className="et-resource-body">
                <div className="et-resource-tag">RESEARCH</div>
                <h3 className="et-resource-title">
                  The real impact of small daily habits
                </h3>
                <Link to="/researches" className="et-resource-link">
                  <span>Read Research</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Quiz Card */}
            <div className="et-resource-card">
              <img
                src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=500&q=80"
                alt="Lightbulb with plant seedling"
                className="et-resource-img"
              />
              <div className="et-resource-body">
                <div className="et-resource-tag">QUIZ</div>
                <h3 className="et-resource-title">
                  How eco-friendly are you?
                </h3>
                <Link to="/quizzes" className="et-resource-link">
                  <span>Take Quiz</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. WHAT OUR COMMUNITY SAYS (TESTIMONIALS) ─── */}
      <section className="et-testimonials-section">
        <div className="et-section-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
            <div>
              <h2 className="et-section-title et-serif" style={{ textAlign: 'left', marginBottom: 6 }}>
                What Our Community Says
              </h2>
              <p className="et-section-subtitle" style={{ textAlign: 'left' }}>
                Real stories from real eco-warriors.
              </p>
            </div>
            <div className="et-handwriting" style={{ fontSize: '1.9rem', color: '#15803d', transform: 'rotate(-4deg)' }}>
              A Greener<br />Happier Tomorrow 🌿
            </div>
          </div>

          <div className="et-testimonials-grid">
            {/* Testimonial 1 */}
            <div className="et-testimonial-card">
              <p className="et-testimonial-quote">
                “EarthTogether made sustainability simple and fun. I've built habits that actually stick!”
              </p>
              <div className="et-testimonial-author-row">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                  alt="Aarav Sharma"
                  className="et-testimonial-avatar"
                />
                <div>
                  <div className="et-testimonial-name">Aarav Sharma</div>
                  <div className="et-testimonial-role">Volunteer, Mumbai</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="et-testimonial-card">
              <p className="et-testimonial-quote">
                “I started alone, now I'm part of a community of 50+ members in Delhi making a difference together.”
              </p>
              <div className="et-testimonial-author-row">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80"
                  alt="Priya Patel"
                  className="et-testimonial-avatar"
                />
                <div>
                  <div className="et-testimonial-name">Priya Patel</div>
                  <div className="et-testimonial-role">Eco-Leader, Delhi</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="et-testimonial-card">
              <p className="et-testimonial-quote">
                “The challenges and badges keep me motivated. I never knew saving the planet could be this fun!”
              </p>
              <div className="et-testimonial-author-row">
                <img
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80"
                  alt="Rohan Kulkarni"
                  className="et-testimonial-avatar"
                />
                <div>
                  <div className="et-testimonial-name">Rohan Kulkarni</div>
                  <div className="et-testimonial-role">Student, Pune</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 12. PRE-FOOTER CTA BANNER ─── */}
      <section className="et-cta-banner">
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1800&q=85"
          alt="Lush green canopy forest"
          className="et-cta-bg-img"
        />
        <div className="et-cta-overlay" />

        <div className="et-cta-container">
          <div className="et-cta-eyebrow">. JOIN THE MOVEMENT .</div>
          <h2 className="et-cta-title et-serif">
            Your next good habit starts today.
          </h2>
          <p className="et-cta-subtitle">
            Join thousands of eco-warriors turning small everyday choices into measurable impact.
          </p>

          <Link to={isAuthenticated ? "/dashboard" : "/register"} className="et-btn-pill-white">
            <span>Start My Eco-Journey</span>
            <ArrowRight size={18} />
          </Link>

          <div className="et-cta-reassurance">
            No complicated setup. Just one small action.
          </div>
        </div>

        {/* Handwritten Doodle on Right */}
        <div
          className="et-handwriting"
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '6%',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '1.8rem',
            transform: 'rotate(-4deg)',
          }}
        >
          Together<br />For a Greener<br />Tomorrow
        </div>
      </section>

      {/* ─── 13. FOOTER ─── */}
      <footer className="et-footer">
        <div className="et-footer-container">
          <div className="et-footer-grid">
            {/* Column 1: Brand & Bio */}
            <div>
              <Link to="/" className="et-brand" style={{ marginBottom: 12 }}>
                <div className="et-brand-icon">
                  <Leaf size={20} strokeWidth={2.5} />
                </div>
                <span className="et-brand-title" style={{ fontSize: '1.4rem' }}>
                  Earth<span>Together</span>
                </span>
              </Link>
              <p className="et-footer-brand-desc">
                A community-driven movement turning climate concern into real action. Together, we heal the Earth.
              </p>
            </div>

            {/* Column 2: Platform Links */}
            <div>
              <div className="et-footer-col-title">Platform</div>
              <ul className="et-footer-links">
                <li><Link to="/register" className="et-footer-link">Join the Movement</Link></li>
                <li><Link to="/login" className="et-footer-link">Sign In</Link></li>
                <li><Link to="/habits" className="et-footer-link">Habits Tracker</Link></li>
                <li><Link to="/dashboard" className="et-footer-link">Dashboard</Link></li>
              </ul>
            </div>

            {/* Column 3: Community Links */}
            <div>
              <div className="et-footer-col-title">Community</div>
              <ul className="et-footer-links">
                <li><Link to="/challenges" className="et-footer-link">Challenges</Link></li>
                <li><Link to="/leaderboard" className="et-footer-link">Leaderboard</Link></li>
                <li><Link to="/feed" className="et-footer-link">Eco-Feed</Link></li>
                <li><Link to="/waste-management" className="et-footer-link">Waste Centers</Link></li>
              </ul>
            </div>

            {/* Column 4: Resources Links */}
            <div>
              <div className="et-footer-col-title">Resources</div>
              <ul className="et-footer-links">
                <li><Link to="/about" className="et-footer-link">About Us</Link></li>
                <li><Link to="/news" className="et-footer-link">Eco News</Link></li>
                <li><Link to="/quizzes" className="et-footer-link">Eco Quizzes</Link></li>
                <li><Link to="/researches" className="et-footer-link">Research Papers</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="et-footer-bottom">
            <div>
              © 2025 EarthTogether. All rights reserved.
            </div>

            <div className="et-footer-socials">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="et-social-btn" aria-label="Twitter">
                <Globe size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="et-social-btn" aria-label="LinkedIn">
                <Share2 size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="et-social-btn" aria-label="Instagram">
                <Heart size={16} />
              </a>
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontStyle: 'italic' }}>
              People. Habits. A Greener Tomorrow.
            </div>
          </div>
        </div>
      </footer>

      {/* ─── VIDEO MODAL ─── */}
      <AnimatePresence>
        {videoOpen && (
          <div className="et-modal-backdrop" onClick={() => setVideoOpen(false)}>
            <div className="et-modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="et-modal-close-btn"
                onClick={() => setVideoOpen(false)}
                aria-label="Close Video"
              >
                <X size={20} />
              </button>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  title="EarthTogether Story"
                  src="https://www.youtube.com/embed/oJqf_7zCq0U?autoplay=1"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── QUICK SEARCH MODAL ─── */}
      <AnimatePresence>
        {searchOpen && (
          <div className="et-modal-backdrop" onClick={() => setSearchOpen(false)}>
            <div
              className="et-modal-content"
              style={{ maxWidth: 540, padding: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 14, marginBottom: 18 }}>
                <Search size={20} color="#16a34a" />
                <input
                  type="text"
                  placeholder="Search habits, challenges, news, quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{ width: '100%', border: 'none', fontSize: '1rem', outline: 'none', background: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Quick Shortcuts
                </div>
                <Link
                  to="/habits"
                  onClick={() => setSearchOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#1e293b', background: '#f8fafc' }}
                >
                  <Leaf size={16} color="#16a34a" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Daily Eco-Habits Tracker</span>
                </Link>
                <Link
                  to="/challenges"
                  onClick={() => setSearchOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#1e293b', background: '#f8fafc' }}
                >
                  <Award size={16} color="#ea580c" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Community Weekly Challenges</span>
                </Link>
                <Link
                  to="/quizzes"
                  onClick={() => setSearchOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#1e293b', background: '#f8fafc' }}
                >
                  <HelpCircle size={16} color="#9333ea" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Interactive Eco-Quizzes</span>
                </Link>
                <Link
                  to="/waste-management"
                  onClick={() => setSearchOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#1e293b', background: '#f8fafc' }}
                >
                  <Recycle size={16} color="#059669" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Nearby Waste & Recycling Centers</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
