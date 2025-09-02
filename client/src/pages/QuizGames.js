import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Button, Card, CardContent, CircularProgress, Grid, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, LinearProgress } from '@mui/material';
import { styled } from '@mui/system';
import { CheckCircle, XCircle } from 'lucide-react';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const QuizGames = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        };
        // Assuming a backend endpoint for quizzes: /api/quizzes
        const res = await axios.get('/api/quizzes', config);
        setQuizzes(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch quizzes. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const startQuiz = () => {
    setQuizStarted(true);
    setShowResult(false);
    setScore(0);
    setCurrentQuizIndex(0);
    setSelectedAnswer('');
  };

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === quizzes[currentQuizIndex].correctAnswer) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer('');
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      // Quiz finished, handle completion (e.g., send score to backend)
      console.log('Quiz finished! Score:', score);
      // Optionally, send score to backend
      // axios.post('/api/quizzes/submit-score', { score });
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

  if (quizzes.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          No Quizzes Available
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Check back later for new eco-quizzes and games!
        </Typography>
      </Container>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const progress = ((currentQuizIndex + (showResult ? 1 : 0)) / quizzes.length) * 100;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
        Eco-Quizzes & Games
      </Typography>
      <Typography variant="subtitle1" align="center" color="textSecondary" paragraph>
        Test your environmental knowledge and earn eco-points!
      </Typography>

      {!quizStarted ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h5" gutterBottom>Ready to test your knowledge?</Typography>
          <Button variant="contained" color="primary" size="large" onClick={startQuiz}>
            Start Quiz
          </Button>
        </Box>
      ) : (
        <>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 10, borderRadius: 5 }} />
          <StyledCard>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Question {currentQuizIndex + 1} of {quizzes.length}:
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentQuiz.question}
              </Typography>
              <FormControl component="fieldset">
                <FormLabel component="legend">Your Answer:</FormLabel>
                <RadioGroup
                  aria-label="quiz-options"
                  name="quiz-options"
                  value={selectedAnswer}
                  onChange={handleAnswerChange}
                >
                  {currentQuiz.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio disabled={showResult} />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {!showResult && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  sx={{ mt: 3 }}
                >
                  Submit Answer
                </Button>
              )}

              {showResult && (
                <Box sx={{ mt: 3 }}>
                  {selectedAnswer === currentQuiz.correctAnswer ? (
                    <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle style={{ marginRight: 8 }} /> Correct!
                    </Typography>
                  ) : (
                    <Typography variant="h6" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <XCircle style={{ marginRight: 8 }} /> Incorrect. The correct answer was: {currentQuiz.correctAnswer}
                    </Typography>
                  )}
                  <Button variant="outlined" onClick={handleNextQuestion} sx={{ mt: 2 }}>
                    {currentQuizIndex < quizzes.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </StyledCard>
        </>
      )}

      {quizStarted && currentQuizIndex === quizzes.length - 1 && showResult && (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Quiz Completed!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your Score: {score} out of {quizzes.length}
          </Typography>
          <Button variant="contained" color="secondary" onClick={startQuiz}>
            Retake Quiz
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default QuizGames;