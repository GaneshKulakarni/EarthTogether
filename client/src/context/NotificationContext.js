import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const previousNotificationsRef = useRef([]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      const newNotifications = response.data;
      
      // Show toast for new unread notifications
      const previousUnreadIds = previousNotificationsRef.current.filter(n => !n.read).map(n => n._id);
      const newUnreadNotifications = newNotifications.filter(n => 
        !n.read && !previousUnreadIds.includes(n._id)
      );
      
      // No like notifications to show
      
      previousNotificationsRef.current = newNotifications;
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const showNotificationToast = (notification) => {
    toast.success(notification.message, {
      duration: 4000,
      icon: '❤️'
    });
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    showNotificationToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};