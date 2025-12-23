import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
// import { NextPrayerCard } from './NextPrayerCard';
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update second for clock
    return () => clearInterval(timer);
  }, []);

  // App Configuration
  const apps = [
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
  ];

  const handleAppClick = (id: string | ViewState) => {
    if (id === 'SETTINGS' || id === 'INFO') return;
    setView(id as ViewState);
  };

  // Placeholder for nextPrayer and TimeRemaining, as they are not defined in the original code
  // You would typically fetch or calculate these values.
  const nextPrayer = { name: "Fajr", time: "05:00 AM" };
  const TimeRemaining = "02:30:00";

  return (
    <div className="flex flex-col md:flex-row h-full animate-in fade-in duration-500 overflow-hidden">

      {/* --- Side Dock (Launcher) --- */}
      <div className="w-full md:w-24 lg:w-28 flex-shrink-0 md:h-full overflow-x-auto md:overflow-y-auto no-scrollbar md:border-r border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-3 md:py-6 flex md:flex-col items-center gap-3 md:gap-4 z-20">
        {apps.map((app) => (
          <button
            key={app.title}
            onClick={() => handleAppClick(app.id)}
            className="group relative flex flex-col items-center justify-center flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-emerald-50 dark:hover:shadow-emerald-900/20 hover:-translate-y-1"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
              <app.icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 md:mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate w-full text-center px-1">
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* --- Main Widget Area --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* Header / Location (Compact) */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Salam, Believer</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm border border-emerald-50 dark:border-emerald-900/30">
              <MapPin className="w-3 h-3" /> Jakarta, ID
            </span>
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md flex items-center justify-center text-slate-600 dark:text-yellow-400 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Combined Hero Section Grid (Bento Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">

          {/* Main Hero Widget (Time | Gregorian | Hijri) */}
          <div className="col-span-2 md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-2xl md:rounded-[2rem] p-4 md:p-8 text-white shadow-xl shadow-blue-200/50 dark:shadow-blue-900/20 relative overflow-hidden group cursor-pointer flex flex-col justify-center min-h-[140px] md:min-h-[180px]" onClick={() => setView(ViewState.CALENDAR)}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3"></div>

            <div className="relative z-10 flex flex-row justify-between items-center h-full gap-2 md:gap-4 text-center">

              {/* COL 1: Time */}
              <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left border-r border-white/10 pr-2 md:pr-6">
                <span className="text-blue-200 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-0.5">Now</span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-none">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h2>
                <p className="text-[9px] md:text-sm text-blue-100 mt-1 hidden md:block">Time in Jakarta</p>
              </div>

              {/* COL 2: Gregorian */}
              <div className="flex-1 flex flex-col justify-center items-center border-r border-white/10 px-2 md:px-6">
                <span className="text-blue-200 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-0.5">Today</span>
                <div className="text-xl md:text-4xl font-bold leading-none mb-0.5">
                  {currentTime.getDate()}
                </div>
                <div className="text-[10px] md:text-lg font-medium text-blue-100 uppercase tracking-wide">
                  {currentTime.toLocaleDateString([], { month: 'short' })}
                </div>
                <span className="text-[9px] md:text-sm text-blue-200 opacity-80">
                  {currentTime.toLocaleDateString([], { weekday: 'short' })}
                </span>
              </div>

              {/* COL 3: Hijri */}
              <div className="flex-1 flex flex-col justify-center items-center md:items-end text-center md:text-right pl-2 md:pl-6">
                <span className="text-blue-200 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-0.5">Hijri</span>
                <div className="text-xl md:text-4xl font-bold leading-none mb-0.5">15</div>
                <div className="text-[10px] md:text-lg font-medium text-blue-100 uppercase tracking-wide">Ramadan</div>
                <span className="text-[9px] md:text-sm text-blue-200 opacity-80">1445 AH</span>
              </div>

            </div>
          </div>

          {/* Next Prayer - Green Card (Side Widget) - Half Width on Mobile */}
          <div className="col-span-1 md:col-span-1 bg-emerald-500 dark:bg-emerald-600 rounded-2xl md:rounded-[2rem] p-2 md:p-6 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 text-white flex flex-col justify-center relative overflow-hidden cursor-pointer group hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors min-h-[60px] md:min-h-[180px]" onClick={() => setView(ViewState.PRAYER)}>
            <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-br from-transparent to-black/10"></div>

            <div className="flex flex-row md:flex-col justify-start md:justify-between items-center md:items-start w-full relative z-10 gap-2 md:gap-0 h-full">
              <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>

              <div className="text-left md:text-left flex-1 md:h-full md:flex md:flex-col md:justify-end md:mt-2 min-w-0">
                <p className="text-[9px] md:text-xs text-emerald-100 font-bold uppercase tracking-wider mb-0 md:mb-1 leading-none">Next</p>
                <h3 className="text-lg md:text-3xl lg:text-4xl font-bold tracking-tight leading-none truncate">Asr</h3>
                <p className="text-emerald-100 font-medium opacity-90 text-[9px] md:text-base whitespace-normal leading-none mt-0.5">In 2h 30m</p>
              </div>
            </div>
          </div>

          {/* Library Section (Inside Grid for Bento Layout) - Half Width on Mobile */}
          <div className="col-span-1 md:col-span-1">
            <Library />
          </div>

        </div>

        {/* Quick Stats Row (Compact) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Qibla */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group" onClick={() => setView(ViewState.QIBLA)}>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Qibla</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">294° NW</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:rotate-45 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>

          {/* Quran Resume */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group" onClick={() => setView(ViewState.QURAN)}>
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Resume</p>
              <p className="font-bold text-slate-700 dark:text-slate-200 truncate">Al-Kahf</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          {/* Tracker */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group" onClick={() => setView(ViewState.TRACKER)}>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Streak</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">5 Days</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-fuchsia-50 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>

          {/* Daily Name */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 rounded-2xl p-4 shadow-md text-white flex items-center justify-between cursor-pointer hover:brightness-110 transition-all" onClick={() => setView(ViewState.NAMES)}>
            <div>
              <p className="text-[10px] text-purple-200 font-bold uppercase">Name</p>
              <p className="font-bold text-white">Ar-Rahman</p>
            </div>
            <Sparkles className="w-4 h-4 text-purple-200" />
          </div>

        </div>

        {/* Unified Quran Widget - Split Design */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ minHeight: '240px' }}>
          {/* Single Diagonal Gradient - Corner to Corner */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 via-40% via-cyan-400 via-60% via-rose-500 to-purple-600 dark:from-emerald-600 dark:via-teal-600 dark:via-40% dark:via-cyan-500 dark:via-60% dark:via-rose-600 dark:to-purple-700"></div>

          {/* Overlay Glows */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }}></div>

          {/* Content Grid */}
          <div className="relative z-10 grid grid-cols-2 h-full">
            {/* Left Button - READ */}
            <button
              onClick={() => setView(ViewState.QURAN)}
              className="p-6 flex flex-col justify-between group hover:scale-105 transition-transform duration-300 origin-left"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Read</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Quran</h3>
                <p className="text-white/90 text-sm mb-3">Arabic with translations</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-1 bg-white/40 rounded-full"></div>
                <div className="w-14 h-1 bg-white/70 rounded-full"></div>
                <div className="w-8 h-1 bg-white/40 rounded-full"></div>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-white/90 text-sm font-semibold group-hover:gap-3 transition-all">
                <span>Start Reading</span>
                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
            </button>

            {/* Right Button - LISTEN */}
            <button
              onClick={() => setView(ViewState.QURAN_AUDIO)}
              className="p-6 flex flex-col justify-between group hover:scale-105 transition-transform duration-300 origin-right"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Headphones className="w-6 h-6 text-white" />
                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Listen</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Audio</h3>
                <p className="text-white/90 text-sm mb-3">Multi-language</p>
              </div>

              <div className="flex items-center gap-1 mb-2">
                <div className="w-1 h-5 bg-white/60 rounded-full animate-pulse"></div>
                <div className="w-1 h-6 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-4 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-6 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1 h-5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>

              <div className="mt-2 inline-flex items-center gap-2 text-white/90 text-sm font-semibold group-hover:gap-3 transition-all">
                <span>Start Listening</span>
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="white" />
              </div>
            </button>
          </div>

          {/* Center Divider Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 transform -translate-x-1/2 pointer-events-none"></div>
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

      </div>
    </div>
  );
};
