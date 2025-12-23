
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star, AlertCircle, Info } from 'lucide-react';

export const HijriCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarGrid, setCalendarGrid] = useState<Array<{ day: number, date: Date, hijriDay: string, hijriMonth: string, isWhiteDay: boolean, event?: string }>>([]);

    // Islamic Events (Approximate for demo logic)
    // In a real app, calculate based on Hijri month/day index
    const events: Record<string, string> = {
        '9-9': 'Start of Ramadan',
        '10-1': 'Eid al-Fitr',
        '12-9': 'Day of Arafah',
        '12-10': 'Eid al-Adha',
        '1-1': 'Islamic New Year',
        '1-10': 'Ashura',
        '7-27': 'Isra and Mi\'raj'
    };

    const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const getHijriParts = (date: Date) => {
        const parts = hijriFormatter.formatToParts(date);
        const day = parts.find(p => p.type === 'day')?.value || '';
        const month = parts.find(p => p.type === 'month')?.value || '';
        const year = parts.find(p => p.type === 'year')?.value || '';

        // Numeric representation for event matching (simple approximation mapping needed for robust usage, relying on string for now)
        // For reliable event matching, we'd need a library like hijri-date-js. 
        // Here we will use the day/month text for display and generic white day logic.
        return { day, month, year };
    };

    const generateCalendar = (baseDate: Date) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // Padding for start of week
        const startPadding = firstDay.getDay();
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const { day: hDay, month: hMonth } = getHijriParts(date);

            // Check White Days (13, 14, 15)
            // Note: The Intl API returns '13', '14' etc.
            const isWhiteDay = ['13', '14', '15'].includes(hDay);

            days.push({
                day: i,
                date: date,
                hijriDay: hDay,
                hijriMonth: hMonth,
                isWhiteDay,
                // Event logic stub - needs exact mapping
                event: null
            });
        }

        return days;
    };

    useEffect(() => {
        setCalendarGrid(generateCalendar(currentDate) as any);
    }, [currentDate]);

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
        setCurrentDate(newDate);
    };

    const today = new Date();
    const todayHijri = getHijriParts(today);

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 pb-10">

            {/* Calendar View */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                            Approx. {getHijriParts(currentDate).month} {getHijriParts(currentDate).year} AH
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 mb-4 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-2">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                    {calendarGrid.map((cell, idx) => {
                        if (!cell) return <div key={idx} className="bg-transparent"></div>;

                        const isToday = cell.date.toDateString() === today.toDateString();

                        return (
                            <div
                                key={idx}
                                className={`
                            relative rounded-2xl p-2 min-h-[80px] flex flex-col justify-between border transition-all hover:shadow-md
                            ${isToday
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : cell.isWhiteDay
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-700/50'
                                            : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800'
                                    }
                        `}
                            >
                                <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {cell.day}
                                </span>

                                <div className="flex items-end justify-between">
                                    <span className={`text-xs font-medium ${isToday ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {cell.hijriDay}
                                    </span>
                                    {cell.isWhiteDay && !isToday && (
                                        <div className="w-2 h-2 rounded-full bg-amber-400" title="White Day (Fasting Recommended)"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <Info className="w-4 h-4 shrink-0" />
                    <p>Hijri dates are approximate based on the Umm al-Qura calendar. Actual dates may vary based on local moon sighting.</p>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="w-full md:w-80 space-y-6">

                {/* Today Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl p-6 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wide opacity-80">Today</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{todayHijri.day} {todayHijri.month}</h3>
                    <p className="text-indigo-100 text-lg">{todayHijri.year} AH</p>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span>Gregorian</span>
                            <span>{today.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Special Days Key */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Legend</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">12</div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Today</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 flex items-center justify-center text-amber-700 dark:text-amber-400 text-xs font-bold">13</div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">White Days</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">13, 14, 15 of Hijri Month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events Stub */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Upcoming Events</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">Ramadan Starts</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Approx. Mar 10</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">Eid al-Fitr</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Approx. Apr 09</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
