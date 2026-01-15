import React, { useState, useEffect, memo } from 'react';

interface AnimatedClockProps {
    headerState: 'salam' | 'time' | 'date' | 'hijri';
    currentTime: Date;
}

export const AnimatedClock: React.FC<AnimatedClockProps> = memo(({ headerState, currentTime }) => {
    return (
        <div className="relative h-12 md:h-16" role="status" aria-live="polite" aria-atomic="true">
            {/* Salam Believer */}
            <h1
                className={`absolute inset-0 flex items-center text-lg md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight transition-all duration-700 ${headerState === 'salam' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
                aria-hidden={headerState !== 'salam'}
            >
                Salam, Believer
            </h1>

            {/* Current Time */}
            <div
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ${headerState === 'time' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                aria-hidden={headerState !== 'time'}
            >
                <span className="text-[9px] md:text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Current Time
                </span>
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </h1>
            </div>

            {/* Gregorian Date */}
            <div
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ${headerState === 'date' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                aria-hidden={headerState !== 'date'}
            >
                <span className="text-[9px] md:text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                    Today's Date
                </span>
                <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
                    {currentTime.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </h1>
            </div>

            {/* Hijri Date */}
            <div
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ${headerState === 'hijri' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                aria-hidden={headerState !== 'hijri'}
            >
                <span className="text-[9px] md:text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                    Hijri Calendar
                </span>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
                    15 Ramadan 1445 AH
                </h1>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if headerState changes or time changes significantly (second-level)
    return (
        prevProps.headerState === nextProps.headerState &&
        prevProps.currentTime.getSeconds() === nextProps.currentTime.getSeconds()
    );
});

AnimatedClock.displayName = 'AnimatedClock';
