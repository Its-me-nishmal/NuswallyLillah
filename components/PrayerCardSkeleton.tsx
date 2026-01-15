import React from 'react';

export const PrayerCardSkeleton: React.FC = () => {
    return (
        <div
            className="col-span-1 md:col-span-1 bg-emerald-500 dark:bg-emerald-600 rounded-2xl md:rounded-[2rem] p-3 md:p-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 text-white flex flex-col justify-center relative overflow-hidden min-h-[90px] md:min-h-[130px]"
            role="status"
            aria-label="Loading prayer times"
        >
            <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-br from-transparent to-black/10"></div>

            <div className="flex flex-row md:flex-col justify-start md:justify-between items-center md:items-start w-full relative z-10 gap-2 md:gap-0 h-full animate-pulse">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-4 h-4 md:w-5 md:h-5 bg-white/30 rounded"></div>
                </div>

                <div className="text-left md:text-left flex-1 md:h-full md:flex md:flex-col md:justify-end min-w-0 space-y-2">
                    <div className="h-6 md:h-8 w-24 bg-white/30 rounded-lg"></div>
                    <div className="h-3 w-20 bg-emerald-100/30 rounded-full"></div>
                </div>
            </div>

            <span className="sr-only">Loading next prayer time...</span>
        </div>
    );
};
