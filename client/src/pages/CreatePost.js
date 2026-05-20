import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePost } from '../context/PostContext';
import { ArrowLeft, Image, Video, X, Loader2 } from 'lucide-react';
import { uploadMedia } from '../services/api';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPost } = usePost();
  
  const [formData, setFormData] = useState({
    content: '',
    category: 'General'
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' or 'video'
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const fileInputRef = useRef(null);

  const categories = [
    'General', 'Achievement', 'Tip', 'Question', 'Challenge', 
    'Waste Reduction', 'Energy', 'Transportation', 'Water', 'Food'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File is too large. Max size is 100MB.');
      return;
    }

    const type = file.mimetype?.startsWith('video/') || file.type.startsWith('video/') ? 'video' : 'image';
    
    setSelectedFile(file);
    setFileType(type);
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast.error('Please write something to share!');
      return;
    }

    setIsCreating(true);
    
    try {
      let mediaUrl = '';
      let resourceType = '';

      if (selectedFile) {
        setIsUploading(true);
        const uploadRes = await uploadMedia(selectedFile);
        mediaUrl = uploadRes.url;
        resourceType = uploadRes.resource_type;
        setIsUploading(false);
      }

      const postData = {
        content: formData.content,
        category: formData.category,
        imageUrl: resourceType === 'image' ? mediaUrl : '',
        videoUrl: resourceType === 'video' ? mediaUrl : ''
      };

      await addPost(postData);
      toast.success('Post shared successfully! 🌱');
      navigate('/welcome');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] py-8 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all border border-slate-700"
          >
            <ArrowLeft className="w-6 h-6 text-green-400" />
          </button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
            Create Eco-Post
          </h1>
        </div>

        {/* Form */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">{user?.username || 'User'}</h3>
                <p className="text-sm text-green-400/80">Eco-Influencer</p>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">What's your eco-story? *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Share your sustainable journey, tips, or questions..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-4 resize-none focus:ring-2 focus:ring-green-500/50 outline-none transition-all min-h-[160px]"
                required
              />
            </div>

            {/* Media Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-400">Add Media (Optional)</label>
              
              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800">
                  {fileType === 'video' ? (
                    <video 
                      src={previewUrl} 
                      className="w-full max-h-[400px] object-contain" 
                      controls 
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full max-h-[400px] object-cover" 
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-2 backdrop-blur-md transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    ref={fileInputRef}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-2xl hover:border-green-500/50 hover:bg-green-500/5 cursor-pointer transition-all group"
                  >
                    <Image className="w-10 h-10 mb-2 text-slate-500 group-hover:text-green-400" />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200">Add Photo</span>
                  </label>

                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all group"
                  >
                    <Video className="w-10 h-10 mb-2 text-slate-500 group-hover:text-blue-400" />
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200">Add Video</span>
                  </label>
                </div>
              )}
              <p className="text-xs text-slate-500 text-center">Max file size: 100MB</p>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isCreating || isUploading || !formData.content.trim()}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-xl shadow-green-900/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isCreating || isUploading) ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isUploading ? 'Uploading Media...' : 'Creating Post...'}</span>
                  </>
                ) : (
                  <span>Share My Eco-Story</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;