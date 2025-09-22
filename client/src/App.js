import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminPanel from './pages/AdminPanel';
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
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes with MainLayout */}
            <Route element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route path="/welcome" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/news" element={<News />} />
              <Route path="/memes" element={<MemePage />} />
              <Route path="/quizzes" element={<QuizGames />} />
              <Route path="/waste-management" element={<WasteManagement />} />
              <Route path="/researches" element={<Researches />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            
            {/* Catch all - replace with 404 component if you want */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
