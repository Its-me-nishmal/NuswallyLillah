import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PrayerCardErrorProps {
    onRetry?: () => void;
}

export const PrayerCardError: React.FC<PrayerCardErrorProps> = ({ onRetry }) => {
    return (
        <div
            className="col-span-1 md:col-span-1 bg-red-500 dark:bg-red-600 rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-lg shadow-red-200 dark:shadow-red-900/20 text-white flex flex-col justify-center relative overflow-hidden min-h-[120px] md:min-h-[180px]"
            role="alert"
            aria-live="assertive"
        >
            <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-br from-transparent to-black/10"></div>

            <div className="flex flex-row md:flex-col justify-start md:justify-between items-center md:items-start w-full relative z-10 gap-2 md:gap-0 h-full">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>

                <div className="text-left md:text-left flex-1 md:h-full md:flex md:flex-col md:justify-end md:mt-2 min-w-0">
                    <p className="text-[10px] md:text-xs text-red-100 font-bold uppercase tracking-wider mb-0 md:mb-1 leading-none">
                        Prayer Times
                    </p>
                    <h3 className="text-base md:text-xl lg:text-2xl font-bold tracking-tight leading-none mb-1">
                        Failed to Load
                    </h3>
                    <p className="text-red-100 font-medium opacity-90 text-[10px] md:text-sm leading-tight">
                        Unable to fetch prayer times
                    </p>
                </div>
            </div>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-3 md:mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-500"
                    aria-label="Retry loading prayer times"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry</span>
                </button>
            )}
        </div>
    );
};
