import React, { useState } from 'react';
import { X, Upload, Trash2, FileText, Image as ImageIcon, Database } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../dark-theme.css';

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

  const StepIndicator = ({ num, label, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: step >= num ? 'var(--accent)' : 'var(--bg-input)',
        border: `2px solid ${step >= num ? 'var(--accent)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
        color: step >= num ? '#0a2818' : 'var(--text-muted)',
      }}>{num}</div>
      <span style={{ fontSize: 13, color: step >= num ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step >= num ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="dark-modal-overlay" onClick={onClose}>
      <div className="dark-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div style={{
          background: 'linear-gradient(135deg, #34d399, #059669)',
          padding: 24, borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0a2818', margin: 0 }}>Submit Research</h2>
              <p style={{ color: 'rgba(10,40,24,0.7)', fontSize: 12, marginTop: 4 }}>Step {step} of 4</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.12)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: 6, display: 'flex', color: '#0a2818' }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <StepIndicator num={1} label="Details" />
            <StepIndicator num={2} label="Author" />
            <StepIndicator num={3} label="Files" />
            <StepIndicator num={4} label="License" />
          </div>

          <div style={{ height: 3, background: 'rgba(0,0,0,0.1)', borderRadius: 4, marginTop: 14 }}>
            <div style={{ height: '100%', background: '#0a2818', borderRadius: 4, transition: 'width 0.3s', width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, overflowY: 'auto', maxHeight: '60vh' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--accent-dim)', borderLeft: '3px solid var(--accent)', padding: 12, borderRadius: 8 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: 14 }}>Essential Information</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Fill in the basic details about your research</p>
              </div>

              <div>
                <label className="dark-label">Research Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Impact of Renewable Energy on Carbon Emissions"
                  className="dark-input"
                />
              </div>

              <div>
                <label className="dark-label">Abstract (2-4 lines) *</label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your research findings..."
                  rows="4"
                  className="dark-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dark-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="dark-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="dark-label">Research Date</label>
                  <input
                    type="date"
                    name="researchDate"
                    value={formData.researchDate}
                    onChange={handleInputChange}
                    className="dark-input"
                  />
                </div>
              </div>

              <div>
                <label className="dark-label">Research Document (PDF/Word) *</label>
                <div style={{
                  border: '2px dashed var(--border-accent)', borderRadius: 12,
                  padding: 24, textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s', background: 'var(--accent-dim)',
                }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="document-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <FileText style={{ width: 36, height: 36, color: 'var(--accent)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {files.document ? `✓ ${files.document.name}` : 'Click to upload document'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PDF or Word document</p>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(56,189,248,0.1)', borderLeft: '3px solid #38bdf8', padding: 12, borderRadius: 8 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: 14 }}>Author Details</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Tell us about yourself and your credentials</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dark-label">Researcher Name *</label>
                  <input
                    type="text"
                    name="researcherName"
                    value={formData.researcherName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="dark-input"
                  />
                </div>

                <div>
                  <label className="dark-label">Institution *</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="University/Organization"
                    className="dark-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dark-label">Education Qualification *</label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="dark-input"
                  >
                    <option value="">Select qualification</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="dark-label">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="dark-input"
                  />
                </div>
              </div>

              <div>
                <label className="dark-label">Keywords/Tags</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="e.g., forest cover, soil erosion, climate impact"
                  className="dark-input"
                />
              </div>

              <div>
                <label className="dark-label">Study Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazon Rainforest, Brazil"
                  className="dark-input"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(167,139,250,0.1)', borderLeft: '3px solid #a78bfa', padding: 12, borderRadius: 8 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: 14 }}>Additional Files</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Upload supporting materials and data</p>
              </div>

              <div>
                <label className="dark-label">Images/Graphs (Max 5)</label>
                <div style={{
                  border: '2px dashed rgba(167,139,250,0.35)', borderRadius: 12,
                  padding: 24, textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s', background: 'rgba(167,139,250,0.06)',
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    id="images-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="images-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <ImageIcon style={{ width: 36, height: 36, color: '#a78bfa', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Click to upload images</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{files.images.length}/5 uploaded</p>
                  </label>
                </div>
                {files.images.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {files.images.map((img, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(167,139,250,0.08)', padding: 10, borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📷 {img.name}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="dark-label">Supporting Files - Data/Excel (Max 5)</label>
                <div style={{
                  border: '2px dashed rgba(167,139,250,0.35)', borderRadius: 12,
                  padding: 24, textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s', background: 'rgba(167,139,250,0.06)',
                }}>
                  <input
                    type="file"
                    multiple
                    onChange={handleSupportingFilesUpload}
                    id="supporting-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="supporting-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <Database style={{ width: 36, height: 36, color: '#a78bfa', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Click to upload files</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{files.supportingFiles.length}/5 uploaded</p>
                  </label>
                </div>
                {files.supportingFiles.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {files.supportingFiles.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(167,139,250,0.08)', padding: 10, borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📊 {file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSupportingFile(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(251,146,60,0.1)', borderLeft: '3px solid #fb923c', padding: 12, borderRadius: 8 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: 14 }}>License & Professional Details</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Set permissions and research identifiers</p>
              </div>

              <div>
                <label className="dark-label">License Type</label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleInputChange}
                  className="dark-input"
                >
                  <option value="open-access">Open Access</option>
                  <option value="copyright">© Copyright</option>
                  <option value="creative-commons">Creative Commons</option>
                </select>
              </div>

              <div>
                <label className="dark-label">DOI or Unique Research ID (Optional)</label>
                <input
                  type="text"
                  name="doi"
                  value={formData.doi}
                  onChange={handleInputChange}
                  placeholder="e.g., 10.1234/example.doi or leave blank for auto-generation"
                  className="dark-input"
                />
              </div>

              <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 10, border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10 }}>
                  <input
                    type="checkbox"
                    name="peerReview"
                    checked={formData.peerReview}
                    onChange={handleInputChange}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Enable Peer Review Option
                  </span>
                </label>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, marginLeft: 26 }}>
                  Allow reviewers to comment and provide feedback on your research
                </p>
              </div>

              <div style={{ background: 'rgba(56,189,248,0.08)', padding: 14, borderRadius: 10, border: '1px solid rgba(56,189,248,0.15)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  <span style={{ fontWeight: 700 }}>Summary:</span> Your research will be published with the selected license type. A unique identifier will be generated for citation purposes.
                </p>
              </div>
            </div>
          )}
        </form>

        <div style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="dark-btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="dark-btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="dark-btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
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
