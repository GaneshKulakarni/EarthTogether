import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, RotateCcw, Brain, GamepadIcon } from 'lucide-react';

const QuizGames = () => {
  const [mode, setMode] = useState('menu'); // 'menu', 'quiz', 'flashcards'
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizSource, setQuizSource] = useState('loading');
  const [cardSource, setCardSource] = useState('loading');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quizzes
        try {
          const quizRes = await api.get('/api/quizzes');
          const payload = quizRes.data;
          if (payload?.items) {
            setQuizzes(payload.items);
            setQuizSource(payload.source || 'gemini');
          } else {
            setQuizzes(Array.isArray(payload) ? payload : []);
            setQuizSource('fallback');
          }
        } catch (err) {
          console.log('Using fallback quiz data');
          setQuizzes([
            {
              question: "What percentage of plastic waste is recycled globally?",
              options: ["9%", "25%", "50%", "75%"],
              correctAnswer: "9%"
            },
            {
              question: "Which renewable energy source is the fastest growing?",
              options: ["Solar", "Wind", "Hydro", "Geothermal"],
              correctAnswer: "Solar"
            }
          ]);
          setQuizSource('fallback');
        }
        
        // Fetch flashcards
        try {
          const flashRes = await api.get('/api/quizzes/flashcards');
          const payload = flashRes.data;
          if (payload?.items) {
            setFlashcards(payload.items);
            setCardSource(payload.source || 'gemini');
          } else {
            setFlashcards(Array.isArray(payload) ? payload : []);
            setCardSource('fallback');
          }
        } catch (err) {
          console.log('Using fallback flashcard data');
          setFlashcards([
            {
              question: "What is carbon footprint?",
              answer: "The total amount of greenhouse gases produced directly and indirectly by human activities, measured in CO2 equivalents."
            },
            {
              question: "What is biodegradable waste?",
              answer: "Organic waste that can be broken down naturally by microorganisms into harmless substances."
            }
          ]);
          setCardSource('fallback');
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load content.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const startQuiz = () => {
    setMode('quiz');
    setShowResult(false);
    setScore(0);
    setCurrentIndex(0);
    setSelectedAnswer('');
  };

  const startFlashcards = () => {
    setMode('flashcards');
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const handleAnswerChange = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === quizzes[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (mode === 'quiz') {
      setShowResult(false);
      setSelectedAnswer('');
      if (currentIndex < quizzes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setMode('menu');
      }
    } else {
      setShowAnswer(false);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">🎮 Eco-Learning Hub</h1>
        <p className="text-gray-600 text-sm sm:text-base px-2">
          Test your knowledge and learn with interactive quizzes and flashcards!
        </p>
        <div className="mt-3 text-xs sm:text-sm text-gray-500">
          Quizzes: {quizSource === 'gemini' ? 'AI generated via Gemini' : 'Fallback set'} ·
          Flashcards: {cardSource === 'gemini' ? 'AI generated via Gemini' : 'Fallback set'}
        </div>
      </div>

      {mode === 'menu' && (
        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-8 text-center hover:shadow-lg transition-shadow">
            <GamepadIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Eco-Quiz</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6">Test your environmental knowledge with interactive quizzes</p>
            <button
              onClick={startQuiz}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Start Quiz
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-8 text-center hover:shadow-lg transition-shadow">
            <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Flashcards</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6">Learn eco-facts with interactive flashcards</p>
            <button
              onClick={startFlashcards}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Study Cards
            </button>
          </div>
        </div>
      )}

      {mode === 'quiz' && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Question {currentIndex + 1} of {quizzes.length}</span>
              <button
                onClick={() => setMode('menu')}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">{quizzes[currentIndex]?.question}</h3>
            
            <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
              {quizzes[currentIndex]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(option)}
                  disabled={showResult}
                  className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-colors text-sm sm:text-base ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {!showResult && (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Submit Answer
              </button>
            )}

            {showResult && (
              <div className="mt-5 sm:mt-6">
                {selectedAnswer === quizzes[currentIndex]?.correctAnswer ? (
                  <div className="flex items-center text-green-600 mb-4">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base">Correct! +10 Eco-Points</span>
                  </div>
                ) : (
                  <div className="text-red-600 mb-4">
                    <div className="flex items-center mb-2">
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">Incorrect</span>
                    </div>
                    <p className="text-xs sm:text-sm">Correct answer: {quizzes[currentIndex]?.correctAnswer}</p>
                  </div>
                )}
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  {currentIndex < quizzes.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'flashcards' && (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm text-gray-600">Card {currentIndex + 1} of {flashcards.length}</span>
            <button
              onClick={() => setMode('menu')}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              ✕
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-8 min-h-60 sm:min-h-64 flex flex-col justify-center">
            <div className="text-center">
              {!showAnswer ? (
                <>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-5 sm:mb-6">{flashcards[currentIndex]?.question}</h3>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    Show Answer
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">{flashcards[currentIndex]?.question}</h3>
                  <div className="bg-green-50 p-4 sm:p-6 rounded-lg mb-5 sm:mb-6">
                    <p className="text-gray-900 text-sm sm:text-base">{flashcards[currentIndex]?.answer}</p>
                  </div>
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Flip Back
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between mt-4 sm:mt-6 gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1 sm:flex-initial bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 sm:flex-initial bg-green-500 hover:bg-green-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Next Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGames;