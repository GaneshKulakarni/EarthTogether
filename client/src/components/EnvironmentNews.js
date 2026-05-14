import React, { useState, useEffect } from 'react';
import { getEnvironmentNews } from '../services/api';
import { X, ExternalLink, Calendar, User, Wand2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../dark-theme.css';

const EnvironmentNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [generatingImages, setGeneratingImages] = useState({});

  const newsWithImages = [
    {
      id: 'cop29-climate-summit',
      headline: "COP29 Climate Summit Reaches Historic $300 Billion Deal",
      summary: "World leaders at COP29 in Baku agreed to provide $300 billion annually by 2035 to help developing nations combat climate change.",
      content: "The COP29 climate summit concluded with a landmark agreement on climate finance. Developed nations committed to providing $300 billion annually by 2035 to support developing countries in their climate mitigation and adaptation efforts. This represents a significant increase from previous commitments and is seen as crucial for limiting global warming to 1.5°C. The deal includes provisions for renewable energy transition, forest protection, and climate resilience in vulnerable nations.",
      source: "Reuters Climate",
      image: null,
      date: "November 2024",
      author: "Climate News Team"
    },
    {
      id: 'antarctic-ice',
      headline: "Antarctic Ice Sheet Melting Accelerates to Critical Levels",
      summary: "New satellite data reveals Antarctic ice loss has tripled in the past decade. Scientists warn of irreversible tipping points.",
      content: "Recent satellite observations show that Antarctic ice sheet melting has accelerated dramatically, with ice loss now occurring at three times the rate observed a decade ago. Scientists attribute this acceleration to warming ocean temperatures and atmospheric changes. The melting contributes significantly to global sea level rise, threatening coastal communities worldwide. Researchers warn that if current trends continue, we may reach irreversible tipping points that could lead to catastrophic sea level rise.",
      source: "Nature Climate Change",
      image: null,
      date: "October 2024",
      author: "Dr. Sarah Mitchell"
    },
    {
      id: 'ocean-plastic',
      headline: "Ocean Plastic Pollution Reaches Critical Levels",
      summary: "New research shows over 100 million tons of plastic waste in oceans, threatening marine ecosystems and food chains.",
      content: "A comprehensive study reveals that ocean plastic pollution has reached alarming levels, with over 100 million tons of plastic waste currently in our oceans. This pollution is devastating marine life, from microscopic plankton to large whales. Plastic particles are entering the food chain, affecting fish populations and ultimately impacting human health. Urgent action is needed to reduce plastic consumption, improve waste management, and develop innovative cleanup technologies to address this growing crisis.",
      source: "Ocean Conservancy",
      image: null,
      date: "September 2024",
      author: "Marine Research Institute"
    },
    {
      id: 'solar-panels',
      headline: "Solar Power Becomes Cheapest Energy Source in History",
      summary: "Solar photovoltaic costs have dropped 90% since 2010, making it the most affordable electricity source globally.",
      content: "A comprehensive analysis by the International Energy Agency reveals that solar photovoltaic technology has become the cheapest source of electricity in history. The cost per watt has plummeted 90% over the past 14 years, making solar energy more affordable than fossil fuels in most regions. This cost reduction is driving rapid adoption of solar technology worldwide, with solar installations now accounting for a significant portion of new electricity generation capacity. Experts predict that solar will continue to dominate renewable energy expansion in the coming decades.",
      source: "International Energy Agency",
      image: null,
      date: "August 2024",
      author: "Energy Analytics Division"
    },
    {
      id: 'forest-recovery',
      headline: "Global Forests Show Signs of Recovery After Decades of Loss",
      summary: "New data indicates that reforestation efforts and natural regeneration are reversing deforestation trends in several regions.",
      content: "Encouraging news from the Global Forest Watch shows that forest loss has slowed in several key regions thanks to aggressive reforestation programs and conservation efforts. Countries like Brazil, Indonesia, and the Democratic Republic of Congo have implemented policies that are beginning to reverse decades of deforestation. These efforts are critical for carbon sequestration, biodiversity protection, and climate regulation. However, experts caution that much more work is needed to restore forests to pre-industrial levels and prevent further degradation.",
      source: "Global Forest Watch",
      image: null,
      date: "July 2024",
      author: "Conservation Team"
    },
    {
      id: 'sewage-treatment',
      headline: "Sewage Treatment Innovation Reduces Water Pollution",
      summary: "New advanced treatment systems remove 99% of pollutants from wastewater, protecting rivers and coastal ecosystems.",
      content: "Revolutionary sewage treatment technology has been developed that removes 99% of pollutants from wastewater, including harmful chemicals and microplastics. This innovation is being implemented in major cities worldwide to protect rivers, lakes, and coastal ecosystems from pollution. The new systems are more efficient and cost-effective than traditional methods, making them accessible to developing nations. Early results show significant improvements in water quality and aquatic life recovery in treated areas.",
      source: "Water Technology Today",
      image: null,
      date: "June 2024",
      author: "Environmental Engineers"
    }
  ];

  const generateImageForNews = async (newsItem) => {
    try {
      setGeneratingImages(prev => ({ ...prev, [newsItem.id]: true }));
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/generate-news-image',
        { newsKey: newsItem.id, headline: newsItem.headline },
        { 
          headers: { 'x-auth-token': token },
          timeout: 30000
        }
      );
      
      if (response.data && response.data.image) {
        setNews(prev => prev.map(item => 
          item.id === newsItem.id ? { ...item, image: response.data.image } : item
        ));
        toast.success(response.data.fallback ? 'Image loaded!' : 'Image generated!');
      } else {
        toast.error('No image data received');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate image';
      toast.error(errorMsg);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [newsItem.id]: false }));
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEnvironmentNews();
        
        let newsData = [];
        if (response && Array.isArray(response)) {
          newsData = response;
        } else if (response && response.data) {
          newsData = Array.isArray(response.data) ? response.data : [response.data];
        } else {
          newsData = newsWithImages;
        }
        
        const finalNews = newsData.length > 0 ? newsData : newsWithImages;
        setNews(finalNews);
        
        finalNews.forEach(item => {
          if (!item.image && item.id) {
            generateImageForNews(item);
          }
        });
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Error loading news. Showing featured articles.');
        setNews(newsWithImages);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(52,211,153,0.2)', borderTopColor: '#34d399', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {news.map((item, index) => (
          <div
            key={index}
            className="dark-card"
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.headline}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : generatingImages[item.id] ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(52,211,153,0.2)', borderTopColor: '#34d399', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Generating...</span>
                </div>
              ) : (
                <button
                  onClick={() => generateImageForNews(item)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <Wand2 style={{ width: 32, height: 32 }} />
                  <span style={{ fontSize: 12 }}>Generate Image</span>
                </button>
              )}
              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: 'var(--accent)', color: '#0a2818',
                padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700,
              }}>
                Featured
              </div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.4 }}>
                {item.headline}
              </h3>

              {item.date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  <Calendar style={{ width: 12, height: 12 }} />
                  {item.date}
                </div>
              )}

              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6, flex: 1 }}>
                {item.summary}
              </p>

              {item.source && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Source: <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.source}</span>
                </p>
              )}

              <button
                onClick={() => setSelectedArticle(item)}
                className="dark-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Read More</span>
                <ExternalLink style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedArticle && (
        <div className="dark-modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="dark-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="dark-modal-header" style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
              <h2 style={{ color: '#0a2818', fontSize: 20 }}>Article Details</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                style={{ background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a2818' }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ padding: 28 }}>
              {selectedArticle.image ? (
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.headline}
                  style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 12, marginBottom: 24 }}
                />
              ) : (
                <div style={{ width: '100%', height: 320, background: 'var(--bg-input)', borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Image generating...
                </div>
              )}

              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                {selectedArticle.headline}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                {selectedArticle.date && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                    <Calendar style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                    <span>{selectedArticle.date}</span>
                  </div>
                )}
                {selectedArticle.author && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                    <User style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                    <span>{selectedArticle.author}</span>
                  </div>
                )}
                {selectedArticle.source && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>Source:</span> {selectedArticle.source}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24, padding: 16, background: 'var(--accent-dim)', borderLeft: '3px solid var(--accent)', borderRadius: 8 }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 6px', fontSize: 13 }}>Summary</p>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13, lineHeight: 1.6 }}>{selectedArticle.summary}</p>
              </div>

              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>Full Article</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 13, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedArticle.content}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="dark-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Close
                </button>
                <button
                  className="dark-btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>Share Article</span>
                  <ExternalLink style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnvironmentNews;
