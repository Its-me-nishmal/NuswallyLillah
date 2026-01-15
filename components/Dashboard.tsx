import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ViewState } from '../types';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { AnimatedClock } from './AnimatedClock';
import { PrayerCardSkeleton } from './PrayerCardSkeleton';
import { PrayerCardError } from './PrayerCardError';
import { Library } from './Library';
import { Shortcuts } from './Shortcuts';
import {
  BookOpen, Clock, CalendarDays, CheckSquare, Compass, MessageCircle,
  Sparkles, BookHeart, Plane, HelpCircle, Calculator, Users, Bot,
  Heart, Settings, Info, MapPin, Search, Moon, Sun, Headphones, Play
} from 'lucide-react';

interface DashboardProps {
  setView: (view: ViewState) => void;
  toggleTheme?: () => void;
  isDarkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView, toggleTheme, isDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRead, setLastRead] = useState<{ surahName: string, ayahNumber: number } | null>(null);

  // Animated header cycling state
  const [headerState, setHeaderState] = useState<'salam' | 'time' | 'date' | 'hijri'>('salam');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update second for clock

    // Load Last Read
    const savedLastRead = localStorage.getItem('quran_last_read');
    if (savedLastRead) {
      setLastRead(JSON.parse(savedLastRead));
    }

    return () => clearInterval(timer);
  }, []);

  // Header cycling effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isInitialLoad && headerState === 'salam') {
      // Show "Salam Believer" for 4 seconds on initial load
      timeout = setTimeout(() => {
        setHeaderState('time');
        setIsInitialLoad(false);
      }, 4000);
    } else if (!isInitialLoad) {
      // Cycle through: time → date → hijri → time (5 seconds each)
      timeout = setTimeout(() => {
        if (headerState === 'time') {
          setHeaderState('date');
        } else if (headerState === 'date') {
          setHeaderState('hijri');
        } else if (headerState === 'hijri') {
          setHeaderState('time');
        }
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [headerState, isInitialLoad]);

  // App Configuration - Memoized for performance
  const apps = useMemo(() => [
    { id: ViewState.QURAN, title: "Quran", icon: BookOpen, color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400" },
    { id: ViewState.PRAYER, title: "Prayer", icon: Clock, color: "from-blue-400 to-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400" },
    { id: ViewState.TRACKER, title: "Tracker", icon: CheckSquare, color: "from-fuchsia-400 to-fuchsia-600", bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20", text: "text-fuchsia-700 dark:text-fuchsia-400" },
    { id: ViewState.CALENDAR, title: "Hijri", icon: CalendarDays, color: "from-indigo-400 to-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400" },
    { id: ViewState.QIBLA, title: "Qibla", icon: Compass, color: "from-teal-400 to-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400" },
    { id: ViewState.TASBEEH, title: "Tasbeeh", icon: MessageCircle, color: "from-lime-400 to-lime-600", bg: "bg-lime-50 dark:bg-lime-900/20", text: "text-lime-700 dark:text-lime-400" },
    { id: ViewState.NAMES, title: "99 Names", icon: Sparkles, color: "from-amber-400 to-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400" },
    { id: ViewState.DUA, title: "Duas", icon: BookHeart, color: "from-rose-400 to-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-400" },
    { id: ViewState.HAJJ, title: "Hajj", icon: Plane, color: "from-sky-400 to-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-400" },
    { id: ViewState.QUIZ, title: "Quiz", icon: HelpCircle, color: "from-violet-400 to-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-400" },
    { id: ViewState.ZAKAT, title: "Zakat", icon: Calculator, color: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-400" },
    { id: ViewState.EVENTS, title: "Events", icon: Users, color: "from-orange-400 to-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-400" },
    { id: ViewState.AI_ASSISTANT, title: "AI Guide", icon: Bot, color: "from-purple-400 to-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400" },
    { id: ViewState.DONATE, title: "Sadqah", icon: Heart, color: "from-red-400 to-red-600", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400" },
    { id: ViewState.QURAN_AUDIO, title: "Audio", icon: Headphones, color: "from-pink-400 to-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-700 dark:text-pink-400" },
  ], []);

  const handleAppClick = useCallback((id: string | ViewState) => {
    if (id === 'SETTINGS' || id === 'INFO') return;
    setView(id as ViewState);
  }, [setView]);

  const { nextPrayer } = usePrayerTimes();
  // const TimeRemaining = "02:30:00"; // No longer needed as nextPrayer includes timeLeft

  return (
    <div className="flex flex-col md:flex-row h-full animate-in fade-in duration-500 overflow-hidden">

      {/* --- Side Dock (Launcher) --- */}
      <nav
        className="w-full md:w-20 lg:w-20 flex-shrink-0 md:h-full overflow-x-auto md:overflow-y-auto no-scrollbar md:border-r border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-2 md:py-3 flex md:flex-col items-center gap-2 md:gap-2 z-20"
        role="navigation"
        aria-label="Main application launcher"
      >
        {apps.map((app) => (
          <button
            key={app.title}
            onClick={() => handleAppClick(app.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleAppClick(app.id);
              }
            }}
            aria-label={`Open ${app.title}`}
            className="group relative flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all duration-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:shadow-emerald-50 dark:hover:shadow-emerald-900/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 dark:focus-visible:ring-emerald-400"
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
              <app.icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate w-full text-center px-0.5">
              {app.title}
            </span>
          </button>
        ))}
      </nav>


      {/* --- Main Widget Area --- */}
      <main className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2" role="main">

        {/* Animated Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 overflow-hidden">
            {/* Animated cycling text with smooth transitions */}
            <AnimatedClock headerState={headerState} currentTime={currentTime} />
          </div>

          <div className="flex items-center gap-2">
            <span
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm border border-emerald-50 dark:border-emerald-900/30"
              role="status"
              aria-label="Current location: Jakarta, Indonesia"
            >
              <MapPin className="w-2.5 h-2.5" aria-hidden="true" /> Jakarta, ID
            </span>
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="w-7 h-7 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md flex items-center justify-center text-slate-600 dark:text-yellow-400 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>
            )}
          </div>
        </div>

        {/* Combined Hero Section Grid (Bento Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-2">

          {/* Next Prayer - Green Card (Full Width on Mobile, Half on Desktop) */}
          {!nextPrayer ? (
            <PrayerCardSkeleton />
          ) : (
            <button
              onClick={() => setView(ViewState.PRAYER)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setView(ViewState.PRAYER);
                }
              }}
              aria-label={`View prayer times. Next prayer is ${nextPrayer.name} in ${nextPrayer.timeLeft}`}
              className="col-span-1 md:col-span-1 neumorphic-card p-3 md:p-4 flex flex-col justify-center relative overflow-hidden cursor-pointer group min-h-[90px] md:min-h-[130px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <div className="flex flex-row md:flex-row items-center justify-between w-full relative z-10 gap-2 h-full">
                <div className="text-left flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-none truncate text-slate-700 dark:text-slate-200">{nextPrayer.name}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium text-[10px] md:text-xs whitespace-normal leading-none mt-0.5">In {nextPrayer.timeLeft}</p>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
              </div>
            </button>
          )}

          {/* Library Section (Inside Grid for Bento Layout) - Half Width on Mobile */}
          <div className="col-span-1 md:col-span-1">
            <Library />
          </div>

        </div>

        {/* Quick Stats Row (Compact) */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">

          {/* Qibla */}
          <button
            onClick={() => setView(ViewState.QIBLA)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setView(ViewState.QIBLA);
              }
            }}
            aria-label="View Qibla direction. Currently 294 degrees Northwest"
            className="neumorphic-card p-3 md:p-4 flex items-center justify-between cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <div className="flex flex-col items-start">
              <p className="font-bold text-lg md:text-xl text-slate-700 dark:text-slate-200">294° NW</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">Qibla Direction</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:rotate-45 transition-transform">
              <Compass className="w-5 h-5" aria-hidden="true" />
            </div>
          </button>

          {/* Quran Resume */}
          <button
            className="neumorphic-card p-3 md:p-4 flex items-center justify-between cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            onClick={() => {
              setView(ViewState.QURAN);
              setTimeout(() => {
                const event = new CustomEvent('openQuranLastRead');
                window.dispatchEvent(event);
              }, 100);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setView(ViewState.QURAN);
                setTimeout(() => {
                  const event = new CustomEvent('openQuranLastRead');
                  window.dispatchEvent(event);
                }, 100);
              }
            }}
            aria-label={lastRead ? `Resume reading ${lastRead.surahName} at Ayah ${lastRead.ayahNumber}` : "Start reading Quran"}
          >
            <div className="overflow-hidden flex-1 min-w-0 pr-2 text-left flex flex-col items-start">
              <p className="font-bold text-lg md:text-xl text-slate-700 dark:text-slate-200 truncate">
                {lastRead ? lastRead.surahName : "Start Reading"}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs truncate">
                {lastRead ? `Resume Ayah ${lastRead.ayahNumber}` : "Open Quran"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
          </button>

          {/* Tracker */}
          <button
            onClick={() => setView(ViewState.TRACKER)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setView(ViewState.TRACKER);
              }
            }}
            aria-label="View tracker. Current streak is 5 days"
            className="neumorphic-card p-3 md:p-4 flex items-center justify-between cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <div className="flex flex-col items-start">
              <p className="font-bold text-lg md:text-xl text-slate-700 dark:text-slate-200">5 Days</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">Current Streak</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckSquare className="w-5 h-5" aria-hidden="true" />
            </div>
          </button>

          {/* Daily Name */}
          <button
            onClick={() => setView(ViewState.NAMES)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setView(ViewState.NAMES);
              }
            }}
            aria-label="View 99 names of Allah. Today's name is Ar-Rahman"
            className="neumorphic-card p-3 md:p-4 flex items-center justify-between cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <div className="flex flex-col items-start">
              <p className="font-bold text-lg md:text-xl text-slate-700 dark:text-slate-200">Ar-Rahman</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">The Most Gracious</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
          </button>

        </div>

        {/* Unified Quran Widget - Split Design */}
        <div className="neumorphic-card relative overflow-hidden" style={{ minHeight: '110px' }}>

          {/* Content Grid */}
          <div className="relative z-10 grid grid-cols-2 h-full divide-x divide-slate-100 dark:divide-slate-700/50">
            {/* Read Button */}
            <button
              onClick={() => setView(ViewState.QURAN)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setView(ViewState.QURAN);
                }
              }}
              aria-label="Read Quran with Arabic text and translations"
              className="p-3 md:p-4 flex flex-col justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
            >
              <div className="text-left w-full flex flex-col items-start">
                <h3 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-200 mb-0.5">Quran</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">Arabic + Translation</p>
              </div>

              <div className="mt-2 w-full flex justify-start">
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] md:text-xs font-semibold group-hover:gap-2.5 transition-all">
                  <span>Start Reading</span>
                  <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </button>

            {/* Listen Button */}
            <button
              onClick={() => setView((ViewState as any).QURAN_AUDIO || 'QURAN_AUDIO')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setView((ViewState as any).QURAN_AUDIO || 'QURAN_AUDIO');
                }
              }}
              aria-label="Listen to Quran recitations"
              className="p-3 md:p-4 flex flex-col justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
            >
              <div className="text-right w-full flex flex-col items-end">
                <h3 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-200 mb-0.5">Audio</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs">Listen to Recitations</p>
              </div>

              <div className="mt-2 w-full flex justify-end">
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] md:text-xs font-semibold group-hover:gap-2.5 transition-all flex-row-reverse">
                  <span>Play Now</span>
                  <Headphones className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Shortcuts Section */}
        <Shortcuts onNavigate={(type, path) => {
          // Open the Library component (it will open in fullscreen overlay)
          // We'll trigger a custom event that the Library component can listen to
          const event = new CustomEvent('openLibraryPdf', {
            detail: { path }
          });
          window.dispatchEvent(event);
        }} />

      </main>
    </div >
  );
};
