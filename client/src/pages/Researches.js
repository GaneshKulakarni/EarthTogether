import React, { useState } from 'react';
import { Search, BookOpen, TrendingUp, Users, Calendar, ExternalLink } from 'lucide-react';

const Researches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const researchArticles = [
    {
      id: 1,
      title: "Impact of Renewable Energy on Global Carbon Emissions",
      summary: "Comprehensive analysis of how renewable energy adoption has reduced global CO2 emissions by 15% over the past decade.",
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

  const filteredArticles = researchArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔬 Research Hub</h1>
        <p className="text-gray-600">Discover the latest environmental research and scientific insights</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search research articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {categories.map(category => (
              <option key={category.key} value={category.key}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Research Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">{researchArticles.length}</h3>
          <p className="text-gray-600">Research Articles</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">25+</h3>
          <p className="text-gray-600">Contributing Researchers</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <TrendingUp className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">1.2K</h3>
          <p className="text-gray-600">Community Reads</p>
        </div>
      </div>

      {/* Research Articles */}
      <div className="space-y-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <div key={article.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.category === 'energy' ? 'bg-yellow-100 text-yellow-800' :
                      article.category === 'pollution' ? 'bg-red-100 text-red-800' :
                      article.category === 'urban' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {categories.find(cat => cat.key === article.category)?.label || article.category}
                    </span>
                    <span className="text-gray-500 text-sm">{article.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-green-600 cursor-pointer">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{article.summary}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{article.author}</span>
                      <Calendar className="w-4 h-4 ml-2" />
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <button className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium">
                      Read More
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No research found</h3>
            <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </div>

      {/* Community Contribution */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-8 mt-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Share Your Research</h3>
          <p className="mb-6 opacity-90">Have environmental research to share? Contribute to our knowledge base and help the community learn.</p>
          <button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
            Submit Research
          </button>
        </div>
      </div>
    </div>
  );
};

export default Researches;