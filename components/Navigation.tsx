
import React, { useState } from 'react';
import { ViewState } from '../types';
import { LayoutGrid, BookOpen, Clock, CalendarDays, CheckSquare, Compass, MessageCircle, Sparkles, BookHeart, Plane, HelpCircle, Calculator, Users, Bot, Heart, Settings, Search, X, Home } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const [showSearch, setShowSearch] = useState(false);

  // Expanded config for desktop sidebar
  const allNavItems = [
    { view: ViewState.DASHBOARD, label: 'Home', icon: LayoutGrid },
    { view: ViewState.QURAN, label: 'Quran', icon: BookOpen },
    { view: ViewState.PRAYER, label: 'Prayer', icon: Clock },
    { view: ViewState.TRACKER, label: 'Tracker', icon: CheckSquare },
    { view: ViewState.CALENDAR, label: 'Calendar', icon: CalendarDays },
    { view: ViewState.QIBLA, label: 'Qibla', icon: Compass },
    { view: ViewState.TASBEEH, label: 'Tasbeeh', icon: MessageCircle },
    { view: ViewState.NAMES, label: '99 Names', icon: Sparkles },
    { view: ViewState.DUA, label: 'Duas', icon: BookHeart },
    { view: ViewState.HAJJ, label: 'Hajj', icon: Plane },
    { view: ViewState.QUIZ, label: 'Quiz', icon: HelpCircle },
    { view: ViewState.ZAKAT, label: 'Zakat', icon: Calculator },
    { view: ViewState.EVENTS, label: 'Community', icon: Users },
    { view: ViewState.AI_ASSISTANT, label: 'AI Guide', icon: Bot },
  ];

  const handleFabClick = () => {
    if (currentView === ViewState.DASHBOARD) {
      setShowSearch(true);
    } else {
      setView(ViewState.DASHBOARD);
    }
  };

  return (
    <>
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-[280px] h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/50 dark:border-white/5 shadow-sm z-50 overflow-y-auto no-scrollbar">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => setView(ViewState.DASHBOARD)}>
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
              <div className="w-5 h-5 border-2 border-white/30 rounded-full"></div>
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight text-slate-800 dark:text-white block leading-tight">Nuswally</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase">Digital Hub</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 mt-2">Menu</p>
            {allNavItems.slice(0, 10).map((item) => (
              <button
                key={item.label}
                onClick={() => setView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group ${currentView === item.view
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:shadow-sm'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${currentView === item.view ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'}`} strokeWidth={currentView === item.view ? 2.5 : 2} />
                {item.label}
                {currentView === item.view && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/20"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 space-y-2">
          <button
            onClick={() => setView(ViewState.DONATE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${currentView === ViewState.DONATE ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'}`}
          >
            <Heart className="w-5 h-5 text-rose-400" strokeWidth={2} />
            Donate
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200"
          >
            <Settings className="w-5 h-5" strokeWidth={2} />
            Settings
          </button>
        </div>
      </aside>

      {/* Mobile Floating Action Button (FAB) - Search (Right) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={handleFabClick}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 ${currentView === ViewState.DASHBOARD
            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-200'
            : 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-black/20 hover:bg-emerald-700'
            }`}
        >
          {currentView === ViewState.DASHBOARD ? (
            <Search className="w-6 h-6" strokeWidth={2.5} />
          ) : (
            <Home className="w-6 h-6 fill-current" />
          )}
        </button>
      </div>

      {/* Mobile Floating Action Button (FAB) - Tasbeeh Counter (Left) */}
      {currentView !== ViewState.TASBEEH && (
        <div className="md:hidden fixed bottom-6 left-6 z-50">
          <button
            onClick={() => setView(ViewState.TASBEEH)}
            className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shadow-xl shadow-emerald-100 dark:shadow-black/20 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all duration-300 active:scale-95"
          >
            <MessageCircle className="w-7 h-7 fill-emerald-100 dark:fill-emerald-900/30" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col p-6">
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setShowSearch(false)}
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Search Nuswally</h2>
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                autoFocus
                type="text"
                placeholder="Search for apps, surahs, or duas..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Quick Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {['Surah Yaseen', 'Prayer Times', 'Qibla Direction', 'Tasbeeh Counter', 'Zakat'].map(tag => (
                  <button
                    key={tag}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
