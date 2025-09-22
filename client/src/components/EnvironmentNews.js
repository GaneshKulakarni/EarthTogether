import React, { useState, useEffect } from 'react';
import { getEnvironmentNews } from '../services/api';


const EnvironmentNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getEnvironmentNews();
        
        // Handle the response format
        let newsData = [];
        if (response && response.data) {
          newsData = Array.isArray(response.data) ? response.data : [response.data];
        } else if (Array.isArray(response)) {
          newsData = response;
        }
        
        setNews(newsData);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Error loading environment news. Please try again later.');
        
        // Fallback to mock data
        setNews([{
          headline: "Welcome to EarthTogether News!",
          summary: "Stay tuned for the latest environmental news and updates. We're working on bringing you fresh content.",
          source: "EarthTogether"
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Latest Environment News
        </h2>
        <p className="text-gray-600">
          Stay updated with the latest developments in environmental protection and sustainability.
        </p>
      </div>

      {news.length > 0 ? (
        <div className="space-y-6">
          {news.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                      🌱
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.headline}
                    </h3>
                    {item.source && (
                      <p className="text-sm text-gray-500 mb-3">
                        Source: {item.source}
                      </p>
                    )}
                    <p className="text-gray-700 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            No environment news available at the moment. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnvironmentNews;
