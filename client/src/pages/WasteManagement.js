import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Trash2, Recycle, Leaf, Calculator, Plus, TrendingUp,
  MapPin, Search, Navigation, Phone, ExternalLink, CheckCircle2,
  Clock, Store, Filter
} from 'lucide-react';
import WasteCentersMap from '../components/WasteCentersMap';
import AddWasteCenterModal from '../components/AddWasteCenterModal';
import '../dark-theme.css';

const CATEGORIES = [
  { key: 'all', label: 'All Centers', icon: '🌟', color: '#10b981' },
  { key: 'plastic', label: 'Plastic', icon: '🥤', color: '#f87171' },
  { key: 'electronic', label: 'E-Waste', icon: '💻', color: '#a78bfa' },
  { key: 'metal', label: 'Metal & Scrap', icon: '🔩', color: '#fbbf24' },
  { key: 'paper', label: 'Paper', icon: '📦', color: '#38bdf8' },
  { key: 'organic', label: 'Organic', icon: '🌿', color: '#34d399' },
  { key: 'glass', label: 'Glass', icon: '🍾', color: '#2dd4bf' }
];

const WasteManagement = () => {
  // Navigation tabs: 'map' vs 'tracker'
  const [activeMainTab, setActiveMainTab] = useState('map');

  // Map & centers locator state
  const [centers, setCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('Mumbai');
  const [searchRadius, setSearchRadius] = useState(25);
  const [userLocation, setUserLocation] = useState({
    lat: 19.0760,
    lng: 72.8777,
    name: 'Mumbai, Maharashtra'
  });
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Waste tracker & CO2 calculator state
  const [wasteData, setWasteData] = useState({
    plastic: 0,
    paper: 0,
    electronic: 0,
    organic: 0
  });
  const [newEntry, setNewEntry] = useState({ type: 'plastic', amount: '' });

  const carbonFactors = {
    plastic: 2.0,
    paper: 1.5,
    electronic: 5.0,
    organic: 0.5
  };

  const addWasteEntry = () => {
    if (newEntry.amount && parseFloat(newEntry.amount) > 0) {
      setWasteData(prev => ({
        ...prev,
        [newEntry.type]: prev[newEntry.type] + parseFloat(newEntry.amount)
      }));
      setNewEntry({ type: 'plastic', amount: '' });
      toast.success(`Logged ${newEntry.amount} kg of ${newEntry.type} waste!`);
    }
  };

  const calculateTotalCarbonSaved = () => {
    return Object.entries(wasteData).reduce((total, [type, amount]) => {
      return total + (amount * carbonFactors[type]);
    }, 0).toFixed(2);
  };

  const wasteTypes = [
    { key: 'plastic', label: 'Plastic', icon: <Trash2 style={{ width: 20, height: 20 }} />, color: '#f87171', bgColor: 'rgba(248,113,113,0.15)' },
    { key: 'paper', label: 'Paper', icon: <Recycle style={{ width: 20, height: 20 }} />, color: '#38bdf8', bgColor: 'rgba(56,189,248,0.15)' },
    { key: 'electronic', label: 'E-Waste', icon: <Calculator style={{ width: 20, height: 20 }} />, color: '#a78bfa', bgColor: 'rgba(167,139,250,0.15)' },
    { key: 'organic', label: 'Organic', icon: <Leaf style={{ width: 20, height: 20 }} />, color: '#34d399', bgColor: 'rgba(52,211,153,0.15)' }
  ];

  // Fetch centers from server API
  const fetchCenters = async (lat, lng, category = selectedCategory, radius = searchRadius, search = searchQuery) => {
    try {
      setLoadingCenters(true);
      const params = {
        radius
      };
      if (lat !== undefined && lng !== undefined) {
        params.lat = lat;
        params.lng = lng;
      }
      if (category && category !== 'all') {
        params.category = category;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const res = await axios.get('/api/waste-centers', { params });
      if (res.data && res.data.centers) {
        setCenters(res.data.centers);
        if (res.data.centers.length > 0 && !selectedCenter) {
          setSelectedCenter(res.data.centers[0]);
        }
      }
    } catch (err) {
      console.error('Error loading waste centers:', err);
      toast.error('Failed to load waste centers');
    } finally {
      setLoadingCenters(false);
    }
  };

  // Initial load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCenters(userLocation.lat, userLocation.lng, selectedCategory, searchRadius, searchQuery);
  }, []);

  // Category filter changes
  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
    fetchCenters(userLocation.lat, userLocation.lng, categoryKey, searchRadius, searchQuery);
  };

  // Radius filter changes
  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    fetchCenters(userLocation.lat, userLocation.lng, selectedCategory, newRadius, searchQuery);
  };

  // Location search using OpenStreetMap Nominatim
  const handleLocationSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoadingCenters(true);
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery.trim(),
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'Accept-Language': 'en'
        }
      });

      if (res.data && res.data.length > 0) {
        const place = res.data[0];
        const newLoc = {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          name: place.display_name
        };
        setUserLocation(newLoc);
        toast.success(`Showing collection centers near ${place.display_name.split(',')[0]}`);
        fetchCenters(newLoc.lat, newLoc.lng, selectedCategory, searchRadius, searchQuery);
      } else {
        toast.error(`Location "${searchQuery}" not found. Searching by keywords.`);
        fetchCenters(userLocation.lat, userLocation.lng, selectedCategory, searchRadius, searchQuery);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      fetchCenters(userLocation.lat, userLocation.lng, selectedCategory, searchRadius, searchQuery);
    } finally {
      setLoadingCenters(false);
    }
  };

  // Use browser HTML5 Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let name = 'My Current Location';

        try {
          const rev = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: { lat, lon: lng, format: 'json' }
          });
          if (rev.data && rev.data.display_name) {
            name = rev.data.display_name;
          }
        } catch (_) {}

        const newLoc = { lat, lng, name };
        setUserLocation(newLoc);
        setSearchQuery(name.split(',')[0] || 'Current Location');
        fetchCenters(lat, lng, selectedCategory, searchRadius);
        setGeoLoading(false);
        toast.success('Found your location!');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoLoading(false);
        toast.error('Unable to fetch GPS location. Please type your city.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Center added callback from modal
  const handleCenterAdded = (newCenter) => {
    setCenters(prev => [newCenter, ...prev]);
    setSelectedCenter(newCenter);
  };

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', width: '100%' }}>
      {/* Top Banner Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, margin: '0 auto 12px',
        }}>🗺️</div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Waste Management & Drop-Off Locator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 620, margin: '0 auto' }}>
          Find authorized recyclers, scrap dealers (kabadiwalas), e-waste points, and organic compost stations near you.
        </p>
      </div>

      {/* Main View Switcher Tabs */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="dark-tabs">
          <button
            className={`dark-tab ${activeMainTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('map')}
          >
            🗺️ Collection Centers & Scrap Shops Map
          </button>
          <button
            className={`dark-tab ${activeMainTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('tracker')}
          >
            📊 Waste Tracker & Impact Calculator
          </button>
        </div>

        {activeMainTab === 'map' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="dark-btn-primary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register Local Shop</span>
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: INTERACTIVE MAP & WASTE LOCATOR SYSTEM
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'map' && (
        <div className="space-y-5">
          {/* Location Search & Filter Toolbar */}
          <div className="dark-card p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search Form */}
              <form onSubmit={handleLocationSearch} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter city, neighborhood, or pincode (e.g. Mumbai, HSR Layout, Brooklyn)..."
                    className="dark-input pl-10 pr-3 py-2.5 text-xs sm:text-sm w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingCenters}
                  className="dark-btn-primary py-2.5 px-4 flex-shrink-0"
                >
                  <Search className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>

              {/* GPS Button & Radius Dropdown */}
              <div className="flex items-center gap-2 justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={geoLoading}
                  className="dark-btn-secondary py-2.5 px-3 text-xs sm:text-sm flex items-center gap-1.5 flex-1 sm:flex-none justify-center"
                  title="Detect my current location via GPS"
                >
                  <Navigation className={`w-4 h-4 text-sky-400 ${geoLoading ? 'animate-spin' : ''}`} />
                  <span>{geoLoading ? 'Locating...' : 'Use My GPS'}</span>
                </button>

                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Radius:</span>
                  <select
                    value={searchRadius}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="bg-transparent text-emerald-400 font-bold text-xs outline-none cursor-pointer"
                  >
                    <option value={5} className="bg-slate-900 text-white">5 km</option>
                    <option value={10} className="bg-slate-900 text-white">10 km</option>
                    <option value={25} className="bg-slate-900 text-white">25 km</option>
                    <option value={50} className="bg-slate-900 text-white">50 km</option>
                    <option value={100} className="bg-slate-900 text-white">100 km</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Waste Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-white/5 scrollbar-none">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
                <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filter:
              </span>
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategorySelect(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex-shrink-0 ${
                      isActive
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map + Centers Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left/Top: Interactive Leaflet Map */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                <span>📍 Centered near <strong className="text-slate-200">{userLocation?.name?.split(',').slice(0, 2).join(',') || 'Your location'}</strong></span>
                <span>{centers.length} center{centers.length !== 1 ? 's' : ''} found</span>
              </div>

              <WasteCentersMap
                centers={centers}
                userLocation={userLocation}
                selectedCenter={selectedCenter}
                onSelectCenter={(center) => setSelectedCenter(center)}
                height="clamp(320px, 48vh, 460px)"
              />
            </div>

            {/* Right/Bottom: Scrollable List of Nearby Scrap Shops & Centers */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Nearby Centers ({centers.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Sorted by distance</span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {loadingCenters ? (
                  <div className="dark-card p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin mb-3" />
                    <p className="text-xs text-slate-400">Locating recycling & scrap centers...</p>
                  </div>
                ) : centers.length === 0 ? (
                  <div className="dark-card p-6 text-center text-slate-400 space-y-3">
                    <Store className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-medium text-slate-300">No centers found within {searchRadius} km</p>
                    <p className="text-xs text-slate-400">Try widening your search radius or register your local neighborhood scrap shop!</p>
                    <button
                      onClick={() => handleRadiusChange(50)}
                      className="dark-btn-secondary text-xs mx-auto"
                    >
                      Expand to 50 km
                    </button>
                  </div>
                ) : (
                  centers.map((center) => {
                    const isSelected = selectedCenter && selectedCenter._id === center._id;
                    const catObj = CATEGORIES.find(c => c.key === center.category) || CATEGORIES[0];
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;

                    return (
                      <div
                        key={center._id}
                        onClick={() => setSelectedCenter(center)}
                        className={`dark-card p-3.5 transition-all cursor-pointer border ${
                          isSelected
                            ? 'border-emerald-400/60 bg-[#16221c] shadow-lg shadow-emerald-500/10'
                            : 'border-white/5 hover:border-white/20 hover:bg-[#151926]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 leading-snug">
                              {center.name}
                              {center.isVerified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" title="Verified Recycler" />
                              )}
                            </h4>
                          </div>
                          {center.distance !== undefined && (
                            <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                              {center.distance} km
                            </span>
                          )}
                        </div>

                        {/* Badges & Meta */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap text-[11px]">
                          <span className="bg-white/5 text-slate-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                            <span>{catObj.icon}</span>
                            <span>{catObj.label}</span>
                          </span>
                          {center.operatingHours && (
                            <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{center.operatingHours}</span>
                            </span>
                          )}
                        </div>

                        {/* Address */}
                        <p className="text-xs text-slate-400 mb-2 flex items-start gap-1 leading-snug">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span>{center.address}, {center.city}</span>
                        </p>

                        {/* Scrap Rates if present */}
                        {center.scrapRates && (
                          <div className="bg-white/[0.03] border-l-2 border-emerald-400 px-2.5 py-1.5 rounded text-[11px] text-slate-300 mb-2.5 font-medium">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Buying Rates</span>
                            <span>{center.scrapRates}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="dark-btn-primary py-1.5 px-2.5 text-xs flex-1 text-center justify-center"
                          >
                            <span>Directions</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {center.phone && (
                            <a
                              href={`tel:${center.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="dark-btn-secondary py-1.5 px-2.5 text-xs flex items-center justify-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span className="hidden sm:inline">Call</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: WASTE TRACKER & IMPACT CALCULATOR (PRESERVED)
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'tracker' && (
        <div className="space-y-6">
          {/* Carbon Saved Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #34d399, #059669)',
            borderRadius: 16, padding: '24px 20px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp style={{ width: 36, height: 36, color: '#0a2818', margin: '0 auto 8px' }} />
              <h2 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 800, color: '#0a2818', margin: '0 0 4px' }}>{calculateTotalCarbonSaved()} kg</h2>
              <p style={{ color: 'rgba(10,40,24,0.85)', fontSize: 14, margin: 0 }}>Total CO₂ Saved From Diverted Waste</p>
            </div>
          </div>

          {/* Add Waste Entry Card */}
          <div className="dark-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>Log Avoided / Recycled Waste</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
                className="dark-input"
              >
                {wasteTypes.map(type => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount (kg)"
                value={newEntry.amount}
                onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
                className="dark-input"
              />
              <button
                onClick={addWasteEntry}
                className="dark-btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                Add Entry
              </button>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {wasteTypes.map(type => (
              <div key={type.key} className="dark-stat-card" style={{ padding: '16px 12px' }}>
                <div className="dark-stat-icon" style={{ background: type.bgColor, color: type.color, width: 40, height: 40 }}>
                  {type.icon}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{type.label}</h3>
                <div style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, color: 'var(--text-primary)' }}>{wasteData[type.key]} kg</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {(wasteData[type.key] * carbonFactors[type.key]).toFixed(2)} kg CO₂
                </div>
              </div>
            ))}
          </div>

          {/* Waste Reduction Tips */}
          <div className="dark-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Waste Reduction & Sorting Guides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', fontSize: 14 }}>🥤 Plastic Reduction</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Separate PET bottles from flexible plastic covers', 'Rinse containers before taking to scrap dealers', 'Avoid single-use plastics wherever possible', 'Earn points by bringing sorted plastic to collection centers'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', fontSize: 14 }}>📦 Paper Conservation</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Flatten cardboard boxes to save volume', 'Keep paper dry to preserve recyclability', 'Sell newspapers in bulk to your local kabadiwala', 'Compost clean unbleached cardboard at home'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', fontSize: 14 }}>💻 E-Waste Management</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Never dispose of lithium batteries in normal bins', 'Wipe personal data before recycling devices', 'Use certified e-waste dismantlers for computer boards', 'Old cables, chargers, and adapters contain valuable copper'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', fontSize: 14 }}>🌿 Organic & Green Waste</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Start a small kitchen composter for fruit and veggie peels', 'Keep dairy and oils separate from standard compost', 'Drop off excess organic waste at community compost banks', 'Use compost to nourish neighborhood tree saplings'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Center Modal */}
      <AddWasteCenterModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCenterAdded={handleCenterAdded}
        defaultLocation={userLocation}
      />
    </div>
  );
};

export default WasteManagement;
