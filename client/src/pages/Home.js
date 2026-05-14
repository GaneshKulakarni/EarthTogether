import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import { useNotifications } from "../context/NotificationContext";
import { getPosts, likePost, commentOnPost, createPost } from "../services/api";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image,
  Smile,
  Trophy,
  Plus,
} from "lucide-react";
import UserProfileModal from "../components/UserProfileModal";
import AppSidebar from "../components/AppSidebar";
import "./Home.css";

/* ─── Mock data for right panel ─── */
const MOCK_IMPACT = { co2: 12.4, plastic: 2.5, water: 42, progress: 72 };

const MOCK_CHALLENGES = [
  {
    id: "c1", name: "7-Day Zero Waste", tag: "Active", tagClass: "active",
    meta: "12.8k participating", progress: 65,
  },
  {
    id: "c2", name: "Community Tree Drive", tag: "Ends in 2D", tagClass: "ending",
    meta: "4,502 trees planted", progress: 45, gold: true,
  },
];

const MOCK_GUARDIANS = [
  { id: "g1", name: "Marcus Thorne", points: "2,840", rank: 1, emoji: "🌿" },
  { id: "g2", name: "Sarah Sun",     points: "2,510", rank: 2, emoji: "☀️" },
  { id: "g3", name: "David Gale",    points: "2,190", rank: 3, emoji: "🌊" },
];

/* ─── Helpers ─── */
const rankClass = (r) => r === 1 ? "gold" : r === 2 ? "silver" : "bronze";

const getBadgeClass = (category) => {
  if (!category) return "general";
  const l = category.toLowerCase();
  if (l.includes("research")) return "research";
  if (l.includes("challenge")) return "challenge";
  return "general";
};

/* ─── PostCard Component ─── */
const PostCard = ({ 
  post, 
  showComments, 
  setShowComments, 
  commentText, 
  setCommentText, 
  handleLike, 
  handleShare, 
  handleComment, 
  openProfile, 
  user 
}) => {
  const pid = post.id || post._id;
  const badgeClass = getBadgeClass(post.category);
  const isLiked = post.liked;

  return (
    <article className="post-card">
      {/* Header */}
      <header className="post-header">
        <div className="post-user">
          <div 
            className="post-avatar" 
            onClick={() => openProfile(post.user._id)}
          >
            {post.user.avatar}
          </div>
          <div className="post-user-info">
            <h4 onClick={() => openProfile(post.user._id)}>
              {post.user.name}
            </h4>
            <p>{post.user.title} · {post.timeAgo}</p>
          </div>
        </div>
        <span className={`post-badge ${badgeClass}`}>
          {post.category}
        </span>
      </header>

      {/* Content */}
      <div className="post-content">
        {post.content}
      </div>

      {/* Stats */}
      {post.stats && (
        <div className="post-stats">
          {post.stats.map((stat) => (
            <div key={stat.label} className="post-stat-item">
              <span className="post-stat-label">{stat.label}</span>
              <span className="post-stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image && (
        <div className="post-image-container">
          <img src={post.image} alt="Post content" className="post-image" />
        </div>
      )}

      {/* Footer */}
      <footer className="post-footer">
        <div className="post-reactions">
          <button 
            className={`reaction-btn ${isLiked ? 'liked' : ''}`} 
            onClick={() => handleLike(pid)}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            {post.likes > 999 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
          </button>
          <button 
            className="reaction-btn" 
            onClick={() => setShowComments({ ...showComments, [pid]: !showComments[pid] })}
          >
            <MessageCircle size={16} />
            {post.comments}
          </button>
        </div>
        <button className="share-btn" onClick={() => handleShare(pid)}>
          <Share2 size={16} />
        </button>
      </footer>

      {/* Comments */}
      {showComments[pid] && (
        <div className="comment-section">
          <div className="comment-row">
            <div className="comment-avatar">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <input
              className="comment-input"
              placeholder="Write a comment..."
              value={commentText[pid] || ''}
              onChange={(e) => setCommentText({ ...commentText, [pid]: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleComment(pid)}
            />
            <button className="comment-send" onClick={() => handleComment(pid)}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

/* ─── Main Home Component ─── */
const Home = () => {
  const { user } = useAuth();
  const { sharePost: sharePostAction } = usePost();
  useNotifications();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [postText, setPostText] = useState("");
  const [postExpanded, setPostExpanded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const fileInputRef = useRef(null);


  /* ── Featured posts ── */
  const featuredPosts = [
    {
      id: "r1", _id: "r1",
      user: { name: "Global Reforestation Report", avatar: "🌱", title: "Climate Research Labs", _id: "u1" },
      content: 'New data suggests that "Miyawaki" forests are growing 10× faster and being 30× denser than conventional plantations. Check out the latest biodiversity metrics from our Singapore project site.',
      image: null,
      likes: 1200, comments: 84, shares: 31, timeAgo: "3 hours ago",
      liked: false, category: "Research Highlight",
      stats: [
        { label: "Growth Rate", value: "+142%" },
        { label: "CO2 Seq.",   value: "24t/yr" },
        { label: "Active Sites", value: "892" },
      ],
    },
    {
      id: "m1", _id: "m1",
      user: { name: "Elena Green", avatar: "🏖️", title: "Pacific Clean-up Crew", _id: "u2" },
      content: "Our weekend beach cleanup was a massive success! We collected over 450lbs of microplastics and fishing nets. Huge shoutout to the 40 volunteers who showed up. The ocean thanks you! 🌊💙 #CleanTheOcean #VerdantCollective",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
      likes: 342, comments: 27, shares: 15, timeAgo: "20 mins ago",
      liked: false, category: "Community",
      stats: null,
    },
  ];

  const [apiPosts, setApiPosts] = useState([]);

  /* ── Fetch posts ── */
  useEffect(() => {
    setPosts(featuredPosts);

    (async () => {
      try {
        const data = await getPosts();
        if (data?.length > 0) {
          const formatted = data
            .filter((p) => p.content && p.content.trim().length > 10)
            .map((p) => {
              let img = p.imageUrl || null;
              if (img && (img.startsWith("/images/") || img.startsWith("/uploads/"))) img = null;
              return {
                id: p._id, _id: p._id,
                user: { name: p.user?.username || "EcoMember", avatar: "🌱", title: "EarthTogether Member", _id: p.user?._id || p.user },
                content: p.content, image: img,
                likes: p.likes?.length || 0, comments: p.comments?.length || 0, shares: p.shares?.length || 0,
                timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "recently",
                liked: false, category: p.category || "General", stats: null,
              };
            });
          setApiPosts(formatted);
        }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  /* ── Handlers ── */
  const updatePost = (id, updater) => {
    setPosts((prev) => prev.map((p) => (p.id === id || p._id === id) ? updater(p) : p));
    setApiPosts((prev) => prev.map((p) => (p.id === id || p._id === id) ? updater(p) : p));
  };

  const handleLike = async (id) => {
    try { await likePost(id); } catch (_) {}
    updatePost(id, (p) => ({ ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }));
  };

  const handleComment = async (id) => {
    const txt = commentText[id];
    if (!txt?.trim()) return;
    try { await commentOnPost(id, txt); } catch (_) {}
    updatePost(id, (p) => ({ ...p, comments: p.comments + 1 }));
    setCommentText({ ...commentText, [id]: "" });
  };

  const handleShare = async (id) => {
    try { await sharePostAction(id); } catch (_) {}
    updatePost(id, (p) => ({ ...p, shares: p.shares + 1 }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPostImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    try {
      const saved = await createPost({ content: postText, category: "General", imageUrl: postImage || "" });
      const np = {
        id: saved._id, _id: saved._id,
        user: { name: user?.username || "User", avatar: "🌱", title: "EarthTogether Member", _id: user?._id },
        content: postText, image: postImage, likes: 0, comments: 0, shares: 0,
        timeAgo: "just now", liked: false, category: "General", stats: null,
      };
      setPosts([np, ...posts]);
    } catch (_) { alert("Failed to post. Please try again."); }
    setPostText("");
    setPostImage(null);
    setPostExpanded(false);
  };

  const openProfile = (uid) => { setSelectedUserId(uid); setShowUserProfile(true); };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="home-shell" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            border: "3px solid #34d399", 
            borderTopColor: "transparent", 
            borderRadius: "50%", 
            animation: "spin 0.8s linear infinite", 
            margin: "0 auto 12px" 
          }} />
          <p style={{ color: "#8b949e", fontSize: 14 }}>Loading your eco-feed...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="home-shell">
      {/* ════ LEFT SIDEBAR (shared component) ════ */}
      <AppSidebar />

      {/* ════ MAIN FEED ════ */}
      <main className="home-feed">
        {/* Create Post */}
        <div className="create-post-card">
          <div className="create-post-top">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                user?.username?.[0]?.toUpperCase() || "U"
              )}
            </div>
            {!postExpanded ? (
              <div className="create-post-input" onClick={() => setPostExpanded(true)}>
                Share your eco-journey...
              </div>
            ) : (
              <textarea
                autoFocus
                className="create-post-expand"
                rows={4}
                placeholder="What's your eco-story today?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            )}
          </div>

          {postImage && (
            <div style={{ position: "relative", margin: "0 16px 8px" }}>
              <img src={postImage} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }} />
              <button onClick={handleRemoveImage} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
            </div>
          )}
          <div className="create-post-actions">
            <div className="post-action-btns">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} style={{ display: "none" }} />
              <button className="post-action-btn" onClick={() => fileInputRef.current?.click()}><Image size={16} /> Photo</button>
              <button className="post-action-btn"><Smile size={16} /> Mood</button>
            </div>
            {postExpanded ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="post-action-btn" onClick={() => { setPostExpanded(false); setPostText(""); setPostImage(null); }}>
                  Cancel
                </button>
                <button className="btn-post" onClick={handleCreatePost} disabled={!postText.trim()}>
                  Post
                </button>
              </div>
            ) : (
              <button className="btn-post" onClick={() => setPostExpanded(true)}>Post</button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {[...posts, ...apiPosts].length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <p className="empty-state-text">No posts yet. Be the first to share your eco-journey!</p>
          </div>
        )}

        {/* Featured Posts Section */}
        {posts.length > 0 && (
          <section className="feed-section">
            <div className="feed-section-header">
              <span className="feed-section-label">Featured Posts</span>
              <div className="feed-section-line"></div>
            </div>
            {posts.map((post) => (
              <PostCard 
                key={post.id || post._id} 
                post={post} 
                showComments={showComments} 
                setShowComments={setShowComments} 
                commentText={commentText} 
                setCommentText={setCommentText} 
                handleLike={handleLike} 
                handleShare={handleShare} 
                handleComment={handleComment} 
                openProfile={openProfile} 
                user={user}
              />
            ))}
          </section>
        )}

        {/* Community Posts Section */}
        {apiPosts.length > 0 && (
          <section className="feed-section">
            <div className="feed-section-header">
              <span className="feed-section-label">Community Posts</span>
              <div className="feed-section-line"></div>
            </div>
            {apiPosts.map((post) => (
              <PostCard 
                key={post.id || post._id} 
                post={post} 
                showComments={showComments} 
                setShowComments={setShowComments} 
                commentText={commentText} 
                setCommentText={setCommentText} 
                handleLike={handleLike} 
                handleShare={handleShare} 
                handleComment={handleComment} 
                openProfile={openProfile} 
                user={user}
              />
            ))}
          </section>
        )}
      </main>

      {/* ════ RIGHT PANEL ════ */}
      <aside className="home-panel">
        {/* Daily Impact */}
        <div className="impact-widget">
          <div className="widget-label">Your Daily Impact</div>
          <div className="impact-big-number">
            <span className="impact-num">{MOCK_IMPACT.co2}</span>
            <span className="impact-unit">kg CO₂ Saved</span>
          </div>
          <div className="impact-bar">
            <div className="impact-bar-fill" style={{ width: `${MOCK_IMPACT.progress}%` }} />
          </div>
          <div className="impact-grid">
            <div className="impact-stat">
              <span className="impact-stat-label">Plastic Reduced</span>
              <span className="impact-stat-value">{MOCK_IMPACT.plastic}kg</span>
            </div>
            <div className="impact-stat">
              <span className="impact-stat-label">Water Saved</span>
              <span className="impact-stat-value">{MOCK_IMPACT.water}L</span>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div>
          <div className="panel-section-header">
            <span className="panel-section-title">Challenges</span>
            <Link to="/challenges" className="panel-view-all">View All</Link>
          </div>
          {MOCK_CHALLENGES.map((c) => (
            <div key={c.id} className="challenge-card">
              <div className="challenge-card-header">
                <span className="challenge-name">{c.name}</span>
                <span className={`challenge-tag ${c.tagClass}`}>{c.tag}</span>
              </div>
              <div className="challenge-meta">
                <div className="challenge-avatars">
                  {[..."ABC"].map((l) => (
                    <div key={l} className="challenge-avatar-tiny">{l}</div>
                  ))}
                </div>
                {c.meta}
              </div>
              <div className="challenge-progress">
                <div
                  className={`challenge-progress-fill ${c.gold ? "gold" : ""}`}
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Top Guardians */}
        <div>
          <div className="panel-section-header">
            <span className="panel-section-title">Top Guardians</span>
          </div>
          {MOCK_GUARDIANS.map((g) => (
            <div key={g.id} className="guardian-row">
              <div className={`guardian-rank ${rankClass(g.rank)}`}>{g.rank}</div>
              <div className="guardian-avatar">{g.emoji}</div>
              <div className="guardian-info">
                <p className="guardian-name">{g.name}</p>
                <p className="guardian-points">{g.points} ECO-POINTS</p>
              </div>
              {g.rank === 1 && <Trophy size={18} className="guardian-icon" />}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="panel-footer">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Cookie Policy</span>
          <span>Help Center</span>
        </div>
      </aside>

      {/* FAB */}
      <button className="fab" onClick={() => { setPostExpanded(true); document.querySelector(".home-feed")?.scrollTo({ top: 0, behavior: "smooth" }); }}>
        <Plus size={22} />
      </button>

      {/* User Profile Modal */}
      <UserProfileModal userId={selectedUserId} isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
    </div>
  );
};

export default Home;
