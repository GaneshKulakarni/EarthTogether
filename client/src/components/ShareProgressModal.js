import React from 'react';
import { X, Share2, Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareProgressModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const progressData = {
    username: user.username,
    ecoPoints: user.ecoPoints || 0,
    currentStreak: user.currentStreak || 0,
    carbonSaved: user.totalCarbonSaved || 0,
    wasteSaved: user.totalWasteReduced || 0,
    badges: user.badges?.length || 0
  };

  const shareText = `🌍 My EarthTogether Progress 🌱\n\n` +
    `👤 ${progressData.username}\n` +
    `🏆 ${progressData.ecoPoints} Eco Points\n` +
    `🔥 ${progressData.currentStreak} Day Streak\n` +
    `♻️ ${progressData.carbonSaved}kg CO₂ Saved\n` +
    `🗑️ ${progressData.wasteSaved}kg Waste Reduced\n` +
    `🎖️ ${progressData.badges} Badges Earned\n\n` +
    `Join me in making a difference! #EarthTogether #Sustainability`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    toast.success('Progress copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My EarthTogether Progress',
          text: shareText
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Share Your Progress</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 mb-6 border-2 border-green-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🌍 {progressData.username}</h3>
              <p className="text-sm text-gray-600">EarthTogether Member</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{progressData.ecoPoints}</p>
                <p className="text-xs text-gray-600">Eco Points</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{progressData.currentStreak}</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{progressData.carbonSaved}kg</p>
                <p className="text-xs text-gray-600">CO₂ Saved</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{progressData.badges}</p>
                <p className="text-xs text-gray-600">Badges</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareProgressModal;
