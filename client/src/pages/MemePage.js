import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, IconButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { ThumbsUp, MessageSquare } from 'lucide-react';

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

const MemePage = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        };
        // Assuming a backend endpoint for memes: /api/memes
        const res = await axios.get('/api/memes', config);
        setMemes(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch memes. Please try again later.');
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  const handleLike = async (memeId) => {
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      // Assuming a like endpoint for memes: /api/memes/like/:id
      await axios.post(`/api/memes/like/${memeId}`, {}, config);
      setMemes(prevMemes =>
        prevMemes.map(meme =>
          meme._id === memeId ? { ...meme, likes: meme.likes + 1 } : meme
        )
      );
    } catch (err) {
      console.error(err);
      // Handle error (e.g., show a toast notification)
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return <Container><Typography color="error">{error}</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        Eco-Memes
      </Typography>
      <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
        A little humor for a greener planet!
      </Typography>
      <Grid container spacing={4}>
        {memes.length > 0 ? (
          memes.map((meme) => (
            <Grid item key={meme._id} xs={12} sm={6} md={4}>
              <StyledCard>
                <CardMedia
                  component="img"
                  height="250"
                  image={meme.imageUrl || 'https://via.placeholder.com/300x250?text=No+Meme+Image'}
                  alt={meme.title}
                  sx={{ objectFit: 'contain', backgroundColor: '#f0f0f0' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {meme.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {meme.description}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1, borderTop: '1px solid #eee' }}>
                  <IconButton aria-label="like" onClick={() => handleLike(meme._id)}>
                    <ThumbsUp size={20} />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>{meme.likes}</Typography>
                  </IconButton>
                  <IconButton aria-label="comments">
                    <MessageSquare size={20} />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>{meme.comments}</Typography>
                  </IconButton>
                </Box>
              </StyledCard>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" align="center" color="textSecondary">
              No memes available at the moment. Check back later!
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default MemePage;