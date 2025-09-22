import React, { useState } from 'react';
import { Trash2, Recycle, Leaf, Calculator, Plus, TrendingUp } from 'lucide-react';

const WasteManagement = () => {
  const [wasteData, setWasteData] = useState({
    plastic: 0,
    paper: 0,
    electronic: 0,
    organic: 0
  });
  const [newEntry, setNewEntry] = useState({ type: 'plastic', amount: '' });

  // Carbon savings per kg of waste avoided/recycled
  const carbonFactors = {
    plastic: 2.0, // kg CO2 per kg plastic
    paper: 1.5,   // kg CO2 per kg paper
    electronic: 5.0, // kg CO2 per kg e-waste
    organic: 0.5  // kg CO2 per kg organic waste
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
    { key: 'plastic', label: 'Plastic', icon: <Trash2 className="w-5 h-5" />, color: 'bg-red-100 text-red-600' },
    { key: 'paper', label: 'Paper', icon: <Recycle className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
    { key: 'electronic', label: 'E-Waste', icon: <Calculator className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
    { key: 'organic', label: 'Organic', icon: <Leaf className="w-5 h-5" />, color: 'bg-green-100 text-green-600' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🗑️ Waste Management</h1>
        <p className="text-gray-600">Track waste avoided and see your environmental impact!</p>
      </div>

      {/* Carbon Savings Summary */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-8 mb-8">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">{calculateTotalCarbonSaved()} kg</h2>
          <p className="text-lg opacity-90">Total CO₂ Saved</p>
        </div>
      </div>

      {/* Add New Entry */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Waste Entry</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={newEntry.type}
            onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={addWasteEntry}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Waste Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {wasteTypes.map(type => (
          <div key={type.key} className="bg-white rounded-lg shadow-md p-6">
            <div className={`w-12 h-12 rounded-full ${type.color} flex items-center justify-center mb-4`}>
              {type.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.label}</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">{wasteData[type.key]} kg</div>
            <div className="text-sm text-gray-600">
              {(wasteData[type.key] * carbonFactors[type.key]).toFixed(2)} kg CO₂ saved
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">💡 Waste Reduction Tips</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Plastic Reduction</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Use reusable bags and containers</li>
              <li>• Choose products with minimal packaging</li>
              <li>• Avoid single-use plastics</li>
              <li>• Recycle properly when disposal is necessary</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Paper Conservation</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Go digital for bills and documents</li>
              <li>• Print double-sided when necessary</li>
              <li>• Use recycled paper products</li>
              <li>• Compost paper waste when possible</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">E-Waste Management</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Donate or sell working electronics</li>
              <li>• Use certified e-waste recycling centers</li>
              <li>• Extend device lifespan with proper care</li>
              <li>• Buy refurbished when possible</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Organic Waste</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Start composting at home</li>
              <li>• Plan meals to reduce food waste</li>
              <li>• Use food scraps for gardening</li>
              <li>• Donate excess food to local charities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteManagement;