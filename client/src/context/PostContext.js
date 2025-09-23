import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { getPosts, createPost, likePost, commentOnPost, sharePost, deletePost } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const PostContext = createContext();

const initialState = {
  posts: [],
  loading: false,
  error: null
};

const postReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_POSTS':
      return { ...state, posts: action.payload, loading: false, error: null };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id || post._id === action.payload.id
            ? { ...post, ...action.payload.updates }
            : post
        )
      };
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => 
          post.id !== action.payload && post._id !== action.payload
        )
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const PostProvider = ({ children }) => {
  const [state, dispatch] = useReducer(postReducer, initialState);
  const { updateUser, user } = useAuth();

  const mockPosts = [
    {
      id: 1,
      user: { name: 'Sarah Green', avatar: '🌱', title: 'Environmental Activist' },
      content: 'Just completed my 30-day plastic-free challenge! 🌍 Reduced my waste by 80% and discovered so many sustainable alternatives. Small changes make a big difference!',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop',
      likes: 24, comments: 8, shares: 3, timeAgo: '2h', liked: false, category: 'Waste Reduction'
    },
    {
      id: 2,
      user: { name: 'Mike Ocean', avatar: '🌊', title: 'Marine Biologist' },
      content: 'Incredible news! Our local beach cleanup removed 500kg of plastic waste this weekend. Thank you to all 50 volunteers who joined us! 🏖️',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop',
      likes: 156, comments: 23, shares: 12, timeAgo: '4h', liked: true, category: 'Ocean Conservation'
    }
  ];

  const fetchPosts = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await getPosts();
      const currentUserId = user?._id || user?.id;
      const formattedPosts = data?.map(post => {
        const isLikedByCurrentUser = post.likes?.some(like => {
          const likeUserId = typeof like.user === 'object' ? like.user._id || like.user.id : like.user;
          return likeUserId === currentUserId;
        }) || false;
        
        return {
          id: post._id,
          _id: post._id,
          user: {
            name: post.user?.username || 'User',
            avatar: '🌱',
            title: 'EarthTogether Member'
          },
          content: post.content,
          image: post.imageUrl || null,
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
          shares: post.shares?.length || 0,
          timeAgo: post.createdAt && !isNaN(new Date(post.createdAt)) 
          ? new Date(post.createdAt).toLocaleDateString()
          : 'Just now',
          liked: isLikedByCurrentUser,
          category: post.category || 'General'
        };
      }) || [];
      
      const allPosts = [...formattedPosts, ...mockPosts];
      dispatch({ type: 'SET_POSTS', payload: allPosts });
    } catch (error) {
      dispatch({ type: 'SET_POSTS', payload: mockPosts });
    }
  };

  const addPost = async (postData) => {
    try {
      const savedPost = await createPost(postData);
      const newPost = {
        id: savedPost._id,
        _id: savedPost._id,
        user: {
          name: savedPost.user?.username || 'User',
          avatar: '🌱',
          title: 'EarthTogether Member'
        },
        content: postData.content,
        image: postData.imageUrl || null,
        likes: 0,
        comments: 0,
        shares: 0,
        timeAgo: 'now',
        liked: false,
        category: postData.category
      };
      
      // Award 5 eco points for creating a post
      if (user && updateUser) {
        updateUser({
          ecoPoints: (user.ecoPoints || 0) + 5
        });
      }
      
      dispatch({ type: 'ADD_POST', payload: newPost });
      
      // Refresh the main feed to include the new post
      setTimeout(() => {
        fetchPosts();
      }, 100);
      
      return newPost;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const toggleLike = async (postId) => {
    try {
      const updatedPost = await likePost(postId);
      const currentUserId = user?._id || user?.id;
      const isLikedByCurrentUser = updatedPost.likes?.some(like => {
        const likeUserId = typeof like.user === 'object' ? like.user._id || like.user.id : like.user;
        return likeUserId === currentUserId;
      }) || false;
      
      // Show notification toast if user just liked the post
      if (isLikedByCurrentUser && updatedPost.user._id !== currentUserId) {
        toast.success(`You liked ${updatedPost.user.username}'s post! ❤️`, {
          duration: 3000
        });
      }
      
      dispatch({
        type: 'UPDATE_POST',
        payload: {
          id: postId,
          updates: {
            liked: isLikedByCurrentUser,
            likes: updatedPost.likes?.length || 0
          }
        }
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const addComment = async (postId, content) => {
    try {
      await commentOnPost(postId, content);
      const post = state.posts.find(p => p.id === postId || p._id === postId);
      dispatch({
        type: 'UPDATE_POST',
        payload: {
          id: postId,
          updates: { comments: post.comments + 1 }
        }
      });
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const sharePostAction = async (postId) => {
    try {
      await sharePost(postId);
      const post = state.posts.find(p => p.id === postId || p._id === postId);
      dispatch({
        type: 'UPDATE_POST',
        payload: {
          id: postId,
          updates: { shares: post.shares + 1 }
        }
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const deletePostAction = async (postId) => {
    try {
      await deletePost(postId);
      dispatch({ type: 'DELETE_POST', payload: postId });
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await getPosts();
      // Filter posts by current user
      const userPosts = response?.filter(post => 
        post.user?._id === user?.id || post.user?.username === user?.username
      ) || [];
      return userPosts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  };

  const contextValue = {
    posts: state.posts,
    loading: state.loading,
    error: state.error,
    fetchPosts,
    fetchUserPosts,
    addPost,
    toggleLike,
    addComment,
    sharePost: sharePostAction,
    deletePost: deletePostAction
  };

  return (
    <PostContext.Provider value={contextValue}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};