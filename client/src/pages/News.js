import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import EnvironmentNews from '../components/EnvironmentNews';

const News = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box mb={4} textAlign="center">
          <Typography variant="h3" component="h1" gutterBottom>
            Environment & Sustainability News
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Stay informed about the latest developments in environmental protection, climate change, and sustainability efforts worldwide.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Refresh News
          </Button>
        </Box>
        <EnvironmentNews />
      </Container>
    </Box>
  );
};

export default News;