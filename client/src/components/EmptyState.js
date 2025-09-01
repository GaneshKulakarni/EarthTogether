import React from 'react';

const EmptyState = ({ icon, title, subtitle }) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto mb-4 text-gray-300">{icon}</div>
      <p className="text-gray-500 text-lg mb-2">{title}</p>
      <p className="text-gray-400">{subtitle}</p>
    </div>
  );
};

export default EmptyState;
