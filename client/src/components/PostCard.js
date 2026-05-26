import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, Edit2, Trash2, Target, Plus, X } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={post.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.user.username}`}
            alt="User Avatar"
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-semibold text-gray-900">{post.user.username}</p>
            <p className="text-sm text-gray-500">
              {post.createdAt && !isNaN(new Date(post.createdAt))
                ? new Date(post.createdAt).toLocaleDateString()
                : 'Just now'
              }
            </p>
          </div>
        </div>
        {(currentUserId === (post.user?._id || post.user?.id)) && showDelete && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', color: '#8b949e' }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.target.style.background = 'none'}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showDropdown && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, width: 160, background: '#1a2030', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, zIndex: 20, overflow: 'hidden' }}>
                <button
                  onClick={() => { setShowDropdown(false); setIsEditing(true); setEditContent(post.content); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', color: '#e6edf3', fontSize: 13, textAlign: 'left' }}
                  onMouseEnter={e => e.target.style.background = 'rgba(52,211,153,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  <Edit2 size={14} /> Edit Post
                </button>
                <button
                  onClick={() => { onDelete(post._id); setShowDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', color: '#f87171', fontSize: 13, textAlign: 'left' }}
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
      {isEditing ? (
        <div style={{ marginBottom: 12 }}>
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid rgba(52,211,153,0.3)', background: '#0f1923', color: '#e6edf3', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setIsEditing(false)}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#8b949e', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Cancel</button>
            <button onClick={async () => {
              if (!editContent.trim()) return toast.error('Content cannot be empty');
              try {
                const token = localStorage.getItem('token');
                await axios.put(`/api/posts/${post._id}`, { content: editContent }, { headers: { 'x-auth-token': token } });
                setIsEditing(false);
                toast.success('Post updated');
                if (onEdit) onEdit(post._id, editContent);
              } catch (_) { toast.error('Failed to update post'); }
            }}
              style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#34d399', color: '#0a2818', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Save</button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-4">{post.content}</p>
      )}
      {post.image && !post.video && (
        <img src={post.image} alt="" className="w-full rounded-lg mb-4" />
      )}
      {post.video && (
        <video
          src={post.video}
          controls
          className="w-full rounded-lg mb-4 bg-black max-h-[500px]"
          poster={post.image || ""}
        />
      )}
      <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => onLike(post._id)} className="flex items-center space-x-1 hover:text-red-500 transition-colors">
            <Heart className={`w-5 h-5 ${isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{likeCount} Likes</span>
          </button>
          <button onClick={() => setShowCommentInput(!showCommentInput)} className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{commentCount} Comments</span>
          </button>
        </div>
        <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Challenge Join Button */}
      {(post.category === 'Challenge' || post.type === 'challenge') && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Challenge Post</span>
            </div>
            <button
              onClick={handleJoinFirstChallenge}
              className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Join Challenge</span>
            </button>
          </div>
        </div>
      )}

      {showCommentInput && (
        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mt-4">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}

      {Array.isArray(post.comments) && post.comments.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {post.comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-3 mb-3">
              <img
                src={comment.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user?.username || comment.username || 'user'}`}
                alt="Commenter Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{comment.user?.username || comment.username || 'EcoMember'}</p>
                <p className="text-gray-700 text-sm">{comment.content}</p>
                <p className="text-gray-500 text-xs">
                  {comment.createdAt && !isNaN(new Date(comment.createdAt))
                    ? new Date(comment.createdAt).toLocaleDateString()
                    : 'Just now'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default PostCard;