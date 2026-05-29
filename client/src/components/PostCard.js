import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, Edit2, Trash2, Target, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const PostCard = ({ post, onLike, onComment, onDelete, onEdit, showDelete = false, onJoinChallenge, userChallenges = [] }) => {
  const { user: currentUser } = useAuth();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const currentUserId = currentUser?._id || currentUser?.id;
  
  // Get user info from post (handle both populated and unpopulated user fields)
  const postUser = post.user || {};
  const postUserId = postUser._id || postUser.id || post.user;
  const postUsername = postUser.username || postUser.name || 'EcoMember';
  const postAvatar = postUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${postUsername}`;
  const postUserTitle = postUser.title || 'EarthTogether Member';
  
  // Handle both image/imageUrl and video/videoUrl field names
  const postImage = post.image || post.imageUrl || null;
  const postVideo = post.video || post.videoUrl || null;
  
  const isLikedByCurrentUser = Array.isArray(post.likes)
    ? post.likes.some(like => {
      const likeUserId = typeof like.user === 'object' ? like.user._id || like.user.id : like.user;
      return likeUserId === currentUserId;
    })
    : !!post.liked;

  const likeCount = Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0);
  const commentCount = Array.isArray(post.comments) ? post.comments.length : (typeof post.comments === 'number' ? post.comments : 0);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText('');
    setShowCommentInput(false);
  };

  const handleJoinFirstChallenge = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/challenges', {
        headers: { 'x-auth-token': token }
      });
      const availableChallenges = response.data.filter(challenge =>
        challenge.status === 'active' && !userChallenges.includes(challenge._id)
      );

      if (availableChallenges.length > 0 && onJoinChallenge) {
        await onJoinChallenge(availableChallenges[0]._id);
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Get badge class based on category
  const getBadgeClass = (category) => {
    if (!category) return 'general';
    const l = category.toLowerCase();
    if (l.includes('research')) return 'research';
    if (l.includes('challenge')) return 'challenge';
    return 'general';
  };

  const badgeClass = getBadgeClass(post.category);
  const isOwner = currentUserId === postUserId;

  // CSS variables for dark theme
  const styles = {
    card: {
      background: '#1a2030',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'all 0.2s ease',
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '18px 20px 14px',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #34d399, #059669)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      color: 'white',
      flexShrink: 0,
      overflow: 'hidden',
    },
    username: {
      color: '#e6edf3',
      fontSize: '14px',
      fontWeight: 600,
      margin: '0 0 3px 0',
    },
    userTitle: {
      color: '#58646e',
      fontSize: '12px',
      margin: 0,
    },
    badge: {
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding: '5px 12px',
      borderRadius: '20px',
      whiteSpace: 'nowrap',
    },
    badgeGeneral: {
      background: 'rgba(52,211,153,0.12)',
      border: '1px solid rgba(52,211,153,0.25)',
      color: '#34d399',
    },
    badgeResearch: {
      background: 'rgba(56,189,248,0.12)',
      border: '1px solid rgba(56,189,248,0.25)',
      color: '#38bdf8',
    },
    badgeChallenge: {
      background: 'rgba(245,158,11,0.12)',
      border: '1px solid rgba(245,158,11,0.25)',
      color: '#f59e0b',
    },
    content: {
      padding: '0 20px 16px',
      color: '#8b949e',
      fontSize: '14px',
      lineHeight: 1.8,
      wordBreak: 'break-word',
    },
    imageContainer: {
      width: '100%',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    image: {
      width: '100%',
      maxHeight: '360px',
      objectFit: 'cover',
      display: 'block',
    },
    videoContainer: {
      margin: '0 20px 12px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#000',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 20px',
      background: 'rgba(0,0,0,0.15)',
    },
    reactions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    reactionBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: 'transparent',
      border: 'none',
      color: '#8b949e',
      fontSize: '13px',
      cursor: 'pointer',
      padding: '8px 14px',
      borderRadius: '10px',
      transition: 'all 0.2s ease',
    },
    reactionBtnLiked: {
      background: 'rgba(248,113,113,0.1)',
      color: '#f87171',
    },
    shareBtn: {
      background: 'transparent',
      border: 'none',
      color: '#58646e',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
    },
    commentSection: {
      padding: '16px 20px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(0,0,0,0.1)',
    },
    commentRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    commentAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #34d399, #059669)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: 'white',
      fontWeight: 600,
      flexShrink: 0,
    },
    commentInput: {
      flex: 1,
      background: '#0f1923',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '50px',
      padding: '10px 18px',
      color: '#e6edf3',
      fontSize: '13px',
      outline: 'none',
      fontFamily: 'inherit',
    },
    commentSend: {
      background: 'rgba(52,211,153,0.12)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#34d399',
      cursor: 'pointer',
    },
    commentItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '12px',
    },
    commentContent: {
      flex: 1,
    },
    commentUsername: {
      fontWeight: 600,
      color: '#e6edf3',
      fontSize: '13px',
      margin: '0 0 4px 0',
    },
    commentText: {
      color: '#8b949e',
      fontSize: '13px',
      margin: '0 0 4px 0',
      lineHeight: 1.5,
    },
    commentDate: {
      color: '#58646e',
      fontSize: '11px',
    },
    dropdown: {
      position: 'absolute',
      right: 0,
      top: '100%',
      marginTop: '4px',
      width: '160px',
      background: '#1a2030',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      zIndex: 20,
      overflow: 'hidden',
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      padding: '10px 14px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: '#e6edf3',
      fontSize: '13px',
      textAlign: 'left',
    },
    dropdownItemDanger: {
      color: '#f87171',
    },
    editTextarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: '1px solid rgba(52,211,153,0.3)',
      background: '#0f1923',
      color: '#e6edf3',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      outline: 'none',
      marginBottom: '12px',
    },
    challengeBanner: {
      margin: '0 20px 16px',
      padding: '12px 16px',
      background: 'rgba(52,211,153,0.08)',
      border: '1px solid rgba(52,211,153,0.2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  };

  const getBadgeStyle = () => {
    switch (badgeClass) {
      case 'research': return styles.badgeResearch;
      case 'challenge': return styles.badgeChallenge;
      default: return styles.badgeGeneral;
    }
  };

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {postUser.avatar ? (
              <img src={postAvatar} alt={postUsername} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              postUsername[0]?.toUpperCase() || '🌱'
            )}
          </div>
          <div>
            <p style={styles.username}>{postUsername}</p>
            <p style={styles.userTitle}>{postUserTitle} · {formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ ...styles.badge, ...getBadgeStyle() }}>
            {post.category || 'General'}
          </span>
          {isOwner && showDelete && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  color: '#8b949e',
                  fontSize: '16px'
                }}
              >
                <MoreHorizontal size={18} />
              </button>
              {showDropdown && (
                <div style={styles.dropdown}>
                  <button 
                    onClick={() => { setShowDropdown(false); setIsEditing(true); setEditContent(post.content); }}
                    style={styles.dropdownItem}
                    onMouseEnter={e => e.target.style.background = 'rgba(52,211,153,0.1)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    <Edit2 size={14} /> Edit Post
                  </button>
                  <button 
                    onClick={() => { onDelete(post._id); setShowDropdown(false); }}
                    style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                    onMouseEnter={e => e.target.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    <Trash2 size={14} /> Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div style={{ padding: '0 20px 16px' }}>
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            style={styles.editTextarea}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setIsEditing(false)}
              style={{ 
                padding: '6px 16px', 
                borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.08)', 
                background: 'transparent', 
                color: '#8b949e', 
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button 
              onClick={async () => {
                if (!editContent.trim()) return toast.error('Content cannot be empty');
                try {
                  const token = localStorage.getItem('token');
                  await axios.put(`/api/posts/${post._id}`, { content: editContent }, { headers: { 'x-auth-token': token } });
                  setIsEditing(false);
                  toast.success('Post updated');
                  if (onEdit) onEdit(post._id, editContent);
                } catch (_) { 
                  toast.error('Failed to update post'); 
                }
              }}
              style={{ 
                padding: '6px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                background: '#34d399', 
                color: '#0a2818', 
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.content}>{post.content}</div>
      )}

      {/* Image */}
      {postImage && !postVideo && (
        <div style={styles.imageContainer}>
          <img src={postImage} alt="Post content" style={styles.image} />
        </div>
      )}

      {/* Video */}
      {postVideo && (
        <div style={styles.videoContainer}>
          <video 
            src={postVideo} 
            controls 
            style={{ width: '100%', display: 'block', maxHeight: '500px' }}
            poster={postImage || ""}
          />
        </div>
      )}

      {/* Challenge Banner */}
      {(post.category === 'Challenge' || post.type === 'challenge') && (
        <div style={styles.challengeBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} style={{ color: '#34d399' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>Challenge Post</span>
          </div>
          <button
            onClick={handleJoinFirstChallenge}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#34d399',
              color: '#0a2818',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Join
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.reactions}>
          <button 
            onClick={() => onLike(post._id)} 
            style={{
              ...styles.reactionBtn,
              ...(isLikedByCurrentUser ? styles.reactionBtnLiked : {})
            }}
            onMouseEnter={e => {
              if (!isLikedByCurrentUser) {
                e.target.style.background = 'rgba(52,211,153,0.12)';
                e.target.style.color = '#34d399';
              }
            }}
            onMouseLeave={e => {
              if (!isLikedByCurrentUser) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#8b949e';
              }
            }}
          >
            <Heart size={16} fill={isLikedByCurrentUser ? "currentColor" : "none"} />
            {likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
          </button>
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)} 
            style={styles.reactionBtn}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(52,211,153,0.12)';
              e.target.style.color = '#34d399';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#8b949e';
            }}
          >
            <MessageCircle size={16} />
            {commentCount}
          </button>
        </div>
        <button 
          style={styles.shareBtn}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(52,211,153,0.12)';
            e.target.style.color = '#34d399';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#58646e';
          }}
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div style={styles.commentSection}>
          <form onSubmit={handleCommentSubmit} style={styles.commentRow}>
            <div style={styles.commentAvatar}>
              {currentUser?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              style={styles.commentInput}
            />
            <button type="submit" style={styles.commentSend}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Comments List */}
      {Array.isArray(post.comments) && post.comments.length > 0 && (
        <div style={{ ...styles.commentSection, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {post.comments.map((comment) => {
            const commentUser = comment.user || {};
            const commentUsername = commentUser.username || commentUser.name || comment.username || 'EcoMember';
            const commentAvatar = commentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${commentUsername}`;
            
            return (
              <div key={comment._id} style={styles.commentItem}>
                <div style={{ ...styles.commentAvatar, overflow: 'hidden' }}>
                  {commentUser.avatar ? (
                    <img src={commentAvatar} alt={commentUsername} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    commentUsername[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div style={styles.commentContent}>
                  <p style={styles.commentUsername}>{commentUsername}</p>
                  <p style={styles.commentText}>{comment.content}</p>
                  <p style={styles.commentDate}>{formatDate(comment.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostCard;
