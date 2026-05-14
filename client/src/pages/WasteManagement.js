import React, { useState } from 'react';
import { Trash2, Recycle, Leaf, Calculator, Plus, TrendingUp } from 'lucide-react';
import '../dark-theme.css';

const WasteManagement = () => {
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '32px 0' }}>
      <div className="dark-main" style={{ marginTop: 0, padding: 0 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, margin: '0 auto 16px',
            }}>🗑️</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Waste Management</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track waste avoided and see your environmental impact!</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #34d399, #059669)',
            borderRadius: 16, padding: 32, marginBottom: 28,
          }}>
            <div style={{ textAlign: 'center' }}>
              <TrendingUp style={{ width: 44, height: 44, color: '#0a2818', margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0a2818', margin: '0 0 4px' }}>{calculateTotalCarbonSaved()} kg</h2>
              <p style={{ color: 'rgba(10,40,24,0.8)', fontSize: 15 }}>Total CO₂ Saved</p>
            </div>
          </div>

          <div className="dark-card" style={{ padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Add Waste Entry</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            {wasteTypes.map(type => (
              <div key={type.key} className="dark-stat-card">
                <div className="dark-stat-icon" style={{ background: type.bgColor, color: type.color }}>
                  {type.icon}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{type.label}</h3>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{wasteData[type.key]} kg</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {(wasteData[type.key] * carbonFactors[type.key]).toFixed(2)} kg CO₂ saved
                </div>
              </div>
            ))}
          </div>

          <div className="dark-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>Waste Reduction Tips</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', fontSize: 14 }}>Plastic Reduction</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Use reusable bags and containers', 'Choose products with minimal packaging', 'Avoid single-use plastics', 'Recycle properly when disposal is necessary'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', fontSize: 14 }}>Paper Conservation</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Go digital for bills and documents', 'Print double-sided when necessary', 'Use recycled paper products', 'Compost paper waste when possible'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', fontSize: 14 }}>E-Waste Management</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Donate or sell working electronics', 'Use certified e-waste recycling centers', 'Extend device lifespan with proper care', 'Buy refurbished when possible'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px', fontSize: 14 }}>Organic Waste</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Start composting at home', 'Plan meals to reduce food waste', 'Use food scraps for gardening', 'Donate excess food to local charities'].map((tip, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteManagement;
