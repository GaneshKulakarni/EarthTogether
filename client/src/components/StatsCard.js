import React from 'react';

const StatsCard = ({ icon, title, value, color='green' }) => {
  const colorMap = {
    green: 'from-green-400 to-emerald-500',
    blue: 'from-blue-400 to-cyan-500',
    purple: 'from-purple-400 to-pink-500',
    yellow: 'from-yellow-400 to-orange-500'
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
      <div className={`bg-gradient-to-br ${colorMap[color]} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
    </div>
  );
};

export default StatsCard;
