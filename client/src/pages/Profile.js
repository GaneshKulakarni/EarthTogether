import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, Trophy, Target, Leaf, Calendar, Newspaper, 
  Plus, MapPin, GraduationCap, Building2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import HabitCard from '../components/HabitCard';
import PostCard from '../components/PostCard';
import '../dark-theme.css';

// ── 3D Canvas Ecosystem Background Component ──
const ProfileEcosystemCanvas = ({ reducedMotion }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const container = containerRef.current;
    
    // Fallback to absolute sizes if clientDimensions are not yet populated
    const width = container.clientWidth > 0 ? container.clientWidth : 350;
    const height = container.clientHeight > 0 ? container.clientHeight : 280;

    let renderer;
    let globeGeometry, globeMaterial, coreGeometry, coreMaterial;
    let leafGeometry, leafMaterial, particleGeometry, particleMaterial;
    let particleTexture;
    let animationFrameId;

    try {
      // Scene
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.z = 7.5;

      // Renderer
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Group to hold all objects for mouse parallax
      const mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // 1. Holographic wireframe Globe
      globeGeometry = new THREE.SphereGeometry(2.1, 24, 24);
      globeMaterial = new THREE.MeshBasicMaterial({
        color: 0x10b981, // Emerald green
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      });
      const globe = new THREE.Mesh(globeGeometry, globeMaterial);
      mainGroup.add(globe);

      // Inner glowing core
      coreGeometry = new THREE.SphereGeometry(1.5, 16, 16);
      coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x047857, // Dark emerald
        transparent: true,
        opacity: 0.1,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      mainGroup.add(core);

      // 2. Floating nature elements (leaves)
      const leavesGroup = new THREE.Group();
      mainGroup.add(leavesGroup);

      const leafCount = 14;
      const leaves = [];

      // Create a simple leaf geometry using a Shape
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.quadraticCurveTo(0.25, 0.35, 0, 0.7);
      leafShape.quadraticCurveTo(-0.25, 0.35, 0, 0);

      leafGeometry = new THREE.ShapeGeometry(leafShape);
      leafMaterial = new THREE.MeshBasicMaterial({
        color: 0x34d399, // Light emerald
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });

      for (let i = 0; i < leafCount; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.3 + Math.random() * 0.7;
        leaf.position.set(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2.8,
          (Math.random() - 0.5) * 1.8
        );

        const scale = 0.25 + Math.random() * 0.3;
        leaf.scale.set(scale, scale, scale);
        leaf.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        leaves.push({
          mesh: leaf,
          angle: angle,
          radius: radius,
          speed: 0.003 + Math.random() * 0.006,
          rotSpeed: {
            x: (Math.random() - 0.5) * 0.015,
            y: (Math.random() - 0.5) * 0.015,
            z: (Math.random() - 0.5) * 0.015
          },
          yOffset: leaf.position.y,
          yFrequency: 0.4 + Math.random() * 1.2,
          yAmplitude: 0.15 + Math.random() * 0.25
        });

        leavesGroup.add(leaf);
      }

      // 3. Environmental Particles
      const particleCount = 50;
      particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.4 + Math.random() * 2.2;

        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = r * Math.cos(phi);
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Circular canvas texture
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16;
      pCanvas.height = 16;
      const pCtx = pCanvas.getContext('2d');
      const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(52, 211, 153, 0.9)');
      grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 16, 16);
      particleTexture = new THREE.CanvasTexture(pCanvas);

      particleMaterial = new THREE.PointsMaterial({
        color: 0x6ee7b7,
        size: 0.14,
        map: particleTexture,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      mainGroup.add(particles);

      // Mouse movement
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (event) => {
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left - width / 2;
        const y = event.clientY - rect.top - height / 2;
        targetX = (x / (width / 2)) * 0.35;
        targetY = (y / (height / 2)) * 0.35;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        globe.rotation.y = elapsedTime * 0.06;
        globe.rotation.x = elapsedTime * 0.02;

        leaves.forEach((l) => {
          l.angle += l.speed;
          l.mesh.position.x = Math.cos(l.angle) * l.radius;
          l.mesh.position.z = Math.sin(l.angle) * l.radius;
          l.mesh.position.y = l.yOffset + Math.sin(elapsedTime * l.yFrequency) * l.yAmplitude;
          
          l.mesh.rotation.x += l.rotSpeed.x;
          l.mesh.rotation.y += l.rotSpeed.y;
          l.mesh.rotation.z += l.rotSpeed.z;
        });

        particles.rotation.y = elapsedTime * 0.03;
        particles.rotation.x = -elapsedTime * 0.015;

        mouseX += (targetX - mouseX) * 0.06;
        mouseY += (targetY - mouseY) * 0.06;

        mainGroup.rotation.y = mouseX;
        mainGroup.rotation.x = mouseY;

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        // Skip resizing to 0 to prevent canvas disappearing
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        if (globeGeometry) globeGeometry.dispose();
        if (globeMaterial) globeMaterial.dispose();
        if (coreGeometry) coreGeometry.dispose();
        if (coreMaterial) coreMaterial.dispose();
        if (leafGeometry) leafGeometry.dispose();
        if (leafMaterial) leafMaterial.dispose();
        if (particleGeometry) particleGeometry.dispose();
        if (particleMaterial) particleMaterial.dispose();
        if (particleTexture) particleTexture.dispose();
        if (renderer) renderer.dispose();
      };
    } catch (err) {
      console.error('WebGL/Three.js context initialization failed:', err);
    }
  }, [reducedMotion]);

  return (
    <div 
      ref={containerRef} 
      className="absolute top-0 right-0 h-full w-[45%] pointer-events-none select-none overflow-hidden hidden md:block"
      style={{ mixBlendMode: 'screen', zIndex: 1 }}
    />
  );
};

// ── Interactive Stat Card Component ──
const InteractiveStatCard = ({ icon, label, value, color, reducedMotion }) => {
  return (
    <motion.div
      whileHover={reducedMotion ? {} : { y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="relative overflow-hidden group shadow-lg backdrop-blur-md transition-all duration-300"
      style={{
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        background: 'rgba(22, 27, 34, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
        minHeight: '160px',
        position: 'relative'
      }}
    >
      {/* Background Hover Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle 120px at 50% 50%, ${color}12, transparent 70%)`
        }}
      />

      {/* Topographic Lines SVG Background */}
      <svg
        className="absolute bottom-0 right-0 w-32 h-32 text-gray-800/20 group-hover:text-emerald-500/10 pointer-events-none transition-colors duration-500"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      >
        <path d="M 50 110 C 60 90, 80 80, 110 90" className={reducedMotion ? '' : 'contour-line-1'} />
        <path d="M 30 110 C 45 80, 75 70, 110 75" className={reducedMotion ? '' : 'contour-line-2'} />
        <path d="M 10 110 C 30 70, 70 60, 110 60" className={reducedMotion ? '' : 'contour-line-3'} />
        <path d="M -10 110 C 15 60, 65 50, 110 45" className={reducedMotion ? '' : 'contour-line-4'} />
      </svg>

      {/* Icon Badge */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform duration-300 shadow-inner"
        style={{ 
          background: `${color}12`,
          border: `1px solid ${color}25`,
          color: color
        }}
      >
        <span>{icon}</span>
      </div>

      {/* Value */}
      <div 
        className="text-2xl font-black tracking-tight mt-3 select-all"
        style={{ color: color }}
      >
        {value}
      </div>

      {/* Label */}
      <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">
        {label}
      </div>
    </motion.div>
  );
};

// ── Achievement Card Component ──
const AchievementCard = ({ badge, index, userJoinedAt }) => {
  const badgeName = typeof badge === 'string' ? badge : badge.name;
  const badgeDescription = badge.description || 'Achievement unlocked!';
  const badgeIcon = badge.icon || '🏆';
  const completionDate = userJoinedAt ? new Date(userJoinedAt).toLocaleDateString() : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, x: 4 }}
      className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#1b1c26]/60 to-[#13141a]/60 border border-amber-500/10 hover:border-amber-500/30 shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform duration-300">
          {badgeIcon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
            {badgeName}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">{badgeDescription}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Completed
          </span>
          <div className="text-[10px] text-gray-500 mt-1.5">{completionDate}</div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Profile Main Component ──
const Profile = () => {
  const navigate = useNavigate();
  const { user, loadUser, isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userHabits, setUserHabits] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [, setUserChallenges] = useState([]);
  const [formData, setFormData] = useState({ username: '', bio: '', avatar: '', location: '', education: '', institution: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Spotlight coordinates state
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Reduced motion media query hook
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        if (!user && isAuthenticated) await loadUser();
      } catch (_) {
        if (isMounted) toast.error('Failed to load profile data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, [user, isAuthenticated, loadUser]);

  useEffect(() => {
    if (user) setFormData({ username: user.username || '', bio: user.bio || '', avatar: user.avatar || '', location: user.location || '', education: user.education || '', institution: user.institution || '' });
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated && !loading) navigate('/login');
  }, [isAuthenticated, loading, navigate]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) fetchJoinedChallenges(); }, [user?._id]);

  const fetchJoinedChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/challenges', { headers: { 'x-auth-token': token } });
      const joined = res.data.filter(c => c.participants.some(p => p.user === user?._id));
      setUserChallenges(joined.map(c => c._id));
    } catch (err) {
      console.error('Error fetching joined challenges:', err);
    }
  };

  const fetchUserHabits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/habits', { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } });
      setUserHabits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading habits:', err);
      toast.error('Failed to load habits.');
    }
  };

  const fetchUserPostsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/posts/my-posts', { headers: { 'x-auth-token': token } });
      if (Array.isArray(res.data)) {
        setUserPosts(res.data);
      } else { setUserPosts([]); }
    } catch (err) {
      console.error('Error loading user posts:', err);
      setUserPosts([]);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/posts/like/${postId}`, {}, { headers: { 'x-auth-token': token } });
      setUserPosts(prev => prev.map(p => p._id === postId ? response.data : p));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    if (!comment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/posts/comment/${postId}`, { content: comment }, { headers: { 'x-auth-token': token } });
      fetchUserPostsData();
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updateData = new FormData();
      if (formData.username) updateData.append('username', formData.username);
      if (formData.bio !== undefined) updateData.append('bio', formData.bio);
      if (formData.location !== undefined) updateData.append('location', formData.location);
      if (formData.education !== undefined) updateData.append('education', formData.education);
      if (formData.institution !== undefined) updateData.append('institution', formData.institution);
      if (selectedFile) updateData.append('avatar', selectedFile);
      await axios.put('/api/users/profile', updateData, { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated!');
      setEditing(false);
      setSelectedFile(null);
      loadUser();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  // Spotlight mouse listener
  const handleHeroMouseMove = (e) => {
    if (!heroRef.current || prefersReducedMotion) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  if (loading && !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(52,211,153,0.2)', borderTopColor: '#34d399', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const resolvedAvatar = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`)
    : null;

  const statItems = [
    { icon: '🏆', label: 'Eco Points', value: user?.ecoPoints || 0, color: '#f59e0b' },
    { icon: '🔥', label: 'Current Streak', value: user?.currentStreak || 0, color: '#f97316' },
    { icon: '🌿', label: 'CO₂ Saved', value: `${user?.totalCarbonSaved || 0} kg`, color: '#10b981' },
    { icon: '🏅', label: 'Badges Earned', value: user?.badges?.length || 0, color: '#06b6d4' },
  ];

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'habits', label: '🌱 My Habits' },
    { id: 'feed', label: '📝 My Posts' },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Dynamic Contour Line Animations declarations */}
      <style>{`
        .contour-line-1 { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawContour 24s linear infinite; }
        .contour-line-2 { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawContour 30s linear infinite reverse; }
        .contour-line-3 { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawContour 36s linear infinite; }
        .contour-line-4 { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawContour 42s linear infinite reverse; }
        @keyframes drawContour {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ── Tab Bar + Actions ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div className="dark-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`dark-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => {
                setActiveTab(t.id);
                if (t.id === 'habits') fetchUserHabits();
                if (t.id === 'feed') fetchUserPostsData();
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dark-btn-primary" onClick={() => navigate('/habits')}>  <Plus size={14} /> New Habit</button>
          <button className="dark-btn-secondary" onClick={() => navigate('/welcome')}> <Plus size={14} /> New Post</button>
        </div>
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <>
          {/* Profile Header Card */}
          <div 
            ref={heroRef}
            onMouseMove={handleHeroMouseMove}
            className="group transition-all duration-300"
            style={{
              padding: 28,
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '24px',
              '--mouse-x': `${coords.x}px`,
              '--mouse-y': `${coords.y}px`,
              background: prefersReducedMotion 
                ? 'rgba(22, 27, 34, 0.95)' 
                : 'radial-gradient(circle 350px at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.08) 0%, transparent 80%), rgba(22, 27, 34, 0.65)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Live 3D Ecosystem Canvas */}
            <ProfileEcosystemCanvas reducedMotion={prefersReducedMotion} />

            <div className="relative z-10 flex justify-between items-center mb-6">
              <h1 className="text-xl font-black text-white tracking-wide uppercase">My Profile</h1>
              <button
                className="dark-btn-secondary border border-gray-800 hover:border-emerald-500/40 text-gray-300 hover:text-emerald-400 transition-all rounded-xl py-2 px-4 flex items-center gap-2"
                style={{ background: 'rgba(22, 27, 34, 0.5)' }}
                onClick={() => setEditing(!editing)}
              >
                <Edit size={14} /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              /* ── Edit Form ── */
              <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4 max-w-xl">
                {[
                  { name: 'username', label: 'Username', type: 'text', placeholder: 'Your username' },
                  { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
                  { name: 'education', label: 'Education', type: 'text', placeholder: 'Degree, Field of Study' },
                  { name: 'institution', label: 'Institution', type: 'text', placeholder: 'University or Organization' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="dark-label">{field.label}</label>
                    <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} className="dark-input" />
                  </div>
                ))}
                <div>
                  <label className="dark-label">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="dark-input" placeholder="Tell us about your eco-journey…" style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="dark-label">Profile Picture</label>
                  <input
                    type="file" accept="image/*" onChange={handleFileChange}
                    style={{ fontSize: 13, color: '#8b949e', width: '100%' }}
                  />
                  {selectedFile && <p style={{ fontSize: 11, color: '#34d399', marginTop: 4 }}>Selected: {selectedFile.name}</p>}
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="button" className="dark-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="dark-btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              /* ── View Mode ── */
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex flex-col sm:flex-row gap-6 items-start flex-1 w-full">
                  {/* Glowing Avatar Frame */}
                  <div className="relative flex-shrink-0 group">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-400 group-hover:shadow-[0_0_25px_rgba(52,211,153,0.45)]"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #047857)',
                      }}
                    >
                      {resolvedAvatar
                        ? <img src={resolvedAvatar} alt={user?.username} className="w-full h-full object-cover" />
                        : <span className="text-3xl font-extrabold text-white">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                      }
                    </div>
                    {/* Small Green Leaf Badge */}
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#10b981] border border-emerald-400 rounded-full flex items-center justify-center shadow-lg text-white transform translate-x-0.5 translate-y-0.5 select-none">
                      <Leaf size={12} fill="white" />
                    </div>
                  </div>

                  {/* Profile info details */}
                  <div className="flex-1 w-full">
                    <h2 className="text-2xl font-black text-white tracking-wide leading-none">{user?.username}</h2>
                    <p className="text-sm font-semibold text-emerald-400/90 mt-2 mb-3 tracking-wide">
                      {user?.bio || 'No bio yet. Tell us about your eco-journey!'}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-2.5 mt-4 text-[11px] font-bold text-gray-400">
                      {user?.location && (
                        <span className="flex items-center gap-1.5 bg-gray-800/40 py-1.5 px-3 rounded-xl border border-gray-800/60 hover:text-white transition-colors duration-200">
                          <MapPin size={11} className="text-emerald-400" /> {user.location}
                        </span>
                      )}
                      {user?.education && (
                        <span className="flex items-center gap-1.5 bg-gray-800/40 py-1.5 px-3 rounded-xl border border-gray-800/60 hover:text-white transition-colors duration-200">
                          <GraduationCap size={11} className="text-emerald-400" /> {user.education}
                        </span>
                      )}
                      {user?.institution && (
                        <span className="flex items-center gap-1.5 bg-gray-800/40 py-1.5 px-3 rounded-xl border border-gray-800/60 hover:text-white transition-colors duration-200">
                          <Building2 size={11} className="text-emerald-400" /> {user.institution}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 bg-gray-800/40 py-1.5 px-3 rounded-xl border border-gray-800/60 hover:text-white transition-colors duration-200">
                        <Calendar size={11} className="text-emerald-400" /> Joined {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>

                    {/* Followers Counter */}
                    <div className="flex gap-6 mt-6 border-t border-gray-800/40 pt-4 w-full">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-emerald-400">{user?.followers?.length || 0}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Followers</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-emerald-400">{user?.following?.length || 0}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Following</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {statItems.map((s) => (
              <InteractiveStatCard
                key={s.label}
                icon={s.icon}
                label={s.label}
                value={s.value}
                color={s.color}
                reducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          {/* Achievements Section */}
          <div className="border border-gray-800/70 rounded-2xl p-6 backdrop-blur-md shadow-lg" style={{ background: 'rgba(22, 27, 34, 0.5)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                <Trophy size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Achievements</h3>
            </div>

            {user?.badges && user.badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.badges.map((badge, i) => (
                  <AchievementCard 
                    key={i} 
                    badge={badge} 
                    index={i} 
                    userJoinedAt={user?.joinedAt} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Trophy size={48} className="text-gray-600 mb-4 opacity-40" />
                <h4 className="text-base font-bold text-gray-400">No achievements yet</h4>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  Complete eco-habits and maintain streaks to earn achievements!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── My Habits Tab ── */}
      {activeTab === 'habits' && (
        <div className="dark-card" style={{ padding: 24 }}>
          <div className="dark-section-header">
            <div className="dark-section-icon"><Leaf size={18} /></div>
            <span className="dark-section-title">My Habits</span>
          </div>
          {userHabits.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {userHabits.map(h => (
                <HabitCard key={h._id} habit={h} onComplete={() => fetchUserHabits()} onHabitUpdated={() => fetchUserHabits()} />
              ))}
            </div>
          ) : (
            <div className="dark-empty">
              <Target size={44} />
              <h3>No habits yet</h3>
              <p>Start tracking your eco-habits to see them here!</p>
              <button className="dark-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/habits')}>
                + Create Habit
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── My Posts Tab ── */}
      {activeTab === 'feed' && (
        <div>
          <div className="dark-section-header" style={{ marginBottom: 20 }}>
            <div className="dark-section-icon"><Newspaper size={18} /></div>
            <span className="dark-section-title">My Posts</span>
          </div>
          {userPosts.length > 0 ? (
            <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {userPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  showDelete={true}
                  onLike={handleLike}
                  onComment={handleComment}
                  onDelete={async (postId) => {
                    if (!window.confirm('Delete this post?')) return;
                    try {
                      const token = localStorage.getItem('token');
                      await axios.delete(`/api/posts/${postId}`, { headers: { 'x-auth-token': token } });
                      setUserPosts(p => p.filter(x => x._id !== postId));
                      toast.success('Post deleted');
                    } catch (err) {
                      console.error('Error deleting post:', err);
                      toast.error('Failed to delete post');
                    }
                  }}
                  onEdit={() => fetchUserPostsData()}
                />
              ))}
            </div>
          ) : (
            <div className="dark-card dark-empty" style={{ padding: '48px 24px' }}>
              <Newspaper size={44} />
              <h3>No posts yet</h3>
              <p>Share your eco-journey with the community!</p>
              <button className="dark-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/welcome')}>
                + Create Post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
