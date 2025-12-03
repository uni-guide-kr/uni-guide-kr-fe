import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { CourseExplorerPage } from './pages/CourseExplorerPage';
import { CurriculumBuilderPage } from './pages/CurriculumBuilderPage';

type Page = 'home' | 'explore' | 'curriculum';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'explore':
        return <CourseExplorerPage />;
      case 'curriculum':
        return <CurriculumBuilderPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <main>{renderPage()}</main>
      </div>
    </AppProvider>
  );
}
