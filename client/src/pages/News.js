import React from 'react';
import EnvironmentNews from '../components/EnvironmentNews';

const News = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Environment & Sustainability News 🌍
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Stay informed about the latest developments in environmental protection, climate change, and sustainability efforts worldwide.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Refresh News
          </button>
        </div>
        <EnvironmentNews />
      </div>
    </div>
  );
};

export default News;