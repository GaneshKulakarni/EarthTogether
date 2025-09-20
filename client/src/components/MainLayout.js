import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const sidebarLinks = [
    { name: 'News', path: '/news' },
    { name: 'Quiz and Flashcards', path: '/quizzes' },
    { name: 'Waste Management', path: '/waste-management' },
    { name: 'Researches', path: '/researches' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        {isAuthenticated && (
          <aside className="w-64 bg-gray-100 p-4 border-r border-gray-200">
            <nav>
              <ul>
                {sidebarLinks.map((link) => (
                  <li key={link.name} className="mb-2">
                    <Link
                      to={link.path}
                      className={`block p-2 rounded-md ${location.pathname === link.path ? 'bg-green-200 text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;