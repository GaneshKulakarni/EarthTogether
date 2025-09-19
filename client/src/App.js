import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// import Navbar from './components/Navbar'; // Navbar is now part of MainLayout
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Feed from './pages/Feed';
import Challenges from './pages/Challenges';
import Profile from './pages/Profile';
import News from './pages/News';
import MemePage from './pages/MemePage';
import QuizGames from './pages/QuizGames';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import WasteManagement from './pages/WasteManagement';
import Researches from './pages/Researches';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';

function App() {

  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          {/* <Navbar /> */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<MainLayout />}>
              <Route path="/welcome" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/habits" element={
                <PrivateRoute>
                  <Habits />
                </PrivateRoute>
              } />
              <Route path="/feed" element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              } />
              <Route path="/challenges" element={
                <PrivateRoute>
                  <Challenges />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/leaderboard" element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              } />
              <Route path="/news" element={
                <PrivateRoute>
                  <News />
                </PrivateRoute>
              } />
              <Route path="/memes" element={
                <PrivateRoute>
                  <MemePage />
                </PrivateRoute>
              } />
              <Route path="/quizzes" element={
                <PrivateRoute>
                  <QuizGames />
                </PrivateRoute>
              } />
              <Route path="/waste-management" element={
                <PrivateRoute>
                  <WasteManagement />
                </PrivateRoute>
              } />
              <Route path="/researches" element={
                <PrivateRoute>
                  <Researches />
                </PrivateRoute>
              } />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
