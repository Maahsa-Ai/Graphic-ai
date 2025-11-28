
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Archive } from './components/Archive';
import { ArtStyleLibrary } from './components/ArtStyleLibrary';
import { CharacterStudio } from './components/CharacterStudio';
import { Settings } from './components/Settings';
import { ResumeBuilder } from './components/ResumeBuilder';
import { FinanceTracker } from './components/FinanceTracker';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  
  // Global State for Theme and Language with Lazy Initialization
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  const [language, setLanguage] = useState<'fa' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_language') as 'fa' | 'en' || 'fa';
    }
    return 'fa';
  });

  // Persist Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Persist Language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('app_language', language);
  }, [language]);

  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return <Dashboard onChangeView={setCurrentView} />;
      case View.ARCHIVE:
        return <Archive />;
      case View.STYLES:
        return <ArtStyleLibrary />;
      case View.CHARACTERS:
        return <CharacterStudio />;
      case View.FINANCE:
        return <FinanceTracker />;
      case View.RESUME:
        return <ResumeBuilder />;
      case View.SETTINGS:
        return (
          <Settings 
            currentTheme={theme} 
            setTheme={setTheme} 
            currentLanguage={language} 
            setLanguage={setLanguage} 
          />
        );
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className={`flex h-screen bg-bgLight overflow-hidden font-sans transition-colors duration-300 ${theme}`}>
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        language={language}
      />
      
      <main className="flex-1 overflow-hidden relative bg-bgBase text-textMain transition-colors duration-300">
        {/* Top subtle gradient line for aesthetics */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-20"></div>
        
        <div className="h-full w-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      {/* Global style for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-border-light);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-light);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @media print {
            aside, .print\\:hidden { display: none !important; }
            main { overflow: visible !important; height: auto !important; }
            .custom-scrollbar { overflow: visible !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
};

export default App;