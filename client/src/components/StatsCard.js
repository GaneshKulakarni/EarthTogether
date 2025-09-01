import React from 'react';

const StatsCard = ({ icon, title, value, color='green' }) => {
  const colorMap = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className={`${colorMap[color]} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-gray-600">{title}</p>
    </div>
  );
};

export default StatsCard;
