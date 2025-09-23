import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, CheckCircle, Calendar, Target } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Waste Reduction',
    frequency: 'daily',
    ecoPoints: 10,
    carbonSaved: 0.5,
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get('/api/habits', {
        headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      if (response.data) {
        setHabits(Array.isArray(response.data) ? response.data : []);
      } else {
        setHabits([]);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Please log in to view habits');
        } else if (error.response.status === 404) {
          toast.error('Habits endpoint not found. Please check the API URL.');
        } else {
          toast.error(error.response.data.message || 'Failed to fetch habits');
        }
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('Error: ' + error.message);
      }
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const headers = { 'x-auth-token': token, 'Content-Type': 'application/json' };

      if (editingHabit) {
        await axios.put(`/api/habits/${editingHabit._id}`, formData, { headers });
        toast.success('Habit updated successfully!');
      } else {
        await axios.post('/api/habits', formData, { headers });
        toast.success('Habit created successfully!');
      }

      setShowForm(false);
      setEditingHabit(null);
      resetForm();
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to save habit');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('Error: ' + error.message);
      }
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      ecoPoints: habit.ecoPoints || 10,
      carbonSaved: habit.carbonSaved || 0.5,
    });
    setShowForm(true);
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        await axios.delete(`/api/habits/${habitId}`, {
          headers: { 'x-auth-token': token, 'Content-Type': 'application/json' },
        });

        toast.success('Habit deleted successfully!');
        fetchHabits();
      } catch (error) {
        console.error('Error deleting habit:', error);
        if (error.response) {
          toast.error(error.response.data.message || 'Failed to delete habit');
        } else {
          toast.error('Error: ' + error.message);
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Waste Reduction',
      frequency: 'daily',
      ecoPoints: 10,
      carbonSaved: 0.5,
      carbonSavedFrequency: 'weekly',
      targetDays: 7,
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Habits</h1>
            <p className="text-gray-600 mt-1">Track your eco-friendly habits and earn points</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setFormData({
                title: '',
                description: '',
                category: 'Waste Reduction',
                frequency: 'daily',
                ecoPoints: 10,
                carbonSaved: 0.5,
              });
              setEditingHabit(null);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="mr-2" size={20} />
            Create New Habit
          </button>
        </div>

        {/* Habit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingHabit ? 'Edit Habit' : 'Create New Habit'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Habit Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Use reusable water bottle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Waste Reduction">Waste Reduction</option>
                      <option value="Energy">Energy</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Water">Water</option>
                      <option value="Food">Food</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe your eco-habit..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eco Points</label>
                    <input
                      type="number"
                      name="ecoPoints"
                      value={formData.ecoPoints}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carbon Saved (kg)</label>
                    <input
                      type="number"
                      name="carbonSaved"
                      value={formData.carbonSaved}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <select
                      name="carbonSavedFrequency"
                      value={formData.carbonSavedFrequency}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Days</label>
                    <input
                      type="number"
                      name="targetDays"
                      value={formData.targetDays}
                      onChange={handleChange}
                      min="1"
                      max="31"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingHabit(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                  >
                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Habits List */}
        <div className="bg-white rounded-lg shadow-md">
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-4">Start building your eco-friendly routine!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Your First Habit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {habits.map((habit) => (
                <div key={habit._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            habit.category === 'Energy'
                              ? 'bg-yellow-100 text-yellow-800'
                              : habit.category === 'Waste Reduction'
                              ? 'bg-red-100 text-red-800'
                              : habit.category === 'Transportation'
                              ? 'bg-blue-100 text-blue-800'
                              : habit.category === 'Water'
                              ? 'bg-cyan-100 text-cyan-800'
                              : habit.category === 'Food'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {habit.category}
                        </span>
                      </div>
                      {habit.description && <p className="text-gray-600 mb-3">{habit.description}</p>}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{habit.frequency}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>Streak: {habit.currentStreak} days</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{habit.totalCompletions} completions</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;
