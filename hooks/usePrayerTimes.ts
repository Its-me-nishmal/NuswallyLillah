
import { useState, useEffect, useRef } from 'react';
import { PrayerApiResponse } from '../types';

export interface NextPrayerInfo {
    name: string;
    time: string;
    timeLeft: string;
}

export const usePrayerTimes = () => {
    const [loading, setLoading] = useState(true);
    const [prayerData, setPrayerData] = useState<any | null>(null);
    const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [usingFallback, setUsingFallback] = useState(false);

    // Fallback times (Approximate standard times for India/General)
    const FALLBACK_TIMES = {
        Fajr: "05:15",
        Sunrise: "06:30",
        Dhuhr: "12:30",
        Asr: "16:15",
        Maghrib: "18:45",
        Isha: "20:15"
    };

    const parseTime = (timeStr: string) => {
        if (!timeStr) return new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const formatTimeLeft = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    }, []);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
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

    return {
        loading,
        prayerData,
        nextPrayer,
        currentTime,
        usingFallback,
        FALLBACK_TIMES, // Exported for use in comparisons if needed
        formatTimeLeft // Useful helper
    };
};
