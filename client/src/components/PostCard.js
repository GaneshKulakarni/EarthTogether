import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onLike, onComment }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    onComment(post._id, commentText);
    setCommentText('');
    setShowCommentInput(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <img
          src={post.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.user.username}`}
          alt="User Avatar"
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <p className="font-semibold text-gray-900">{post.user.username}</p>
          <p className="text-sm text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
        </div>
      </div>
      <p className="text-gray-800 mb-4">{post.content}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="w-full rounded-lg mb-4" />
      )}
      <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => onLike(post._id)} className="flex items-center space-x-1 hover:text-red-500 transition-colors">
            <Heart className={`w-5 h-5 ${post.likes.includes(post.user._id) ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.likes.length} Likes</span>
          </button>
          <button onClick={() => setShowCommentInput(!showCommentInput)} className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments.length} Comments</span>
          </button>
        </div>
        <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

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

      {post.comments.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {post.comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-3 mb-3">
              <img
                src={comment.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user.username}`}
                alt="Commenter Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{comment.user.username}</p>
                <p className="text-gray-700 text-sm">{comment.content}</p>
                <p className="text-gray-500 text-xs">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;