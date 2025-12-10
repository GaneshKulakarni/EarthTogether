import React, { useState } from 'react';
import { X, Upload, Trash2, FileText, Image as ImageIcon, Database } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResearchUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category: 'environment',
    researcherName: '',
    institution: '',
    email: '',
    education: '',
    keywords: '',
    location: '',
    researchDate: '',
    license: 'open-access',
    doi: '',
    peerReview: false
  });

  const [files, setFiles] = useState({
    document: null,
    images: [],
    supportingFiles: []
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const categories = [
    'Environment',
    'Climate Change',
    'Water Pollution',
    'Air Quality',
    'Biodiversity',
    'Energy',
    'Urban Planning',
    'Agriculture'
  ];

  const educationLevels = [
    'High School',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Postdoctoral',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file && ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setFiles(prev => ({ ...prev, document: file }));
      toast.success('Document uploaded');
    } else {
      toast.error('Please upload PDF or Word document');
    }
  };

  const handleImageUpload = (e) => {
    const newImages = Array.from(e.target.files);
    if (files.images.length + newImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setFiles(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    toast.success(`${newImages.length} image(s) added`);
  };

  const handleSupportingFilesUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    if (files.supportingFiles.length + newFiles.length > 5) {
      toast.error('Maximum 5 supporting files allowed');
      return;
    }
    setFiles(prev => ({ ...prev, supportingFiles: [...prev.supportingFiles, ...newFiles] }));
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeImage = (index) => {
    setFiles(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeSupportingFile = (index) => {
    setFiles(prev => ({
      ...prev,
      supportingFiles: prev.supportingFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.abstract || !files.document || !formData.researcherName || !formData.institution || !formData.education) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      formDataToSend.append('document', files.document);
      files.images.forEach(img => formDataToSend.append('images', img));
      files.supportingFiles.forEach(file => formDataToSend.append('supportingFiles', file));

      const token = localStorage.getItem('token');
      await axios.post('/api/research', formDataToSend, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Research uploaded successfully!');
      onSuccess?.();
      onClose();
      
      setFormData({
        title: '',
        abstract: '',
        category: 'environment',
        researcherName: '',
        institution: '',
        email: '',
        education: '',
        keywords: '',
        location: '',
        researchDate: '',
        license: 'open-access',
        doi: '',
        peerReview: false
      });
      setFiles({ document: null, images: [], supportingFiles: [] });
      setStep(1);
    } catch (error) {
      console.error('Error uploading research:', error);
      toast.error(error.response?.data?.message || 'Failed to upload research');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">📚 Submit Research</h2>
            <p className="text-green-100 text-sm mt-1">Step {step} of 4</p>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
          {/* Step 1: Essential Information */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">📝 Essential Information</h3>
                <p className="text-sm text-gray-600">Fill in the basic details about your research</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Research Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Impact of Renewable Energy on Carbon Emissions"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Abstract (2-4 lines) *</label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your research findings..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition resize-none bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-900"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Research Date</label>
                  <input
                    type="date"
                    name="researchDate"
                    value={formData.researchDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Research Document (PDF/Word) *</label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <FileText className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {files.document ? `✓ ${files.document.name}` : 'Click to upload document'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF or Word document</p>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Author Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">👤 Author Details</h3>
                <p className="text-sm text-gray-600">Tell us about yourself and your credentials</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Researcher Name *</label>
                  <input
                    type="text"
                    name="researcherName"
                    value={formData.researcherName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Institution *</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="University/Organization"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Education Qualification *</label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-gray-900"
                  >
                    <option value="">Select qualification</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keywords/Tags</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="e.g., forest cover, soil erosion, climate impact"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Study Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazon Rainforest, Brazil"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Additional Files */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">📎 Additional Files</h3>
                <p className="text-sm text-gray-600">Upload supporting materials and data</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Images/Graphs (Max 5)</label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="images-upload"
                  />
                  <label htmlFor="images-upload" className="cursor-pointer">
                    <ImageIcon className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">{files.images.length}/5 uploaded</p>
                  </label>
                </div>
                {files.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.images.map((img, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">📷 {img.name}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supporting Files - Data/Excel (Max 5)</label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                  <input
                    type="file"
                    multiple
                    onChange={handleSupportingFilesUpload}
                    className="hidden"
                    id="supporting-upload"
                  />
                  <label htmlFor="supporting-upload" className="cursor-pointer">
                    <Database className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Click to upload files</p>
                    <p className="text-xs text-gray-500 mt-1">{files.supportingFiles.length}/5 uploaded</p>
                  </label>
                </div>
                {files.supportingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.supportingFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">📊 {file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSupportingFile(idx)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: License & Professional Details */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <h3 className="font-semibold text-gray-900 mb-1">⚙️ License & Professional Details</h3>
                <p className="text-sm text-gray-600">Set permissions and research identifiers</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">License Type</label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition bg-white text-gray-900"
                >
                  <option value="open-access">🌐 Open Access</option>
                  <option value="copyright">© Copyright</option>
                  <option value="creative-commons">🎨 Creative Commons</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">DOI or Unique Research ID (Optional)</label>
                <input
                  type="text"
                  name="doi"
                  value={formData.doi}
                  onChange={handleInputChange}
                  placeholder="e.g., 10.1234/example.doi or leave blank for auto-generation"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="peerReview"
                    checked={formData.peerReview}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-200"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Enable Peer Review Option
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-2 ml-8">Allow reviewers to comment and provide feedback on your research</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">📋 Summary:</span> Your research will be published with the selected license type. A unique identifier will be generated for citation purposes.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 flex gap-3">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? '⏳ Uploading...' : '✓ Submit Research'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchUploadModal;
