import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const sidebarLinks = [
    { name: 'News', path: '/news' },
    { name: 'Research', path: '/researches' },
    { name: 'Quiz & Flashcards', path: '/quizzes' },
    { name: 'Waste Management', path: '/waste-management' },
    { name: 'Memes', path: '/memes' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  // Only show admin panel for admin users
  if (user?.role === 'admin') {
    sidebarLinks.push({ name: 'Admin Panel', path: '/admin' });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        {isAuthenticated && (
          <aside className="w-64 bg-white/95 backdrop-blur-md shadow-xl fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto z-10 border-r border-gray-100">
            <nav className="p-6">
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Navigation</h2>
              </div>
              <ul className="space-y-2">
                {sidebarLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        location.pathname === link.path
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:transform hover:scale-105'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-3 transition-all ${
                        location.pathname === link.path ? 'bg-white' : 'bg-gray-400 group-hover:bg-green-500'
                      }`}></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
        <main
          className={`flex-1 bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30 min-h-[calc(100vh-4rem)] mt-16 ${
            isAuthenticated ? 'ml-64' : ''
          }`}
        >
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
