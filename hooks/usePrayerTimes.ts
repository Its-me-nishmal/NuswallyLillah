
import { useState, useEffect, useRef } from 'react';
import { PrayerApiResponse } from '../types';

export interface NextPrayerInfo {
    name: string;
    time: string;
    timeLeft: string;
    status: 'upcoming' | 'active';
}

export const usePrayerTimes = () => {
    const [loading, setLoading] = useState(true);
    const [prayerData, setPrayerData] = useState<any | null>(null);
    const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [usingFallback, setUsingFallback] = useState(false);
    const [locationInfo, setLocationInfo] = useState<{ name: string; type: 'kerala' | 'other' }>({ name: 'Current Location', type: 'other' });

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
            const savedLocation = localStorage.getItem('user_location');
            if (savedLocation) {
                const loc = JSON.parse(savedLocation);
                if (loc.type === 'kerala' && loc.locationId) {
                    try {
                        setLoading(true);
                        const response = await fetch(`/KERALA-AZAN-DATA-main/${loc.locationId}.json`);
                        const jsonData = await response.json();
                        const prayerTimes = jsonData.prayer_times;

                        // Kerala data is an array of MM-DD objects. Find today's.
                        const today = new Date();
                        const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                        const dayData = prayerTimes.find((d: any) => d.date === mmdd) || prayerTimes[0];

                        // Map Kerala format to Aladhan format
                        const mappedData = {
                            timings: {
                                Fajr: dayData.fajr,
                                Sunrise: dayData.sunrise,
                                Dhuhr: dayData.dhuhr,
                                Asr: dayData.asr,
                                Maghrib: dayData.maghrib,
                                Isha: dayData.isha
                            },
                            date: {
                                readable: today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                                hijri: { day: '', month: { en: '' }, year: '' } // Hijri conversion would need another lib or logic
                            }
                        };
                        setUsingFallback(false);
                        setPrayerData(mappedData);
                        const locationName = loc.locationName && loc.districtName
                            ? `${loc.locationName}, ${loc.districtName}`
                            : (loc.locationName || 'Kerala');
                        setLocationInfo({ name: locationName, type: 'kerala' });
                        setLoading(false);
                        return;
                    } catch (err) {
                        console.error("Failed to fetch Kerala data, falling back to API", err);
                    }
                }
            }

            try {
                setLoading(true);
                const date = new Date();
                const timestamp = Math.floor(date.getTime() / 1000);
                const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`);
                const data = await response.json();

                if (data.code === 200) {
                    setPrayerData(data.data);
                    setUsingFallback(false);
                    setLocationInfo({ name: 'Current Location', type: 'other' });
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

        const handleLocationUpdate = () => {
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
        };

        handleLocationUpdate();

        // Listen for location changes
        window.addEventListener('locationChanged', handleLocationUpdate);
        return () => window.removeEventListener('locationChanged', handleLocationUpdate);
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
        let active = null;
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

            // Check for active prayer (within last 30 minutes)
            if (diff <= 0 && diff > -(30 * 60 * 1000)) {
                // Calculate remaining time for the 30-minute active window
                const activeTimeLeftMs = (30 * 60 * 1000) + diff;
                active = {
                    name: p,
                    time: timings[p],
                    timeLeft: formatTimeLeft(activeTimeLeftMs),
                    status: 'active' as const
                };
            }

            // Check for upcoming prayer
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                next = {
                    name: p,
                    time: timings[p],
                    timeLeft: formatTimeLeft(diff),
                    status: 'upcoming' as const
                };
            }
        }

        // Priority: show active prayer if in the 30-min window
        if (active) {
            setNextPrayer(active);
        } else if (next) {
            setNextPrayer(next);
        } else {
            // If no next prayer today, show Fajr tomorrow
            const fajrTime = getTodayTime(timings['Fajr']);
            fajrTime.setDate(fajrTime.getDate() + 1);
            const diff = fajrTime.getTime() - currentTime.getTime();
            setNextPrayer({
                name: 'Fajr',
                time: timings['Fajr'],
                timeLeft: formatTimeLeft(diff),
                status: 'upcoming'
            });
        }
    };

    return {
        loading,
        prayerData,
        nextPrayer,
        currentTime,
        usingFallback,
        locationInfo,
        FALLBACK_TIMES, // Exported for use in comparisons if needed
        formatTimeLeft // Useful helper
    };
};
