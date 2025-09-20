import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  const location = useLocation();

  const sidebarLinks = [
    { name: 'News', path: '/news' },
    { name: 'Quiz and Flashcards', path: '/quizzes' },
    { name: 'Waste Management', path: '/waste-management' },
    { name: 'Researches', path: '/researches' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <aside className="w-64 bg-white shadow-md fixed left-0 h-full overflow-y-auto">
          <nav className="p-4">
            <div className="mb-6 px-2">
              <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
            </div>
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                      location.pathname === link.path 
                        ? 'bg-green-100 text-green-800 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 ml-64 p-6 bg-gray-50 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;