import React from 'react';
import { GraduationCap, Search, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'explore' | 'curriculum';
  onNavigate: (page: 'home' | 'explore' | 'curriculum') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl">UniGuide</span>
          </button>

          <nav className="flex gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              홈
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                currentPage === 'explore'
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              과목탐색
            </button>
            <button
              onClick={() => onNavigate('curriculum')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                currentPage === 'curriculum'
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              커리큘럼
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
