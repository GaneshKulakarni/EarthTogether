import React, { useState, useEffect } from 'react';
import { getEnvironmentNews } from '../services/api';
import { X, ExternalLink, Calendar, User } from 'lucide-react';

const EnvironmentNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const newsWithImages = [
    {
      headline: "COP29 Climate Summit Reaches Historic $300 Billion Deal",
      summary: "World leaders at COP29 in Baku agreed to provide $300 billion annually by 2035 to help developing nations combat climate change.",
      content: "The COP29 climate summit concluded with a landmark agreement on climate finance. Developed nations committed to providing $300 billion annually by 2035 to support developing countries in their climate mitigation and adaptation efforts. This represents a significant increase from previous commitments and is seen as crucial for limiting global warming to 1.5°C. The deal includes provisions for renewable energy transition, forest protection, and climate resilience in vulnerable nations.",
      source: "Reuters Climate",
      image: "/images/news/climate-summit.jpg",
      date: "November 2024",
      author: "Climate News Team"
    },
    {
      headline: "Antarctic Ice Sheet Melting Accelerates to Critical Levels",
      summary: "New satellite data reveals Antarctic ice loss has tripled in the past decade. Scientists warn of irreversible tipping points.",
      content: "Recent satellite observations show that Antarctic ice sheet melting has accelerated dramatically, with ice loss now occurring at three times the rate observed a decade ago. Scientists attribute this acceleration to warming ocean temperatures and atmospheric changes. The melting contributes significantly to global sea level rise, threatening coastal communities worldwide. Researchers warn that if current trends continue, we may reach irreversible tipping points that could lead to catastrophic sea level rise.",
      source: "Nature Climate Change",
      image: "/images/news/antarctic-ice.jpg",
      date: "October 2024",
      author: "Dr. Sarah Mitchell"
    },
    {
      headline: "Ocean Plastic Pollution Reaches Critical Levels",
      summary: "New research shows over 100 million tons of plastic waste in oceans, threatening marine ecosystems and food chains.",
      content: "A comprehensive study reveals that ocean plastic pollution has reached alarming levels, with over 100 million tons of plastic waste currently in our oceans. This pollution is devastating marine life, from microscopic plankton to large whales. Plastic particles are entering the food chain, affecting fish populations and ultimately impacting human health. Urgent action is needed to reduce plastic consumption, improve waste management, and develop innovative cleanup technologies to address this growing crisis.",
      source: "Ocean Conservancy",
      image: "/images/news/ocean-plastic.jpg",
      date: "September 2024",
      author: "Marine Research Institute"
    },
    {
      headline: "Solar Power Becomes Cheapest Energy Source in History",
      summary: "Solar photovoltaic costs have dropped 90% since 2010, making it the most affordable electricity source globally.",
      content: "A comprehensive analysis by the International Energy Agency reveals that solar photovoltaic technology has become the cheapest source of electricity in history. The cost per watt has plummeted 90% over the past 14 years, making solar energy more affordable than fossil fuels in most regions. This cost reduction is driving rapid adoption of solar technology worldwide, with solar installations now accounting for a significant portion of new electricity generation capacity. Experts predict that solar will continue to dominate renewable energy expansion in the coming decades.",
      source: "International Energy Agency",
      image: "/images/news/solar-panels.jpg",
      date: "August 2024",
      author: "Energy Analytics Division"
    },
    {
      headline: "Global Forests Show Signs of Recovery After Decades of Loss",
      summary: "New data indicates that reforestation efforts and natural regeneration are reversing deforestation trends in several regions.",
      content: "Encouraging news from the Global Forest Watch shows that forest loss has slowed in several key regions thanks to aggressive reforestation programs and conservation efforts. Countries like Brazil, Indonesia, and the Democratic Republic of Congo have implemented policies that are beginning to reverse decades of deforestation. These efforts are critical for carbon sequestration, biodiversity protection, and climate regulation. However, experts caution that much more work is needed to restore forests to pre-industrial levels and prevent further degradation.",
      source: "Global Forest Watch",
      image: "/images/news/forest-recovery.jpg",
      date: "July 2024",
      author: "Conservation Team"
    },
    {
      headline: "Sewage Treatment Innovation Reduces Water Pollution",
      summary: "New advanced treatment systems remove 99% of pollutants from wastewater, protecting rivers and coastal ecosystems.",
      content: "Revolutionary sewage treatment technology has been developed that removes 99% of pollutants from wastewater, including harmful chemicals and microplastics. This innovation is being implemented in major cities worldwide to protect rivers, lakes, and coastal ecosystems from pollution. The new systems are more efficient and cost-effective than traditional methods, making them accessible to developing nations. Early results show significant improvements in water quality and aquatic life recovery in treated areas.",
      source: "Water Technology Today",
      image: "/images/news/sewage-treatment.jpg",
      date: "June 2024",
      author: "Environmental Engineers"
    }
  ];

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
        
        setNews(newsData.length > 0 ? newsData : newsWithImages);
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gray-200">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'}
                alt={item.headline}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Featured
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {item.headline}
              </h3>

              {item.date && (
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar className="w-3 h-3 mr-1" />
                  {item.date}
                </div>
              )}

              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                {item.summary}
              </p>

              {item.source && (
                <p className="text-xs text-gray-500 mb-4">
                  Source: <span className="font-semibold">{item.source}</span>
                </p>
              )}

              <button
                onClick={() => setSelectedArticle(item)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Read More</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Article Details</h2>
              <button
                onClick={() => setSelectedArticle(null)}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Featured Image */}
              <img
                src={selectedArticle.image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop'}
                alt={selectedArticle.headline}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedArticle.headline}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
                {selectedArticle.date && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    <span>{selectedArticle.date}</span>
                  </div>
                )}
                {selectedArticle.author && (
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2 text-green-500" />
                    <span>{selectedArticle.author}</span>
                  </div>
                )}
                {selectedArticle.source && (
                  <div className="text-gray-600">
                    <span className="font-semibold">Source:</span> {selectedArticle.source}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-gray-700 font-semibold">Summary</p>
                <p className="text-gray-600 mt-2">{selectedArticle.summary}</p>
              </div>

              {/* Full Content */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Full Article</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Share Article</span>
                  <ExternalLink className="w-4 h-4" />
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
