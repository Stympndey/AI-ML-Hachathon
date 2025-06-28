import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Upload, MapPin, MessageCircle, Home, Moon, Sun, BarChart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function Header() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Report' },
    { path: '/health-data', icon: BarChart, label: 'Health Data' },
    { path: '/facilities', icon: MapPin, label: 'Find Facilities' },
    { path: '/chat', icon: MessageCircle, label: 'AI Assistant' }
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">CareConnect</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'text-primary bg-blue-50 dark:bg-blue-900/50'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;