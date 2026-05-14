import React, { useState } from 'react';
import { Search, BookOpen, TrendingUp, Users, Calendar, ExternalLink } from 'lucide-react';
import ResearchUploadModal from '../components/ResearchUploadModal';
import '../dark-theme.css';

const Researches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticles, setExpandedArticles] = useState(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);

  const researchArticles = [
    {
      id: 1,
      title: "Impact of Renewable Energy on Global Carbon Emissions",
      summary: "Comprehensive analysis of how renewable energy adoption has reduced global CO2 emissions by 15% over the past decade.",
      fullContent: "This comprehensive study examines the transformative impact of renewable energy technologies on global carbon emissions over the past decade. Our research, conducted across 50 countries, reveals that the widespread adoption of solar, wind, and hydroelectric power has led to a significant 15% reduction in global CO2 emissions. The study utilized advanced climate modeling and real-time emission data from major industrial sectors. Key findings include: 1) Solar energy adoption has grown by 300% since 2014, 2) Wind power now accounts for 25% of electricity generation in leading countries, 3) Hydroelectric systems have improved efficiency by 40% through modern turbine technology. The research also highlights policy frameworks that have accelerated renewable adoption, including carbon pricing mechanisms, renewable energy certificates, and government incentives. Looking forward, our projections suggest that continued investment in renewable infrastructure could achieve a 40% reduction in global emissions by 2035, provided current growth trends continue and emerging technologies like energy storage and smart grids are fully integrated.",
      category: "energy",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      readTime: "8 min read",
      tags: ["renewable energy", "carbon emissions", "climate change"]
    },
    {
      id: 2,
      title: "Microplastics in Ocean Ecosystems: Latest Findings",
      summary: "Recent research reveals the extent of microplastic pollution and its effects on marine biodiversity and food chains.",
      fullContent: "Our latest marine research expedition has uncovered alarming new data about microplastic pollution in ocean ecosystems worldwide. Using advanced filtration techniques and microscopic analysis, we've documented microplastic concentrations that exceed previous estimates by 40%. The study, conducted across 15 major ocean regions, reveals that microplastics are now present in 95% of marine species tested, including fish, shellfish, and marine mammals. These particles, measuring less than 5mm, originate primarily from synthetic textiles (35%), tire wear (28%), and plastic packaging breakdown (22%). The impact on marine food chains is profound: filter-feeding organisms like mussels and oysters show the highest contamination levels, with an average of 90 particles per gram of tissue. Larger predators, including tuna and sharks, accumulate microplastics through bioaccumulation, with concentrations increasing up the food chain. Our research also documents the presence of toxic chemicals attached to these particles, including persistent organic pollutants and heavy metals. The study's most concerning finding is the detection of microplastics in 78% of commercial seafood samples, raising significant questions about human health implications. Recommendations include immediate action on single-use plastics, improved waste management systems, and development of biodegradable alternatives.",
      category: "pollution",
      author: "Marine Research Institute",
      date: "2024-01-10",
      readTime: "12 min read",
      tags: ["microplastics", "ocean pollution", "marine life"]
    },
    {
      id: 3,
      title: "Urban Green Spaces and Air Quality Improvement",
      summary: "Study shows how strategic placement of urban forests can reduce air pollution by up to 30% in metropolitan areas.",
      category: "urban",
      author: "City Planning Research Group",
      date: "2024-01-05",
      readTime: "6 min read",
      tags: ["urban planning", "air quality", "green spaces"]
    },
    {
      id: 4,
      title: "Sustainable Agriculture Practices and Soil Health",
      summary: "Analysis of regenerative farming techniques and their positive impact on soil carbon sequestration and biodiversity.",
      category: "agriculture",
      author: "Agricultural Sustainability Lab",
      date: "2023-12-28",
      readTime: "10 min read",
      tags: ["sustainable farming", "soil health", "carbon sequestration"]
    }
  ];

  const categories = [
    { key: 'all', label: 'All Research' },
    { key: 'energy', label: 'Energy' },
    { key: 'pollution', label: 'Pollution' },
    { key: 'urban', label: 'Urban Planning' },
    { key: 'agriculture', label: 'Agriculture' }
  ];

  const toggleArticle = (articleId) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const filteredArticles = researchArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeStyle = (category) => {
    const styles = {
      energy: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
      pollution: { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
      urban: { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
      agriculture: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
    };
    return styles[category] || { bg: 'rgba(139,148,158,0.15)', color: '#8b949e' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '32px 0' }}>
      <div className="dark-main" style={{ marginTop: 0, padding: 0 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, margin: '0 auto 16px',
            }}>🔬</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Research Hub</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Discover the latest environmental research and scientific insights</p>
          </div>

          <div className="dark-card" style={{ padding: 20, marginBottom: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: 18, height: 18 }} />
                <input
                  type="text"
                  placeholder="Search research articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dark-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="dark-input"
              >
                {categories.map(category => (
                  <option key={category.key} value={category.key}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { icon: <BookOpen style={{ width: 20, height: 20 }} />, value: researchArticles.length, label: 'Research Articles', color: '#38bdf8' },
              { icon: <Users style={{ width: 20, height: 20 }} />, value: '25+', label: 'Contributing Researchers', color: '#34d399' },
              { icon: <TrendingUp style={{ width: 20, height: 20 }} />, value: '1.2K', label: 'Community Reads', color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} className="dark-stat-card">
                <div className="dark-stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
                  {s.icon}
                </div>
                <div className="dark-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="dark-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => {
                const badgeStyle = getCategoryBadgeStyle(article.category);
                return (
                  <div key={article.id} className="dark-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                          background: badgeStyle.bg, color: badgeStyle.color,
                        }}>
                          {categories.find(cat => cat.key === article.category)?.label || article.category}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{article.readTime}</span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, cursor: 'pointer' }}
                        onClick={() => toggleArticle(article.id)}>
                        {article.title}
                      </h3>

                      <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 4 }}>
                        {expandedArticles.has(article.id) ? (
                          <div>
                            <p style={{ margin: '0 0 12px' }}>{article.summary}</p>
                            <div>
                              <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.8 }}>{article.fullContent}</p>
                            </div>
                          </div>
                        ) : (
                          <p style={{ margin: 0 }}>{article.summary}</p>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                        {article.tags.map(tag => (
                          <span key={tag} style={{
                            padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 4,
                            color: 'var(--text-muted)', fontSize: 11,
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <Users style={{ width: 14, height: 14 }} />
                          <span>{article.author}</span>
                          <Calendar style={{ width: 14, height: 14, marginLeft: 8 }} />
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => toggleArticle(article.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}
                        >
                          {expandedArticles.has(article.id) ? 'Read Less' : 'Read More'}
                          <ExternalLink style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="dark-card dark-empty" style={{ padding: '48px 24px' }}>
                <BookOpen style={{ width: 56, height: 56, opacity: 0.3, marginBottom: 16 }} />
                <h3>No research found</h3>
                <p>Try adjusting your search terms or category filter.</p>
              </div>
            )}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #34d399, #059669)',
            borderRadius: 16, padding: 32, marginTop: 32,
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0a2818', margin: '0 0 8px' }}>Share Your Research</h3>
              <p style={{ color: 'rgba(10,40,24,0.8)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
                Have environmental research to share? Contribute to our knowledge base and help the community learn.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                style={{
                  background: '#0a2818', color: '#34d399',
                  border: 'none', padding: '12px 28px', borderRadius: 10,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = '#0d3720'; }}
                onMouseLeave={e => { e.target.style.background = '#0a2818'; }}
              >
                Submit Research
              </button>
              <ResearchUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Researches;
