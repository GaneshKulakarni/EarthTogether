import React from 'react';
import { X, Share2, Copy, Shield, Flame, Leaf, Cloud } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12131a] border border-gray-800/80 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Share2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">Share Your Progress</h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-gray-800/60 rounded-xl transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Shareable Card Box */}
          <div className="bg-[#0b0c10] border border-emerald-500/20 rounded-xl p-5 mb-6">
            {/* User Info Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl filter drop-shadow">🌍</span>
                <h3 className="text-xl font-bold text-white tracking-wide">{progressData.username}</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                EarthTogether Member
              </span>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-gray-800/50 my-4 w-full"></div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Eco Points */}
              <div className="bg-[#13141a] border border-gray-800/40 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400 leading-none">{progressData.ecoPoints}</div>
                  <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                    Eco Points
                  </div>
                </div>
              </div>

              {/* Day Streak */}
              <div className="bg-[#13141a] border border-gray-800/40 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-orange-400 leading-none">{progressData.currentStreak}</div>
                  <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                    Day Streak
                  </div>
                </div>
              </div>

              {/* CO2 Saved */}
              <div className="bg-[#13141a] border border-gray-800/40 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-blue-400 leading-none">{progressData.carbonSaved}kg</div>
                  <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                    CO₂ Saved
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-[#13141a] border border-gray-800/40 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-purple-400 leading-none">{progressData.badges}</div>
                  <div className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">
                    Badges
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-emerald-400/95 bg-emerald-500/5 py-2 px-3 rounded-lg border border-emerald-500/10">
              <Leaf className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-medium tracking-wide">Proud of your impact? Inspire others!</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-400 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/60 hover:border-gray-700/80 text-gray-300 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareProgressModal;

