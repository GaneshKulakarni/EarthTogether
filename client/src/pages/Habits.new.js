import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
      const response = await axios.get('/api/habits/', {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingHabit) {
        await axios.put(`/api/habits/${editingHabit._id}`, formData, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Habit updated successfully!');
      } else {
        await axios.post('/api/habits/', formData, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Habit created successfully!');
      }
      setShowForm(false);
      setEditingHabit(null);
      setFormData({
        title: '',
        description: '',
        category: 'Waste Reduction',
        frequency: 'daily',
        ecoPoints: 10,
        carbonSaved: 0.5,
      });
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
      toast.error(error.response?.data?.message || 'Failed to save habit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/habits/${id}`, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Habit deleted successfully!');
        fetchHabits();
      } catch (error) {
        console.error('Error deleting habit:', error);
        toast.error('Failed to delete habit');
      }
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description || '',
      category: habit.category,
      frequency: habit.frequency,
      ecoPoints: habit.ecoPoints,
      carbonSaved: habit.carbonSaved,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ecoPoints' || name === 'carbonSaved' ? Number(value) : value
    }));
  };

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
              setEditingHabit(null);
              setFormData({
                title: '',
                description: '',
                category: 'Waste Reduction',
                frequency: 'daily',
                ecoPoints: 10,
                carbonSaved: 0.5,
              });
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
              <h2 className="text-xl font-bold mb-4">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Habit Title *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="3"
                      placeholder="Add details about this habit..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Waste Reduction">Waste Reduction</option>
                      <option value="Energy Saving">Energy Saving</option>
                      <option value="Water Conservation">Water Conservation</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Food">Food</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eco Points *
                    </label>
                    <input
                      type="number"
                      name="ecoPoints"
                      value={formData.ecoPoints}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbon Saved (kg) *
                    </label>
                    <input
                      type="number"
                      name="carbonSaved"
                      value={formData.carbonSaved}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No habits yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first eco-friendly habit!</p>
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Habit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <div key={habit._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{habit.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="text-gray-400 hover:text-green-500"
                        aria-label="Edit habit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Delete habit"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {habit.description && (
                    <p className="mt-2 text-sm text-gray-600">{habit.description}</p>
                  )}
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {habit.category}
                    </span>
                    <span className="ml-2 inline-flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {habit.frequency}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Eco Points</p>
                      <p className="text-lg font-semibold text-green-600">+{habit.ecoPoints}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500">Carbon Saved</p>
                      <p className="text-lg font-semibold text-green-600">
                        {habit.carbonSaved} kg CO₂
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="-ml-0.5 mr-2 h-4 w-4 text-green-500" />
                    Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Habits;
