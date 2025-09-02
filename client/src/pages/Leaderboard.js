import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Avatar, Box, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        };
        const res = await axios.get('/api/users/leaderboard', config);
        setLeaderboard(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch leaderboard. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <Container><Typography>Loading leaderboard...</Typography></Container>;
  }

  if (error) {
    return <Container><Typography color="error">{error}</Typography></Container>;
  }

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Global Eco-Leaderboard
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
          See who's making the biggest impact!
        </Typography>
        <List>
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <ListItem key={user._id} sx={{ borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6" sx={{ minWidth: '30px', textAlign: 'right', mr: 2, color: 'text.secondary' }}>
                    #{index + 1}
                  </Typography>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>{user.username.charAt(0).toUpperCase()}</Avatar>
                  <ListItemText
                    primary={<Typography variant="h6" sx={{ fontWeight: 'medium' }}>{user.username}</Typography>}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          Eco-Points:
                        </Typography>
                        <Typography variant="body1" color="primary.dark" sx={{ fontWeight: 'bold' }}>
                          {user.ecoPoints}
                        </Typography>
                      </Box>
                    }
                  />
                  {/* You can add more user details or badges here */}
                </Box>
              </ListItem>
            ))
          ) : (
            <Typography variant="body1" align="center" color="textSecondary">
              No users found on the leaderboard yet.
            </Typography>
          )}
        </List>
      </StyledPaper>
    </Container>
  );
};

export default Leaderboard;