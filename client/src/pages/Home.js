import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import { useNotifications } from "../context/NotificationContext";
import axios from "axios";
import { getPosts, likePost, commentOnPost, createPost, deletePost as deletePostApi, uploadMedia } from "../services/api";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image,
  Smile,
  Edit2,
  Trash2,
  MoreHorizontal,
  Trophy,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
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

/* ─── PostSkeleton Component ─── */
const PostSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-avatar skeleton" />
        <div className="skeleton-user-info">
          <div className="skeleton-name skeleton" />
          <div className="skeleton-title skeleton" />
        </div>
        <div className="skeleton-badge skeleton" />
      </div>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton" />
        <div className="skeleton-line skeleton" style={{ width: '95%' }} />
        <div className="skeleton-line skeleton short" />
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-btn-group">
          <div className="skeleton-btn skeleton" />
          <div className="skeleton-btn skeleton" />
        </div>
        <div className="skeleton-icon-btn skeleton" />
      </div>
    </div>
  );
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
  user,
  onDelete,
  onEdit,
  editingPostId,
  editContent,
  setEditContent,
  setEditingPostId,
  onSaveEdit,
}) => {
  const pid = post.id || post._id;
  const badgeClass = getBadgeClass(post.category);
  const isLiked = post.liked;
  const isOwner = user && post.user && (post.user._id === user._id || post.user.id === user.id);
  const [showDropdown, setShowDropdown] = useState(false);
  const isEditing = editingPostId === pid;

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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className={`post-badge ${badgeClass}`}>
            {post.category}
          </span>
          {isOwner && (
            <div className="relative" style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, color: "#8b949e", fontSize: 16 }}
                onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.target.style.background = "none"}
              >
                <MoreHorizontal size={16} />
              </button>
              {showDropdown && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, width: 160, background: "#1a2030", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, zIndex: 20, overflow: "hidden" }}>
                  <button onClick={() => { setShowDropdown(false); onEdit(pid, post.content); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", color: "#e6edf3", fontSize: 13, textAlign: "left" }}
                    onMouseEnter={e => e.target.style.background = "rgba(52,211,153,0.1)"}
                    onMouseLeave={e => e.target.style.background = "none"}
                  ><Edit2 size={14} /> Edit Post</button>
                  <button onClick={() => { setShowDropdown(false); onDelete(pid); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", color: "#f87171", fontSize: 13, textAlign: "left" }}
                    onMouseEnter={e => e.target.style.background = "rgba(248,113,113,0.1)"}
                    onMouseLeave={e => e.target.style.background = "none"}
                  ><Trash2 size={14} /> Delete Post</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      {isEditing ? (
        <div style={{ marginBottom: 12 }}>
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(52,211,153,0.3)", background: "#0f1923", color: "#e6edf3", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => { setEditingPostId(null); setEditContent(""); }}
                style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#8b949e", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Cancel</button>
            <button onClick={() => { onSaveEdit(pid); }}
              style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#34d399", color: "#0a2818", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Save</button>
          </div>
        </div>
      ) : (
        <div className="post-content">
          {post.content}
        </div>
      )}

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
      {post.image && !post.video && (
        <div className="post-image-container">
          <img src={post.image} alt="Post content" className="post-image" />
        </div>
      )}

      {/* Video */}
      {post.video && (
        <div className="post-video-container" style={{ margin: "0 16px 12px", borderRadius: 12, overflow: "hidden", background: "#000" }}>
          <video 
            src={post.video} 
            controls 
            className="post-video" 
            style={{ width: "100%", display: "block", maxHeight: 500 }}
            poster={post.image || ""}
          />
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
  const [apiLoading, setApiLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [postText, setPostText] = useState("");
  const [postExpanded, setPostExpanded] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [postImage, setPostImage] = useState(null);        // preview URL (not sent to API)
  const [postImageFile, setPostImageFile] = useState(null); // actual File object for upload
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const fileInputRef = useRef(null);

  const ecoEmojis = ["🌱","🌍","🌎","🌏","🌿","☀️","🌊","♻️","💚","🌳","🌸","🐝","🦋","🌻","🍃","💧","🔥","🌟","💪","🙌","🌺","🍀","🌲","🐢","🐬","☁️","🌈","✨","💡","📢"];


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
    setLoading(false);
    setApiLoading(true);

    (async () => {
      try {
        const data = await getPosts();
        if (data?.length > 0) {
          const formatted = data
            .filter((p) => p.content && p.content.trim().length > 0)
            .map((p) => {
              let img = p.imageUrl || null;
              if (img && (img.startsWith("/images/") || img.startsWith("/uploads/"))) img = null;
              return {
                id: p._id, _id: p._id,
                user: { name: p.user?.username || "EcoMember", avatar: "🌱", title: "EarthTogether Member", _id: p.user?._id || p.user },
                content: p.content, image: img, video: p.videoUrl || null,
                likes: p.likes?.length || 0, comments: p.comments?.length || 0, shares: p.shares?.length || 0,
                timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "recently",
                liked: false, category: p.category || "General", stats: null,
              };
            });
          setApiPosts(formatted);
        }
      } catch (err) {
        console.error("Error fetching posts on load:", err);
      } finally {
        setApiLoading(false);
      }
    })();
  }, []);

  /* ── Handlers ── */
  const updatePost = (id, updater) => {
    setPosts((prev) => prev.map((p) => (p.id === id || p._id === id) ? updater(p) : p));
    setApiPosts((prev) => prev.map((p) => (p.id === id || p._id === id) ? updater(p) : p));
  };

  const isMockPost = (id) => typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/);

  const handleLike = async (id) => {
    if (!isMockPost(id)) {
      try {
        await likePost(id);
      } catch (err) {
        console.error("Error liking post:", err);
      }
    }
    updatePost(id, (p) => ({ ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }));
  };

  const handleComment = async (id) => {
    const txt = commentText[id];
    if (!txt?.trim()) return;
    if (!isMockPost(id)) {
      try {
        await commentOnPost(id, txt);
      } catch (err) {
        console.error("Error commenting on post:", err);
      }
    }
    updatePost(id, (p) => ({ ...p, comments: p.comments + 1 }));
    setCommentText({ ...commentText, [id]: "" });
  };

  const handleShare = async (id) => {
    if (!isMockPost(id)) {
      try {
        await sharePostAction(id);
      } catch (err) {
        console.error("Error sharing post:", err);
      }
    }
    updatePost(id, (p) => ({ ...p, shares: p.shares + 1 }));
  };

  const handleDeletePost = async (id) => {
    if (isMockPost(id)) {
      setPosts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      setApiPosts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      toast.success("Post deleted");
      return;
    }
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePostApi(id);
      setPosts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      setApiPosts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      toast.success("Post deleted");
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error("Failed to delete post");
    }
  };

  const handleEditPost = async (id) => {
    if (!editContent.trim() || isMockPost(id)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/posts/${id}`, { content: editContent }, { headers: { "x-auth-token": token } });
      const updated = res.data;
      const updater = (p) => ({
        ...p,
        content: updated.content || editContent,
        image: updated.imageUrl || p.image,
        video: updated.videoUrl || p.video,
      });
      setPosts((prev) => prev.map((p) => ((p.id || p._id) === id ? updater(p) : p)));
      setApiPosts((prev) => prev.map((p) => ((p.id || p._id) === id ? updater(p) : p)));
      setEditingPostId(null);
      setEditContent("");
      toast.success("Post updated");
    } catch (err) {
      console.error("Error updating post:", err);
      toast.error("Failed to update post");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      setPostImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (postImage) URL.revokeObjectURL(postImage);
    setPostImage(null);
    setPostImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const refreshApiPosts = async () => {
    try {
      const data = await getPosts();
      if (data?.length > 0) {
        const formatted = data
          .filter((p) => p.content && p.content.trim().length > 0)
          .map((p) => {
            let img = p.imageUrl || null;
            if (img && (img.startsWith("/images/") || img.startsWith("/uploads/"))) img = null;
            return {
              id: p._id, _id: p._id,
              user: { name: p.user?.username || "EcoMember", avatar: "🌱", title: "EarthTogether Member", _id: p.user?._id || p.user },
              content: p.content, image: img, video: p.videoUrl || null,
              likes: p.likes?.length || 0, comments: p.comments?.length || 0, shares: p.shares?.length || 0,
              timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "recently",
              liked: false, category: p.category || "General", stats: null,
            };
          });
        setApiPosts(formatted);
      }
    } catch (err) {
      console.error("Error refreshing posts:", err);
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    let saved;
    try {
      let mediaUrl = "";
      let resourceType = "";
      if (postImageFile) {
        const uploadRes = await uploadMedia(postImageFile);
        mediaUrl = uploadRes.url;
        resourceType = uploadRes.resource_type;
      }
      saved = await createPost({ 
        content: postText, 
        category: "General", 
        imageUrl: resourceType === "image" ? mediaUrl : "",
        videoUrl: resourceType === "video" ? mediaUrl : ""
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to post";
      if (err.code === 'ECONNABORTED' || (msg && msg.includes("timeout"))) {
        toast.error("Upload timed out. The image may be too large (max 10MB).");
      } else if (msg && msg.includes("content") && msg.toLowerCase().includes("length")) {
        toast.error("Content is too long (max 2000 characters)");
      } else if (msg && msg.includes("Content is required")) {
        toast.error("Please write something to share");
      } else {
        toast.error("Failed to post. " + (msg || "Try a smaller image."));
      }
      setPosting(false);
      return;
    }

    const np = {
      id: saved._id, _id: saved._id,
      user: { name: user?.username || "EcoMember", avatar: user?.avatar || "🌱", title: "EarthTogether Member", _id: user?._id },
      content: postText, image: saved.imageUrl || null, video: saved.videoUrl || null, likes: 0, comments: 0, shares: 0,
      timeAgo: "just now", liked: false, category: "General", stats: null,
    };
    setApiPosts((prev) => [np, ...prev]);
    toast.success("Post shared!");
    refreshApiPosts();

    if (postImage) URL.revokeObjectURL(postImage);
    setPosting(false);
    setPostText("");
    setPostImage(null);
    setPostImageFile(null);
    setShowEmojiPicker(false);
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
          {showEmojiPicker && (
            <div style={{ margin: "0 16px 8px", padding: 10, background: "#1a2030", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {ecoEmojis.map((emoji, i) => (
                  <button key={i} type="button" onClick={() => { setPostText(prev => prev + emoji); setShowEmojiPicker(false); }}
                    style={{ width: 34, height: 34, fontSize: 18, border: "none", background: "transparent", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => e.target.style.background = "rgba(52,211,153,0.15)"}
                    onMouseLeave={e => e.target.style.background = "transparent"}
                  >{emoji}</button>
                ))}
              </div>
            </div>
          )}
          <div className="create-post-actions">
            <div className="post-action-btns">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} style={{ display: "none" }} />
              <button className="post-action-btn" onClick={() => fileInputRef.current?.click()}><Image size={16} /> Photo</button>
              <button className="post-action-btn" onClick={() => { if (!postExpanded) setPostExpanded(true); setShowEmojiPicker(prev => !prev); }}><Smile size={16} /> Mood</button>
            </div>
            {postExpanded ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="post-action-btn" onClick={() => { if (postImage) URL.revokeObjectURL(postImage); setPostExpanded(false); setPostText(""); setPostImage(null); setPostImageFile(null); setShowEmojiPicker(false); }}>
                  Cancel
                </button>
                <button className="btn-post" onClick={handleCreatePost} disabled={!postText.trim() || posting}>
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            ) : (
              <button className="btn-post" onClick={() => setPostExpanded(true)} disabled={posting}>Post</button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!apiLoading && [...posts, ...apiPosts].length === 0 && (
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
                onDelete={handleDeletePost}
                onEdit={(id, content) => { setEditingPostId(id); setEditContent(content || ""); }}
                onSaveEdit={handleEditPost}
                editingPostId={editingPostId}
                editContent={editContent}
                setEditContent={setEditContent}
                setEditingPostId={setEditingPostId}
              />
            ))}
          </section>
        )}

        {/* Community Posts Section */}
        {(apiLoading || apiPosts.length > 0) && (
          <section className="feed-section">
            <div className="feed-section-header">
              <span className="feed-section-label">Community Posts</span>
              <div className="feed-section-line"></div>
            </div>
            {apiLoading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : (
              apiPosts.map((post) => (
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
                  onDelete={handleDeletePost}
                  onEdit={(id, content) => { setEditingPostId(id); setEditContent(content || ""); }}
                  onSaveEdit={handleEditPost}
                  editingPostId={editingPostId}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  setEditingPostId={setEditingPostId}
                />
              ))
            )}
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
