import React from 'react';
import { MessageCircle } from 'lucide-react';

const Chat = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MessageCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Feature</h1>
          <p className="text-gray-600 mb-6">
            Connect with other eco-warriors and share your sustainability journey!
          </p>
          <p className="text-sm text-gray-500">
            Chat functionality coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
