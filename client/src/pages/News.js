import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button, Box } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        };
        // Assuming a backend endpoint for news articles: /api/news
        const res = await axios.get('/api/news', config);
        setArticles(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch news articles. Please try again later.');
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <Container><Typography>Loading news...</Typography></Container>;
  }

  if (error) {
    return <Container><Typography color="error">{error}</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        Eco-News & Editorial
      </Typography>
      <Grid container spacing={4}>
        {articles.length > 0 ? (
          articles.map((article) => (
            <Grid item key={article._id} xs={12} sm={6} md={4}>
              <StyledCard>
                <CardMedia
                  component="img"
                  height="180"
                  image={article.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image'}
                  alt={article.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {article.summary || article.content.substring(0, 150) + '...'}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button size="small" color="primary" href={article.url} target="_blank" rel="noopener noreferrer">
                    Read More
                  </Button>
                </Box>
              </StyledCard>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" align="center" color="textSecondary">
              No news articles available at the moment.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default News;