import React, { useState } from 'react';
import { Wand2, Download, Copy } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ImageGenerator = ({ onImageSelect }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerateImage = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/generate-image', 
        { prompt },
        {
          headers: { 'x-auth-token': token }
        }
      );

      setGeneratedImage(response.data.image);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error.response?.data?.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `generated-${Date.now()}.png`;
      link.click();
      toast.success('Image downloaded!');
    }
  };

  const handleUseImage = () => {
    if (generatedImage && onImageSelect) {
      onImageSelect(generatedImage);
      toast.success('Image selected!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 AI Image Generator</h3>
      
      <form onSubmit={handleGenerateImage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe the image you want to generate
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A beautiful forest with sunlight filtering through trees, environmental conservation theme"
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Wand2 className="w-5 h-5" />
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {generatedImage && (
        <div className="mt-6 space-y-4">
          <div className="border-2 border-green-200 rounded-lg overflow-hidden">
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-auto"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadImage}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            {onImageSelect && (
              <button
                onClick={handleUseImage}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Use Image
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
