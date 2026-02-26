import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, Search, Settings, ChevronRight, Recycle, TreePine, Heart, ArrowRight, Globe, Sprout, Wind, Sun, Award, TrendingUp, BookOpen, ExternalLink, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './Landing.css';

/* ─────────────── Three.js Animated Components ─────────────── */

// Floating leaves particle system
function FloatingLeaves({ count = 60 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          Math.random() * 15 - 2,
          (Math.random() - 0.5) * 10,
        ],
        speed: 0.2 + Math.random() * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayAmount: 0.3 + Math.random() * 0.7,
        scale: 0.05 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    particles.forEach((particle, i) => {
      const { position, speed, rotationSpeed, swaySpeed, swayAmount, scale, phase } = particle;
      let y = position[1] - speed * 0.01;
      if (y < -3) y = 12;
      particle.position[1] = y;

      dummy.position.set(
        position[0] + Math.sin(time * swaySpeed + phase) * swayAmount,
        y,
        position[2] + Math.cos(time * swaySpeed * 0.5 + phase) * swayAmount * 0.5
      );
      dummy.rotation.x = time * rotationSpeed * 2;
      dummy.rotation.y = time * rotationSpeed * 3;
      dummy.rotation.z = Math.sin(time * swaySpeed + phase) * 0.3;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <planeGeometry args={[1, 1.2]} />
      <meshBasicMaterial color="#4a7c59" transparent opacity={0.6} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// Animated glowing orbs (fireflies)
function GlowingOrbs({ count = 30 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const orbs = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 16,
        Math.random() * 10 - 1,
        (Math.random() - 0.5) * 8,
      ],
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      radius: 0.5 + Math.random() * 1.5,
    }));
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    orbs.forEach((orb, i) => {
      const { position, speed, phase, radius } = orb;
      dummy.position.set(
        position[0] + Math.sin(time * speed + phase) * radius,
        position[1] + Math.cos(time * speed * 0.7 + phase) * radius * 0.5,
        position[2] + Math.sin(time * speed * 0.3 + phase) * radius * 0.3
      );
      const pulse = 0.03 + Math.sin(time * 2 + phase) * 0.015;
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#8fbc8f" transparent opacity={0.7} />
    </instancedMesh>
  );
}

// Rotating earth wireframe
function EarthWireframe() {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial color="#3d6b4f" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

// Scene for the hero section
function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <FloatingLeaves count={50} />
      <GlowingOrbs count={25} />
    </>
  );
}

// Scene for the impact section
function EarthScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <EarthWireframe />
      <GlowingOrbs count={15} />
    </>
  );
}

/* ─────────────── Animated Counter Component ─────────────── */
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

/* ─────────────── Wave SVG Divider ─────────────── */
function WaveDivider({ fill = '#ffffff', flip = false, className = '' }) {
  return (
    <div className={`wave-divider ${flip ? 'wave-flip' : ''} ${className}`}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/* ─────────────── Main Landing Component ─────────────── */
const Landing = () => {
  useAuth();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.1]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const missionItems = [
    { icon: <Recycle className="landing-mission-icon" />, label: 'Reduce Waste', color: '#5a7c65' },
    { icon: <Sun className="landing-mission-icon" />, label: 'Climate Action', color: '#7a8c5a' },
    { icon: <Users className="landing-mission-icon" />, label: 'Community Collaboration', color: '#5a6c7c' },
  ];

  const impactStats = [
    { icon: <TreePine className="landing-impact-icon" />, value: 12500, label: 'Trees Planted', suffix: '+' },
    { icon: <Users className="landing-impact-icon" />, value: 8400, label: 'Volunteers Joined', suffix: '+' },
    { icon: <Globe className="landing-impact-icon" />, value: 240, label: 'Local Initiatives Started', suffix: '' },
  ];

  const howItWorks = [
    { number: '240', label: 'Join the Community', sublabel: 'Active members worldwide', icon: <Users className="landing-hiw-icon" /> },
    { number: '3', label: 'Take Local Action', sublabel: 'Simple daily steps', icon: <Sprout className="landing-hiw-icon" /> },
    { number: '73', label: 'Create Real Impact', sublabel: 'Communities reached', icon: <TrendingUp className="landing-hiw-icon" /> },
    { number: '4%', label: 'Carbon Reduced', sublabel: 'By all members', icon: <Wind className="landing-hiw-icon" /> },
  ];

  const communityStories = [
    {
      name: 'Aarav Sharma',
      role: 'Volunteer, Mumbai',
      quote: 'EarthTogether gave me a platform to turn my concern into action. My neighborhood is cleaner than ever.',
      avatar: '🌱',
    },
    {
      name: 'Priya Patel',
      role: 'Eco-Leader, Delhi',
      quote: 'I started alone, now I lead a community of 50+ members. This platform made it all possible.',
      avatar: '🌿',
    },
    {
      name: 'Rohan Kulkarni',
      role: 'Student, Pune',
      quote: 'The challenges and badges keep me motivated. I never knew saving the planet could be this fun!',
      avatar: '🍃',
    },
  ];

  const features = [
    { icon: <BookOpen />, title: 'Analyse & Observe SaaS', desc: 'A complete tool for community climate resource tracking', color: '#f5f0e8' },
    { icon: <Award />, title: 'Activate Community in Action', desc: 'Nature has the power to unite communities in cause or action', color: '#c75b39' },
  ];

  return (
    <div className="landing-root">
      {/* ─── HEADER / NAVBAR ─── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <Leaf className="landing-logo-leaf" />
            </div>
            <span className="landing-logo-text">EarthTogether</span>
          </Link>

          <div className="landing-nav-links">
            <button className="landing-nav-icon-btn" aria-label="Search">
              <Search size={18} />
            </button>
            <button className="landing-nav-icon-btn" aria-label="Settings">
              <Settings size={18} />
            </button>
            <Link to="/login" className="landing-nav-link">Elem Members</Link>
            <Link to="/register" className="landing-nav-cta">
              Contribute <ChevronRight size={16} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="landing-mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link to="/login" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>Elem Members</Link>
              <Link to="/register" className="landing-mobile-link landing-mobile-cta" onClick={() => setMobileMenuOpen(false)}>
                Contribute <ChevronRight size={16} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="landing-hero">
        <motion.div className="landing-hero-bg" style={{ opacity: heroOpacity, scale: heroScale }}>
          <img
            src="/images/forest-hero.png"
            alt="Dense forest with sunlight streaming through trees"
            className="landing-hero-img"
          />
          <div className="landing-hero-overlay" />
        </motion.div>

        {/* Three.js floating particles overlay */}
        <div className="landing-hero-canvas">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        </div>

        <div className="landing-hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="landing-hero-text"
          >
            <motion.h1 variants={fadeInUp} custom={0} className="landing-hero-title">
              Together, We Can<br />Heal the Earth.
            </motion.h1>
            <motion.p variants={fadeInUp} custom={1} className="landing-hero-subtitle">
              A community-driven movement turning climate<br />concern into real action.
            </motion.p>
            <motion.div variants={fadeInUp} custom={2} className="landing-hero-btns">
              <Link to="/register" className="landing-btn-primary" id="join-movement-btn">
                Join the Movement
              </Link>
              <Link to="#how-it-works" className="landing-btn-secondary" id="see-how-btn">
                See How It Works
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative leaf elements */}
        <motion.div
          className="landing-hero-leaf landing-hero-leaf-1"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🍃
        </motion.div>
        <motion.div
          className="landing-hero-leaf landing-hero-leaf-2"
          animate={{ y: [0, -20, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          🌿
        </motion.div>

        <WaveDivider fill="#faf9f6" />
      </section>

      {/* ─── FEATURE CARDS ─── */}
      <section className="landing-feature-cards-section">
        <div className="landing-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="landing-feature-cards-grid"
          >
            {features.map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                className="landing-feature-card"
                style={{ backgroundColor: feat.color }}
              >
                <div className="landing-feature-card-header">
                  <div>
                    <h3 className="landing-feature-card-title">{feat.title}</h3>
                    <p className="landing-feature-card-desc">{feat.desc}</p>
                  </div>
                  <div className="landing-feature-card-icon">{feat.icon}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── OUR MISSION ─── */}
      <section className="landing-mission-section">
        <div className="landing-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="landing-section-header"
          >
            <motion.h2 variants={fadeInUp} className="landing-section-title">OUR MISSION</motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="landing-mission-grid"
          >
            {missionItems.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                className="landing-mission-card"
              >
                <div className="landing-mission-icon-wrap" style={{ backgroundColor: item.color + '18' }}>
                  {item.icon}
                </div>
                <p className="landing-mission-label">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <WaveDivider fill="#f0ebe3" />
      </section>

      {/* ─── IMPACT STATUS ─── */}
      <section className="landing-impact-section">
        <div className="landing-container">
          <div className="landing-impact-layout">
            <div className="landing-impact-left">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
              >
                <motion.h2 variants={fadeInUp} className="landing-impact-title">IMPACT STATUS</motion.h2>
                <motion.div variants={fadeInUp} className="landing-impact-stats-row">
                  {impactStats.map((stat, i) => (
                    <motion.div
                      key={i}
                      variants={fadeInUp}
                      custom={i}
                      whileHover={{ scale: 1.05 }}
                      className="landing-impact-stat"
                    >
                      <div className="landing-impact-stat-icon">{stat.icon}</div>
                      <div className="landing-impact-stat-value">
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                      </div>
                      <p className="landing-impact-stat-label">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
            <div className="landing-impact-right">
              <div className="landing-impact-globe-canvas">
                <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                  <Suspense fallback={null}>
                    <EarthScene />
                  </Suspense>
                </Canvas>
              </div>
              <div className="landing-impact-highlight">
                <span className="landing-impact-big-number">
                  <AnimatedCounter end={300} suffix="%" />
                </span>
                <p className="landing-impact-highlight-text">Growth in community engagement this year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="landing-hiw-section" id="how-it-works">
        <div className="landing-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="landing-hiw-title">HOW IT WORKS</motion.h2>
            <motion.div variants={fadeInUp} className="landing-hiw-grid">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  custom={i}
                  whileHover={{ y: -5 }}
                  className="landing-hiw-card"
                >
                  <div className="landing-hiw-number">{item.number}</div>
                  <div className="landing-hiw-card-icon">{item.icon}</div>
                  <p className="landing-hiw-label">{item.label}</p>
                  <p className="landing-hiw-sublabel">{item.sublabel}</p>
                  {i < howItWorks.length - 1 && (
                    <div className="landing-hiw-connector">
                      <svg width="60" height="20" viewBox="0 0 60 20">
                        <path d="M0,10 Q15,0 30,10 Q45,20 60,10" stroke="#8B7355" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <WaveDivider fill="#3d4f3d" />
      </section>

      {/* ─── COMMUNITY STORIES ─── */}
      <section className="landing-stories-section">
        <div className="landing-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="landing-stories-title">COMMUNITY STORIES</motion.h2>
            <motion.div variants={fadeInUp} className="landing-stories-grid">
              {communityStories.map((story, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  custom={i}
                  whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                  className="landing-story-card"
                >
                  <div className="landing-story-avatar">{story.avatar}</div>
                  <p className="landing-story-quote">"{story.quote}"</p>
                  <div className="landing-story-author">
                    <p className="landing-story-name">{story.name}</p>
                    <p className="landing-story-role">{story.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative leaf */}
        <motion.div
          className="landing-stories-leaf"
          animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Leaf size={80} color="#5a7c65" />
        </motion.div>
        <WaveDivider fill="#faf9f6" />
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="landing-cta-section">
        <div className="landing-cta-canvas">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.3} />
              <FloatingLeaves count={30} />
              <GlowingOrbs count={20} />
            </Suspense>
          </Canvas>
        </div>
        <div className="landing-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="landing-cta-content"
          >
            <motion.h2 variants={fadeInUp} className="landing-cta-title">
              Ready to Make a Difference?
            </motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="landing-cta-subtitle">
              Join thousands of eco-warriors already making the world a better place, one habit at a time.
            </motion.p>
            <motion.div variants={fadeInUp} custom={2}>
              <Link to="/register" className="landing-cta-btn" id="start-journey-btn">
                Start Your Eco-Journey Today <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-brand">
              <div className="landing-logo" style={{ marginBottom: '1rem' }}>
                <div className="landing-logo-icon">
                  <Leaf className="landing-logo-leaf" />
                </div>
                <span className="landing-logo-text" style={{ color: '#fff' }}>EarthTogether</span>
              </div>
              <p className="landing-footer-desc">
                A community-driven movement turning climate concern into real action. Together, we heal the earth.
              </p>
            </div>

            <div className="landing-footer-col">
              <h4 className="landing-footer-heading">Platform</h4>
              <Link to="/register" className="landing-footer-link">Join the Movement</Link>
              <Link to="/login" className="landing-footer-link">Sign In</Link>
              <a href="#how-it-works" className="landing-footer-link">How It Works</a>
            </div>

            <div className="landing-footer-col">
              <h4 className="landing-footer-heading">Community</h4>
              <Link to="/register" className="landing-footer-link">Challenges</Link>
              <Link to="/register" className="landing-footer-link">Leaderboard</Link>
              <Link to="/register" className="landing-footer-link">Eco-News</Link>
            </div>

            <div className="landing-footer-col">
              <h4 className="landing-footer-heading">Resources</h4>
              <button type="button" className="landing-footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>About Us</button>
              <button type="button" className="landing-footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Privacy Policy</button>
              <button type="button" className="landing-footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>Terms of Service</button>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <p className="landing-footer-copy">&copy; {new Date().getFullYear()} EarthTogether. All rights reserved. 🌍</p>
            <div className="landing-footer-socials">
              <button type="button" className="landing-footer-social" aria-label="External link"><ExternalLink size={18} /></button>
              <button type="button" className="landing-footer-social" aria-label="Globe"><Globe size={18} /></button>
              <button type="button" className="landing-footer-social" aria-label="Heart"><Heart size={18} /></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
