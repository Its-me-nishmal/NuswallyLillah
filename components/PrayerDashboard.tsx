
import React, { useEffect, useState, useRef } from 'react';
import { PrayerApiResponse } from '../types';
import { MapPin, Clock, Calendar, Bell, BellOff } from 'lucide-react';

export const PrayerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [prayerData, setPrayerData] = useState<any | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: string, timeLeft: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [usingFallback, setUsingFallback] = useState(false);

  // Alarm State
  const [alarms, setAlarms] = useState<Record<string, boolean>>({});
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Refs to hold latest state for the interval (prevents stale closures and re-render loops)
  const prayerDataRef = useRef<any>(null);
  const alarmsRef = useRef<Record<string, boolean>>({});
  const notifiedRef = useRef<Set<string>>(new Set());

  // Update refs when state changes
  useEffect(() => {
    prayerDataRef.current = prayerData;
  }, [prayerData]);

  useEffect(() => {
    alarmsRef.current = alarms;
    localStorage.setItem('prayer_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Fallback times (Approximate standard times for India/General)
  const FALLBACK_TIMES = {
    Fajr: "05:15",
    Sunrise: "06:30",
    Dhuhr: "12:30",
    Asr: "16:15",
    Maghrib: "18:45",
    Isha: "20:15"
  };

  // Load alarms from local storage on mount
  useEffect(() => {
    const savedAlarms = localStorage.getItem('prayer_alarms');
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    }
  }, []);

  const parseTime = (timeStr: string) => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Fetch Logic - Runs ONCE on mount
  useEffect(() => {
    const fetchTimes = async (lat: number, lng: number) => {
      try {
        setLoading(true);
        const date = new Date();
        const timestamp = Math.floor(date.getTime() / 1000);
        const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`);
        const data = await response.json();

        if (data.code === 200) {
          setPrayerData(data.data);
          setUsingFallback(false);
        } else {
          throw new Error("API Error");
        }
      } catch (err) {
        console.warn("Using fallback prayer times due to API/Location error");
        setUsingFallback(true);
        setPrayerData({
          timings: FALLBACK_TIMES,
          date: {
            readable: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            hijri: { day: '12', month: { en: 'Rajab' }, year: '1445' } // Approximate fallback
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchTimes(position.coords.latitude, position.coords.longitude);
        },
        () => fetchTimes(28.6139, 77.2090) // Default: New Delhi, India
      );
    } else {
      fetchTimes(28.6139, 77.2090);
    }
  }, []); // Empty dependency array prevents infinite loop

  // Timer Logic - Runs independently
  useEffect(() => {
    const checkAlarms = (now: Date, data: any, currentAlarms: Record<string, boolean>) => {
      if (!data || Notification.permission !== 'granted') return;

      const timings = data.timings;
      const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const todayStr = now.toDateString();

      prayers.forEach(prayer => {
        if (!currentAlarms[prayer]) return;

        const pTime = parseTime(timings[prayer]);
        const diffMs = pTime.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Identifier for this specific notification instance
        const notificationId = `${todayStr}-${prayer}`;

        // Trigger 10 minutes before (approx window between 9.5 and 10.5 min)
        if (diffMinutes > 9 && diffMinutes <= 10 && !notifiedRef.current.has(notificationId)) {
          new Notification(`10 Minutes to ${prayer}`, {
            body: `It is almost time for ${prayer} prayer. Prepare yourself.`,
            icon: 'https://cdn-icons-png.flaticon.com/512/3658/3658959.png'
          });
          notifiedRef.current.add(notificationId);

          // Play soft sound
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
          audio.play().catch(() => { });
        }
      });
    };

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkAlarms(now, prayerDataRef.current, alarmsRef.current);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Recalculate next prayer when time or data changes
  useEffect(() => {
    if (prayerData) calculateNextPrayer();
  }, [currentTime, prayerData]);

  const calculateNextPrayer = () => {
    if (!prayerData) return;
    const timings = prayerData.timings;
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    let next = null;
    let minDiff = Infinity;
    // Helper to get time object for today
    const getTodayTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date(currentTime);
      d.setHours(h, m, 0, 0);
      return d;
    };

    for (const p of prayers) {
      const pTime = getTodayTime(timings[p]);
      const diff = pTime.getTime() - currentTime.getTime();
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        next = { name: p, time: timings[p], timeLeft: formatTimeLeft(diff) };
      }
    }

    if (!next) {
      // If no next prayer today, show Fajr tomorrow
      next = { name: 'Fajr', time: timings['Fajr'], timeLeft: 'Tomorrow' };
    }
    setNextPrayer(next);
  };

  const formatTimeLeft = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  };

  const toggleAlarm = async (prayerName: string) => {
    let currentPermission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

    if (currentPermission !== 'granted') {
      currentPermission = await requestPermission() || 'default';
    }

    if (currentPermission === 'granted') {
      setAlarms(prev => {
        const isActive = !prev[prayerName];
        if (isActive) {
          // Provide quick feedback sound
          const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3');
          audio.volume = 0.2;
          audio.play().catch(() => { });
        }
        return { ...prev, [prayerName]: isActive };
      });
    } else {
      alert("Please enable notifications in your browser settings to allow prayer alerts.");
    }
  };

  if (loading) return <div className="h-64 bg-white/50 dark:bg-slate-900/50 rounded-3xl animate-pulse"></div>;

  const timings = prayerData?.timings || FALLBACK_TIMES;

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-white/50 dark:border-white/5 h-full relative overflow-hidden flex flex-col justify-center group min-h-[500px] animate-in fade-in duration-500">

      {/* Soft Gradient Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none opacity-80"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50 dark:bg-blue-900/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none opacity-60"></div>

      {/* Header Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 mb-12">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {usingFallback ? "India (General)" : "Current Location"}
          </span>
        </div>

        <h2 className="text-6xl md:text-8xl font-bold text-slate-800 dark:text-white tracking-tighter">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h2>

        {/* Next Prayer Floating Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-3xl flex items-center justify-center gap-8 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-emerald-300 dark:hover:shadow-emerald-900/50 transition-all hover:scale-105">
          <div className="text-left">
            <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold mb-1">Next Prayer</p>
            <p className="font-bold text-2xl leading-none">{nextPrayer?.name}</p>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-emerald-200" />
              <span className="text-xs text-emerald-100">Time Left</span>
            </div>
            <span className="font-mono text-xl font-medium tracking-wider">{nextPrayer?.timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Prayer Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-6 gap-4">
        {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => {
          const isNext = nextPrayer?.name === name;
          const isAlarmSet = alarms[name] || false;

          return (
            <div
              key={name}
              onClick={() => toggleAlarm(name)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 border cursor-pointer group/card aspect-square ${isNext
                  ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20 scale-105 z-10'
                  : 'bg-white/40 dark:bg-slate-900/40 border-white/60 dark:border-white/5 hover:bg-white/80 dark:hover:bg-slate-800/80'
                }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAlarm(name);
                }}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors ${isAlarmSet ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400'
                  }`}
                title={isAlarmSet ? "Alarm Enabled (10m before)" : "Enable Notification"}
              >
                {isAlarmSet ? <Bell className="w-3.5 h-3.5 fill-current" /> : <BellOff className="w-3.5 h-3.5" />}
              </button>

              <span className={`text-xs font-bold uppercase mb-2 mt-2 ${isNext ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {name}
              </span>
              <span className={`text-2xl font-bold tracking-tight ${isNext ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {timings[name as keyof typeof timings]?.split(' ')[0]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  );
};
