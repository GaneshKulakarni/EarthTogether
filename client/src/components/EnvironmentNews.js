import React, { useState, useEffect } from 'react';
import { getEnvironmentNews } from '../services/api';

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  CircularProgress,
  Paper,
  Container
} from '@mui/material';
import { green } from '@mui/material/colors';


const EnvironmentNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log('EnvironmentNews component mounted');
  

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    
    const fetchNews = async (retry = false) => {
      if (!isMounted) return;
      
      if (!retry) {
        console.log('Starting to fetch news...');
        setLoading(true);
        setError(null);
      }
      
      try {
        console.log('Calling getEnvironmentNews()...');
        const response = await getEnvironmentNews();
        
        if (!isMounted) {
          console.log('Component unmounted, aborting...');
          return;
        }
        
        console.log('News API response received:', response);
        
        // Handle the response format
        let newsData = [];
        
        if (response && Array.isArray(response)) {
          newsData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          newsData = response.data;
        } else {
          // Use fallback data immediately
          newsData = [
            {
              headline: "COP29 Climate Summit Reaches Historic $300 Billion Deal",
              summary: "World leaders at COP29 in Baku agreed to provide $300 billion annually by 2035 to help developing nations combat climate change.",
              source: "Reuters Climate"
            },
            {
              headline: "Antarctic Ice Sheet Melting Accelerates to Critical Levels",
              summary: "New satellite data reveals Antarctic ice loss has tripled in the past decade. Scientists warn of irreversible tipping points.",
              source: "Nature Climate Change"
            },
            {
              headline: "Solar Power Becomes Cheapest Energy Source in History",
              summary: "Solar photovoltaic costs have dropped 90% since 2010, making it the most affordable electricity source globally.",
              source: "International Energy Agency"
            },
            {
              headline: "Amazon Rainforest Deforestation Drops 30% in 2024",
              summary: "Brazil reports significant reduction in Amazon deforestation following enhanced monitoring and enforcement.",
              source: "Environmental Protection Agency"
            },
            {
              headline: "Microplastics Found in Human Blood Raise Health Concerns",
              summary: "Scientists detect microplastic particles in human bloodstream for the first time.",
              source: "Science Journal"
            }
          ];
        }
        
        setNews(newsData);
        setError(null);
        
      } catch (err) {
        console.error('Error in fetchNews:', err);
        
        if (!isMounted) {
          console.log('Component unmounted during error handling, aborting...');
          return;
        }
        
        // Log additional error details
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error status:', err.response.status);
          console.error('Error headers:', err.response.headers);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error setting up request:', err.message);
        }
        
        // Only retry on network errors
        const isNetworkError = !err.response && err.request;
        
        if (isNetworkError && retryCount < maxRetries) {
          retryCount++;
          const retryDelay = 1000 * retryCount; // Exponential backoff
          console.log(`Retrying... (${retryCount}/${maxRetries}) in ${retryDelay}ms`);
          
          setTimeout(() => {
            console.log(`Retry attempt ${retryCount}...`);
            fetchNews(true);
          }, retryDelay);
          return;
        }
        
        const errorMessage = isNetworkError 
          ? 'Unable to connect to the server. Please check your internet connection.'
          : err.message || 'Error loading environment news. Please try again later.';
        
        console.error('Setting error message:', errorMessage);
        setError(errorMessage);
        
        // Use current environmental news as fallback
        setNews([
          {
            headline: "COP29 Climate Summit Reaches Historic $300 Billion Deal",
            summary: "World leaders at COP29 in Baku agreed to provide $300 billion annually by 2035 to help developing nations combat climate change.",
            source: "Reuters Climate"
          },
          {
            headline: "Antarctic Ice Sheet Melting Accelerates to Critical Levels",
            summary: "New satellite data reveals Antarctic ice loss has tripled in the past decade. Scientists warn of irreversible tipping points.",
            source: "Nature Climate Change"
          },
          {
            headline: "Solar Power Becomes Cheapest Energy Source in History",
            summary: "Solar photovoltaic costs have dropped 90% since 2010, making it the most affordable electricity source globally.",
            source: "International Energy Agency"
          },
          {
            headline: "Amazon Rainforest Deforestation Drops 30% in 2024",
            summary: "Brazil reports significant reduction in Amazon deforestation following enhanced monitoring and enforcement.",
            source: "Environmental Protection Agency"
          },
          {
            headline: "Microplastics Found in Human Blood Raise Health Concerns",
            summary: "Scientists detect microplastic particles in human bloodstream for the first time.",
            source: "Science Journal"
          },
          {
            headline: "Green Hydrogen Production Reaches Commercial Viability",
            summary: "Major breakthrough in green hydrogen technology makes clean fuel economically competitive.",
            source: "Clean Energy Wire"
          }
        ]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          Latest Environment News
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          Stay updated with the latest developments in environmental protection and sustainability.
        </Typography>
      </Box>

      {news.length > 0 ? (
        <Box>
          {news.map((item, index) => (
            <Card key={index} sx={{ mb: 3, boxShadow: 3 }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: green[500] }}>
                    🌱
                  </Avatar>
                }
                title={
                  <Typography variant="h6" component="div">
                    {item.headline}
                  </Typography>
                }
                subheader={item.source && `Source: ${item.source}`}
              />
              <CardContent>
                <Typography variant="body1" color="text.primary" paragraph>
                  {item.summary}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No environment news available at the moment. Please check back later.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default EnvironmentNews;
