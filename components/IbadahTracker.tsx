
import React, { useState, useEffect } from 'react';
import { CheckSquare, Flame, Calendar, Trophy, Check, ChevronLeft, ChevronRight, Users, Clock, AlertCircle, BookOpen, Utensils, Moon, Plus, Trash2, Smile, Meh, Frown, Heart, PenLine, BarChart3 } from 'lucide-react';

// --- Types ---

type PrayerStatus = 'none' | 'late' | 'ontime' | 'jamaah';
type FastingType = 'none' | 'sunnah' | 'fard' | 'makeup';

interface DayLog {
    date: string; // YYYY-MM-DD
    prayers: Record<string, PrayerStatus>;
    quranPages: number;
    fasting: FastingType;
    habits: Record<string, boolean>;
    mood: string | null;
    notes: string;
}

interface TrackerConfig {
    customHabits: string[];
}

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const DEFAULT_HABITS = ['Morning Adhkar', 'Evening Adhkar', 'Charity', 'Istighfar', 'Salawat'];
const MOODS = [
    { id: 'grateful', icon: Heart, color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30', label: 'Grateful' },
    { id: 'happy', icon: Smile, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30', label: 'Happy' },
    { id: 'neutral', icon: Meh, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', label: 'Neutral' },
    { id: 'sad', icon: Frown, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30', label: 'Sad' },
];

export const IbadahTracker: React.FC = () => {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [logs, setLogs] = useState<Record<string, DayLog>>({});
    const [config, setConfig] = useState<TrackerConfig>({ customHabits: [] });
    const [streak, setStreak] = useState(0);
    const [newHabitInput, setNewHabitInput] = useState('');

    // --- Helpers ---
    // Robust local date key generation (YYYY-MM-DD) to avoid UTC timezone bugs
    const getDateKey = (d: Date) => {
        return d.toLocaleDateString('en-CA');
    };

    // --- Persistence & Init ---
    useEffect(() => {
        const savedLogs = localStorage.getItem('ibadah_logs_v2');
        const savedConfig = localStorage.getItem('ibadah_config');

        // Legacy Migration (from v1 boolean checkboxes)
        const legacyLogs = localStorage.getItem('ibadah_logs');

        if (savedLogs) {
            setLogs(JSON.parse(savedLogs));
        } else if (legacyLogs) {
            try {
                // Migrate old format to new
                const old = JSON.parse(legacyLogs);
                const migrated: Record<string, DayLog> = {};
                Object.keys(old).forEach(key => {
                    // Try to standardize keys during migration if possible
                    const oldDay = old[key];
                    const newPrayers: Record<string, PrayerStatus> = {};
                    PRAYERS.forEach(p => {
                        newPrayers[p] = oldDay.prayers?.[p] ? 'ontime' : 'none';
                    });
                    migrated[key] = {
                        date: key,
                        prayers: newPrayers,
                        quranPages: 0,
                        fasting: 'none',
                        habits: oldDay.habits || {},
                        mood: null,
                        notes: ''
                    };
                });
                setLogs(migrated);
            } catch (e) {
                console.error("Migration failed", e);
            }
        }

        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    // Save Effects
    useEffect(() => {
        localStorage.setItem('ibadah_logs_v2', JSON.stringify(logs));
        calculateStreak();
    }, [logs]);

    useEffect(() => {
        localStorage.setItem('ibadah_config', JSON.stringify(config));
    }, [config]);

    // --- Logic Helpers ---

    const dateKey = getDateKey(currentDate);

    const getLog = (date: string): DayLog => {
        return logs[date] || {
            date: date,
            prayers: PRAYERS.reduce((acc, p) => ({ ...acc, [p]: 'none' }), {}),
            quranPages: 0,
            fasting: 'none',
            habits: {},
            mood: null,
            notes: ''
        };
    };

    const currentLog = getLog(dateKey);
    const activeHabits = [...DEFAULT_HABITS, ...config.customHabits];

    const calculateStreak = () => {
        let s = 0;
        const today = new Date();
        let d = new Date(today);

        // Check backwards from today
        for (let i = 0; i < 365; i++) {
            const k = getDateKey(d);
            const log = logs[k];

            // Streak Definition: At least 5 prayers marked as anything other than 'none'
            const prayersDone = log ? PRAYERS.filter(p => log.prayers[p] !== 'none').length : 0;

            if (prayersDone === 5) {
                s++;
            } else {
                // If it's today and not done yet, don't break streak, just ignore today
                if (k === getDateKey(today)) {
                    // Continue checking yesterday
                } else {
                    break;
                }
            }
            d.setDate(d.getDate() - 1);
        }
        setStreak(s);
    };

    const updateLog = (updates: Partial<DayLog>) => {
        setLogs(prev => ({
            ...prev,
            [dateKey]: { ...getLog(dateKey), ...updates }
        }));
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        // Prevent going into future
        if (newDate > new Date()) return;
        setCurrentDate(newDate);
    };

    const addCustomHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitInput.trim()) return;
        if (activeHabits.includes(newHabitInput.trim())) return;

        setConfig(prev => ({
            ...prev,
            customHabits: [...prev.customHabits, newHabitInput.trim()]
        }));
        setNewHabitInput('');
    };

    const removeCustomHabit = (habit: string) => {
        if (confirm(`Remove "${habit}" from your habits list?`)) {
            setConfig(prev => ({
                ...prev,
                customHabits: prev.customHabits.filter(h => h !== habit)
            }));
        }
    };

    // --- Visual Helpers ---

    const getPrayerColor = (status: PrayerStatus) => {
        switch (status) {
            case 'jamaah': return 'bg-indigo-500 border-indigo-500 text-white';
            case 'ontime': return 'bg-emerald-500 border-emerald-500 text-white';
            case 'late': return 'bg-amber-400 border-amber-400 text-white';
            default: return 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-500';
        }
    };

    const getPrayerScore = (date: string) => {
        const l = logs[date]; // Direct access to verify existence first
        if (!l) return 0;

        let score = 0;
        PRAYERS.forEach(p => {
            if (l.prayers[p] === 'jamaah') score += 100;
            else if (l.prayers[p] === 'ontime') score += 80;
            else if (l.prayers[p] === 'late') score += 50;
        });
        return (score / 500) * 100;
    };

    // Generate last 7 days ending on CURRENT VIEWED DATE
    const weekData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - (6 - i));
        const k = getDateKey(d);
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            score: getPrayerScore(k),
            date: k,
            isToday: k === dateKey
        };
    });

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">

            {/* Header Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-2xl flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 shrink-0">
                        <CheckSquare className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ibadah Journal</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-orange-500">{streak} Day Streak</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl w-full md:w-auto justify-between md:justify-end">
                    <button onClick={() => changeDate(-1)} className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-center min-w-[140px]">
                        <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Viewing</span>
                        <span className="block font-bold text-slate-800 dark:text-white text-lg">
                            {currentDate.toDateString() === new Date().toDateString() ? 'Today' : currentDate.toLocaleDateString()}
                        </span>
                    </div>

                    <button
                        onClick={() => changeDate(1)}
                        disabled={currentDate.toDateString() === new Date().toDateString()}
                        className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Prayers & Analytics */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Weekly Chart */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-slate-400" />
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Weekly Overview</h3>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
                        </div>
                        <div className="flex items-end justify-between h-32 gap-2 md:gap-4">
                            {weekData.map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                    <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-t-xl relative group h-full flex items-end overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        <div
                                            className={`w-full transition-all duration-700 ease-out ${d.score === 100 ? 'bg-emerald-500' : d.score > 75 ? 'bg-emerald-400' : d.score > 40 ? 'bg-emerald-300' : 'bg-emerald-200 dark:bg-emerald-800'}`}
                                            style={{ height: `${Math.max(d.score, 4)}%` }} // Min height 4% for visibility
                                        ></div>
                                        {/* Tooltip */}
                                        <div className="absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 bg-slate-800 dark:bg-black text-white text-[10px] text-center py-1 transition-opacity z-10">
                                            {Math.round(d.score)}%
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold uppercase ${d.isToday ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 rounded' : 'text-slate-400'}`}>{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prayer Log */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-wrap justify-between items-center gap-4">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Daily Prayers</h3>
                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Jama'ah</span>
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> On Time</span>
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Late</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {PRAYERS.map((prayer) => {
                                const status = currentLog.prayers[prayer];

                                return (
                                    <div key={prayer} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${status !== 'none' ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                                {prayer[0]}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">{prayer}</span>
                                        </div>

                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
                                            {(['none', 'late', 'ontime', 'jamaah'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateLog({
                                                        prayers: { ...currentLog.prayers, [prayer]: s }
                                                    })}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${status === s
                                                            ? `${getPrayerColor(s)} shadow-sm`
                                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                    {s === 'none' ? 'Missed' : s === 'ontime' ? 'On Time' : s === 'jamaah' ? 'Jama\'ah' : s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quran & Fasting Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quran Tracker */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Quran Progress</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Pages Read Today</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={currentLog.quranPages || ''}
                                            onChange={(e) => updateLog({ quranPages: parseInt(e.target.value) || 0 })}
                                            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/40"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-bold">PGS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fasting Tracker */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Fasting</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(['none', 'sunnah', 'fard', 'makeup'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateLog({ fasting: type })}
                                        className={`py-2 rounded-lg text-xs font-bold capitalize border transition-all ${currentLog.fasting === type
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        {type === 'none' ? 'Not Fasting' : type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Habits & Journal */}
                <div className="space-y-8">

                    {/* Daily Habits */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-fuchsia-500" /> Daily Habits
                        </h3>

                        <div className="space-y-3 mb-6">
                            {activeHabits.map(habit => {
                                const isDone = !!currentLog.habits[habit];
                                return (
                                    <div key={habit} className="group flex items-center gap-2">
                                        <button
                                            onClick={() => updateLog({ habits: { ...currentLog.habits, [habit]: !isDone } })}
                                            className={`flex-1 p-3 rounded-xl border text-left flex items-center justify-between transition-all ${isDone
                                                    ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-200 dark:border-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-400'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <span className="font-medium text-sm">{habit}</span>
                                            {isDone && <Check className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />}
                                        </button>
                                        {/* Delete custom habits */}
                                        {config.customHabits.includes(habit) && (
                                            <button
                                                onClick={() => removeCustomHabit(habit)}
                                                className="p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Habit */}
                        <form onSubmit={addCustomHabit} className="flex gap-2">
                            <input
                                type="text"
                                value={newHabitInput}
                                onChange={(e) => setNewHabitInput(e.target.value)}
                                placeholder="Add custom habit..."
                                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 dark:text-white"
                            />
                            <button type="submit" className="p-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600">
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    {/* Mood & Notes */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <PenLine className="w-5 h-5 text-sky-500" /> Reflection
                        </h3>

                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">How do you feel today?</label>
                            <div className="flex justify-between gap-2">
                                {MOODS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => updateLog({ mood: m.id })}
                                        className={`flex-1 p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${currentLog.mood === m.id
                                                ? `${m.color} ring-2 ring-offset-2 ring-slate-100 dark:ring-slate-700`
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 grayscale hover:grayscale-0'
                                            }`}
                                    >
                                        <m.icon className="w-6 h-6" />
                                        <span className="text-[10px] font-bold">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Daily Notes</label>
                            <textarea
                                value={currentLog.notes}
                                onChange={(e) => updateLog({ notes: e.target.value })}
                                placeholder="What are you grateful for? Any struggles?"
                                className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
