
import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { PrayerDashboard } from './components/PrayerDashboard';
import { QuranReader } from './components/QuranReader';
import { Tasbeeh } from './components/Tasbeeh';
import { AiAssistant } from './components/AiAssistant';
import { CommunityEvents } from './components/CommunityEvents';
import { Donation } from './components/Donation';
import { QiblaFinder } from './components/QiblaFinder';
import { ZakatCalculator } from './components/ZakatCalculator';
import { NamesOfAllah } from './components/NamesOfAllah';
import { DuaCollection } from './components/DuaCollection';
import { HijriCalendar } from './components/HijriCalendar';
import { IslamicQuiz } from './components/IslamicQuiz';
import { IbadahTracker } from './components/IbadahTracker';
import { HajjGuide } from './components/HajjGuide';
import { QuranAudio } from './components/QuranAudio';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        // @ts-ignore - Dashboard props will be updated
        return <Dashboard setView={setCurrentView} toggleTheme={toggleTheme} isDarkMode={theme === 'dark'} />;
      case ViewState.PRAYER:
        return <PrayerDashboard />;
      case ViewState.QURAN:
        return <QuranReader />;
      case ViewState.QIBLA:
        return <QiblaFinder />;
      case ViewState.TASBEEH:
        return <Tasbeeh />;
      case ViewState.NAMES:
        return <NamesOfAllah />;
      case ViewState.DUA:
        return <DuaCollection />;
      case ViewState.CALENDAR:
        return <HijriCalendar />;
      case ViewState.QUIZ:
        return <IslamicQuiz />;
      case ViewState.TRACKER:
        return <IbadahTracker />;
      case ViewState.HAJJ:
        return <HajjGuide />;
      case ViewState.AI_ASSISTANT:
        return <AiAssistant />;
      case ViewState.ZAKAT:
        return <ZakatCalculator />;
      case ViewState.EVENTS:
        return <CommunityEvents />;
      case ViewState.DONATE:
        return <Donation />;
      case ViewState.QURAN_AUDIO:
        return <QuranAudio />;
      default:
        // @ts-ignore
        return <Dashboard setView={setCurrentView} toggleTheme={toggleTheme} isDarkMode={theme === 'dark'} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#F0FDF4] via-[#F5F3FF] to-[#ECFEFF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <Navigation currentView={currentView} setView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth no-scrollbar">
          <div className="max-w-[1600px] mx-auto min-h-full pb-24 md:pb-0">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;