import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Store, Plus } from 'lucide-react';
import '../dark-theme.css';

const AddWasteCenterModal = ({ isOpen, onClose, onCenterAdded, defaultLocation }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'plastic',
    address: '',
    city: defaultLocation?.name?.split(',')[0] || '',
    lat: defaultLocation?.lat || '',
    lng: defaultLocation?.lng || '',
    phone: '',
    operatingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    scrapRates: '',
    acceptedItemsInput: ''
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error('Please enter name, address, and city');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // If lat/lng not set, use default or geocode
      let centerLat = parseFloat(formData.lat);
      let centerLng = parseFloat(formData.lng);

      if (isNaN(centerLat) || isNaN(centerLng)) {
        if (defaultLocation?.lat && defaultLocation?.lng) {
          centerLat = defaultLocation.lat + (Math.random() - 0.5) * 0.02;
          centerLng = defaultLocation.lng + (Math.random() - 0.5) * 0.02;
        } else {
          centerLat = 19.0760;
          centerLng = 72.8777;
        }
      }

      const acceptedItems = formData.acceptedItemsInput
        ? formData.acceptedItemsInput.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        acceptedCategories: [formData.category],
        acceptedItems,
        address: formData.address.trim(),
        city: formData.city.trim(),
        lat: centerLat,
        lng: centerLng,
        phone: formData.phone.trim(),
        operatingHours: formData.operatingHours.trim(),
        scrapRates: formData.scrapRates.trim()
      };

      const res = await axios.post('/api/waste-centers', payload, {
        headers: { 'x-auth-token': token }
      });

      toast.success('Waste collection shop registered successfully!');
      if (onCenterAdded) onCenterAdded(res.data.center);
      onClose();
    } catch (err) {
      console.error('Error adding waste center:', err);
      toast.error(err.response?.data?.message || 'Failed to register center');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-modal-overlay" onClick={onClose}>
      <div className="dark-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="dark-modal-header" style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-950" />
            <h2 style={{ color: '#0a2818', fontSize: '18px', fontWeight: 800 }}>Register Local Scrap / Waste Shop</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a2818' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="dark-label">Shop / Center Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Royal Kabadi & Metal Depot"
              className="dark-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dark-label">Primary Waste Type *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="dark-input"
              >
                <option value="plastic">🥤 Plastic & Packaging</option>
                <option value="electronic">💻 E-Waste & Batteries</option>
                <option value="metal">🔩 Metal & Iron Scrap</option>
                <option value="paper">📦 Paper & Cardboard</option>
                <option value="organic">🌿 Organic & Compost</option>
                <option value="glass">🍾 Glass Bottles</option>
              </select>
            </div>

            <div>
              <label className="dark-label">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai, Bangalore, Austin"
                className="dark-input"
              />
            </div>
          </div>

          <div>
            <label className="dark-label">Full Street Address *</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Shop No., Street, Landmark"
              className="dark-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="dark-label">Phone / WhatsApp</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="dark-input"
              />
            </div>
            <div>
              <label className="dark-label">Operating Hours</label>
              <input
                type="text"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
                className="dark-input"
              />
            </div>
          </div>

          <div>
            <label className="dark-label">Accepted Items (comma separated)</label>
            <input
              type="text"
              name="acceptedItemsInput"
              value={formData.acceptedItemsInput}
              onChange={handleChange}
              placeholder="e.g. PET Bottles, Copper Wire, Batteries, Newspapers"
              className="dark-input"
            />
          </div>

          <div>
            <label className="dark-label">Scrap Rates / Buying Price (Optional)</label>
            <input
              type="text"
              name="scrapRates"
              value={formData.scrapRates}
              onChange={handleChange}
              placeholder="e.g. Copper: ₹450/kg, Iron: ₹28/kg, Cartons: ₹12/kg"
              className="dark-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="dark-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="dark-btn-primary"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>{loading ? 'Registering...' : 'Register Center'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWasteCenterModal;
