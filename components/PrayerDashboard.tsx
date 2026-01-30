
import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Clock, Bell, BellOff, Edit2, Sunrise, Moon, Sun, Cloud, CloudMoon, CloudSun } from 'lucide-react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { LocationPicker } from './LocationPicker';

export const PrayerDashboard: React.FC = () => {
  const {
    loading,
    prayerData,
    nextPrayer,
    currentTime,
    usingFallback,
    locationInfo,
    FALLBACK_TIMES
  } = usePrayerTimes();

  // Alarm State
  const [alarms, setAlarms] = useState<Record<string, boolean>>({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Refs to hold latest state
  const alarmsRef = useRef<Record<string, boolean>>({});
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    alarmsRef.current = alarms;
    localStorage.setItem('prayer_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const savedAlarms = localStorage.getItem('prayer_alarms');
    if (savedAlarms) setAlarms(JSON.parse(savedAlarms));
  }, []);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(currentTime);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  useEffect(() => {
    const checkAlarms = () => {
      if (!prayerData || (typeof Notification !== 'undefined' && Notification.permission !== 'granted')) return;
      const timings = prayerData.timings;
      const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const todayStr = currentTime.toDateString();

      prayers.forEach(prayer => {
        if (!alarmsRef.current[prayer]) return;

        const pTime = parseTime(timings[prayer]);
        const diffMs = pTime.getTime() - currentTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const todayStr = currentTime.toDateString();

        // 1. 10 Minutes Before
        const beforeId = `${todayStr}-${prayer}-10min`;
        if (diffMinutes === 10 && !notifiedRef.current.has(beforeId)) {
          sendNotification(`10 Minutes to ${prayer}`, `It is almost time for ${prayer}.`, prayer);
          notifiedRef.current.add(beforeId);
        }

        // 2. Exact Prayer Time
        const startId = `${todayStr}-${prayer}-start`;
        if (diffMinutes === 0 && !notifiedRef.current.has(startId)) {
          sendNotification(`${prayer} Time Now`, `The time for ${prayer} has started.`, prayer);
          notifiedRef.current.add(startId);
        }

        // 3. 30 Minutes After (Transition to Next)
        const transitionId = `${todayStr}-${prayer}-30min`;
        if (diffMinutes === -30 && !notifiedRef.current.has(transitionId)) {
          // Find next prayer to show details
          const nextIdx = (prayers.indexOf(prayer) + 1) % prayers.length;
          const nextP = prayers[nextIdx];
          const nextTime = timings[nextP];
          sendNotification(`Next: ${nextP}`, `${prayer} time has passed. Next prayer is ${nextP} at ${nextTime}.`, nextP);
          notifiedRef.current.add(transitionId);
        }
      });
    };

    const sendNotification = (title: string, body: string, prayer: string) => {
      if (typeof Notification === 'undefined') return;

      const options: any = {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3658/3658959.png',
        tag: 'prayer-status', // Sticky behavior: replaces previous notification with same tag
        renotify: true, // Vibrate/alert even if replaced
      };

      try {
        new Notification(title, options);
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        audio.play().catch(() => { });
      } catch (err) {
        console.warn("Failed to send notification:", err);
      }
    };
    checkAlarms();
  }, [currentTime, prayerData]);

  const toggleAlarm = async (prayerName: string) => {
    if (typeof Notification === 'undefined') return;
    let currentPermission = Notification.permission;
    if (currentPermission !== 'granted') {
      currentPermission = await Notification.requestPermission();
    }
    if (currentPermission === 'granted') {
      setAlarms(prev => ({ ...prev, [prayerName]: !prev[prayerName] }));
    } else {
      alert("Please enable notifications to allow prayer alerts.");
    }
  };

  const getPrayerIcon = (name: string) => {
    const sizeClasses = "w-4 h-4";
    switch (name) {
      case 'Fajr': return <Sunrise className={sizeClasses} />;
      case 'Sunrise': return <Sun className={`${sizeClasses} text-amber-500`} />;
      case 'Dhuhr': return <Sun className={`${sizeClasses} text-yellow-500`} />;
      case 'Asr': return <CloudSun className={`${sizeClasses} text-orange-400`} />;
      case 'Maghrib': return <CloudMoon className={`${sizeClasses} text-indigo-400`} />;
      case 'Isha': return <Moon className={`${sizeClasses} text-slate-400`} />;
      default: return <Clock className={sizeClasses} />;
    }
  };

  if (loading) return (
    <div className="w-full h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full bg-white/5 dark:bg-slate-900/10 rounded-[2rem] border border-white/10 shadow-lg animate-pulse"></div>
    </div>
  );

  const timings = prayerData?.timings || FALLBACK_TIMES;

  return (
    <div className="relative w-full h-[85vh] overflow-hidden flex flex-col p-2 md:p-6 animate-in fade-in duration-700 select-none font-sans text-slate-800 dark:text-slate-200">

      {/* Subtle overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-full gap-2 md:gap-8 max-w-7xl mx-auto w-full">

        {/* Row 1: Location & Time (Compact) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-8 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl md:rounded-3xl p-3 md:px-8 md:py-4 shrink-0 shadow-sm">

          <button
            onClick={() => setShowLocationPicker(true)}
            className="group flex items-center gap-2 py-1 px-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 hover:border-emerald-500/50 transition-all"
          >
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] md:text-xs font-bold tracking-tight truncate max-w-[120px] md:max-w-none">
              {locationInfo?.name || "Detecting..."}
            </span>
            <Edit2 className="w-2.5 h-2.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </button>

          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-baseline gap-1 md:gap-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0]}
              </h1>
              <span className="text-sm md:text-lg font-black text-emerald-500 uppercase tracking-widest">
                {currentTime.toLocaleTimeString([], { hour12: true }).split(' ')[1]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <div className="w-1 h-1 rounded-full bg-emerald-500/30"></div>
            <span>{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>

        {/* Row 2: Spotlight (Next Prayer - Slim Card) */}
        {nextPrayer && (
          <div className="shrink-0">
            <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-emerald-500 to-teal-600 p-px shadow-lg shadow-emerald-500/10">
              <div className="relative bg-white/5 backdrop-blur-3xl rounded-[0.95rem] md:rounded-[1.95rem] p-3 md:p-6 flex items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                    {getPrayerIcon(nextPrayer.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black tracking-[0.3em] text-emerald-100/70 mb-0.5">Upcoming</span>
                    <h2 className="text-lg md:text-3xl font-black tracking-tighter leading-none">{nextPrayer.name} • {nextPrayer.time}</h2>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.3em] text-emerald-100/80">
                    {nextPrayer.status === 'active' ? 'Active Prayer' : 'Next Prayer'}
                  </span>
                  <div className="text-xl md:text-4xl font-black tracking-tighter tabular-nums leading-none">
                    {nextPrayer.timeLeft}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Grid (Compact Fixed Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 flex-1 pb-1">
          {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => {
            const isNext = nextPrayer?.name === name;
            const isAlarmSet = alarms[name] || false;
            const prayerTime = timings[name as keyof typeof timings]?.split(' ')[0];

            return (
              <div
                key={name}
                onClick={() => toggleAlarm(name)}
                className={`group/card relative flex flex-col justify-between p-3 md:p-6 rounded-[1.2rem] md:rounded-[1.8rem] transition-all duration-300 cursor-pointer border h-full max-h-[120px] md:max-h-none ${isNext
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/10'
                  : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/5 hover:bg-white/70 dark:hover:bg-slate-800/70'
                  }`}
              >
                <div className="w-full flex justify-between items-center">
                  <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] ${isNext ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500'}`}>
                    {name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAlarm(name);
                    }}
                    className={`p-1 rounded-lg transition-all ${isAlarmSet
                      ? 'text-white bg-emerald-500 shadow-sm'
                      : 'text-slate-300 dark:text-slate-700 hover:text-emerald-500'
                      }`}
                  >
                    {isAlarmSet ? <Bell className="w-3 h-3 fill-current" /> : <BellOff className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex flex-col gap-0.5 items-start mt-auto">
                  <div className={`p-1.5 rounded-lg mb-1 ${isNext ? 'bg-emerald-500/10' : 'bg-slate-100/50 dark:bg-slate-800/50'}`}>
                    {getPrayerIcon(name)}
                  </div>
                  <span className={`text-xl md:text-3xl font-black tracking-tighter leading-none ${isNext ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {prayerTime}
                  </span>
                  {isNext && (
                    <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                      Now
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showLocationPicker && (
        <LocationPicker
          showClose={!!localStorage.getItem('user_location')}
          onClose={() => setShowLocationPicker(false)}
          onSelect={(loc) => {
            localStorage.setItem('user_location', JSON.stringify(loc));
            setShowLocationPicker(false);
            window.dispatchEvent(new CustomEvent('locationChanged'));
          }}
        />
      )}
    </div>
  );
};
