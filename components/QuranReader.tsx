
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Search, Book, ArrowLeft, MoreHorizontal, Settings, Type, AlignJustify, Eye, EyeOff, X, Star, Bookmark, History, Trash2, ChevronRight, ChevronLeft, Loader2, Check, Gauge } from 'lucide-react';

const API_BASE = "https://quranapi.pages.dev/api";

interface SurahMeta {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

interface Ayah {
    numberInSurah: number;
    text: string;
    translation: string;
    audioUrl: string;
}

interface ReaderSettings {
    mode: 'list' | 'reading';
    showTranslation: boolean;
    fontSize: number;
}

interface StoredLocation {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    timestamp: number;
}

type SidebarTab = 'surahs' | 'favorites' | 'bookmarks';

const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 1.75, 2, 2.5];

export const QuranReader: React.FC = () => {
    // Data State
    const [surahs, setSurahs] = useState<SurahMeta[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<SurahMeta | null>(null);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // User Preference State (LocalStorage)
    const [favorites, setFavorites] = useState<number[]>([]);
    const [bookmarks, setBookmarks] = useState<StoredLocation[]>([]);
    const [lastRead, setLastRead] = useState<StoredLocation | null>(null);
    const [activeTab, setActiveTab] = useState<SidebarTab>('surahs');

    // Navigation State
    const [scrollToAyah, setScrollToAyah] = useState<number | null>(null);

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<ReaderSettings>({
        mode: 'list',
        showTranslation: true,
        fontSize: 36
    });

    // Audio State
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [autoPlayNext, setAutoPlayNext] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [preloadedUrl, setPreloadedUrl] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const ayahRefs = useRef<{ [key: number]: HTMLDivElement | HTMLSpanElement | null }>({});

    // --- Initialization & LocalStorage ---

    useEffect(() => {
        // Load Settings
        const savedSettings = localStorage.getItem('quran_settings');
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        // Load Favorites
        const savedFavs = localStorage.getItem('quran_favorites');
        if (savedFavs) setFavorites(JSON.parse(savedFavs));

        // Load Bookmarks
        const savedBookmarks = localStorage.getItem('quran_bookmarks');
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

        // Load Last Read
        const savedLastRead = localStorage.getItem('quran_last_read');
        if (savedLastRead) setLastRead(JSON.parse(savedLastRead));
    }, []);

    // Save effects
    useEffect(() => localStorage.setItem('quran_settings', JSON.stringify(settings)), [settings]);
    useEffect(() => localStorage.setItem('quran_favorites', JSON.stringify(favorites)), [favorites]);
    useEffect(() => localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks)), [bookmarks]);
    useEffect(() => {
        if (lastRead) localStorage.setItem('quran_last_read', JSON.stringify(lastRead));
    }, [lastRead]);

    // --- Fetching Logic ---

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await fetch(`${API_BASE}/surah.json`);
                const data = await res.json();
                const mappedSurahs: SurahMeta[] = data.map((s: any, index: number) => ({
                    number: index + 1,
                    name: s.surahNameArabic,
                    englishName: s.surahName,
                    englishNameTranslation: s.surahNameTranslation,
                    numberOfAyahs: s.totalAyah,
                    revelationType: s.revelationPlace
                }));
                setSurahs(mappedSurahs);
                setLoading(false);
            } catch (e) {
                console.error("Failed to fetch Quran list", e);
                setLoading(false);
            }
        };
        fetchList();
    }, []);

    const selectSurah = async (surah: SurahMeta, targetAyah?: number) => {
        setSelectedSurah(surah);
        setContentLoading(true);
        setAyahs([]);
        setPlayingAyah(null);
        setIsAutoPlaying(false);
        if (targetAyah) setScrollToAyah(targetAyah);

        try {
            const res = await fetch(`${API_BASE}/${surah.number}.json`);
            if (!res.ok) throw new Error("Failed to fetch surah content");
            const data = await res.json();

            const combined: Ayah[] = (data.arabic1 || []).map((text: string, index: number) => ({
                numberInSurah: index + 1,
                text: text,
                translation: data.english?.[index] || "Translation unavailable",
                audioUrl: `https://the-quran-project.github.io/Quran-Audio/Data/1/${surah.number}_${index + 1}.mp3`
            }));

            setAyahs(combined);

            // Update Last Read context just for Surah entry
            updateLastRead(surah.number, surah.englishName, targetAyah || 1);

        } catch (e) {
            console.error("Failed to fetch chapter content", e);
        } finally {
            setContentLoading(false);
        }
    };

    // Scroll to target ayah after loading
    useEffect(() => {
        if (!contentLoading && scrollToAyah && ayahs.length > 0) {
            setTimeout(() => {
                ayahRefs.current[scrollToAyah]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                setScrollToAyah(null); // Reset
            }, 500);
        }
    }, [contentLoading, scrollToAyah, ayahs]);

    // Handle Auto Play Next Surah after loading
    useEffect(() => {
        if (!contentLoading && ayahs.length > 0 && autoPlayNext) {
            setPlayingAyah(1);
            setIsAutoPlaying(true);
            setAutoPlayNext(false); // Reset flag
        }
    }, [contentLoading, ayahs, autoPlayNext]);

    // --- User Actions ---

    const toggleFavorite = (e: React.MouseEvent, surahNumber: number) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(surahNumber)
                ? prev.filter(n => n !== surahNumber)
                : [...prev, surahNumber]
        );
    };

    const updateLastRead = (surahNum: number, surahName: string, ayahNum: number) => {
        setLastRead({
            surahNumber: surahNum,
            surahName: surahName,
            ayahNumber: ayahNum,
            timestamp: Date.now()
        });
    };

    const toggleBookmark = (ayahNum: number) => {
        if (!selectedSurah) return;
        const exists = bookmarks.find(b => b.surahNumber === selectedSurah.number && b.ayahNumber === ayahNum);

        if (exists) {
            setBookmarks(prev => prev.filter(b => !(b.surahNumber === selectedSurah.number && b.ayahNumber === ayahNum)));
        } else {
            setBookmarks(prev => [{
                surahNumber: selectedSurah.number,
                surahName: selectedSurah.englishName,
                ayahNumber: ayahNum,
                timestamp: Date.now()
            }, ...prev]);
        }
    };

    const deleteBookmark = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setBookmarks(prev => prev.filter((_, i) => i !== index));
    };

    const navigateToLocation = (loc: StoredLocation) => {
        const surah = surahs.find(s => s.number === loc.surahNumber);
        if (surah) {
            selectSurah(surah, loc.ayahNumber);
        }
    };

    const handleNextSurah = () => {
        if (!selectedSurah) return;
        const nextNum = selectedSurah.number + 1;
        if (nextNum <= 114) {
            const next = surahs.find(s => s.number === nextNum);
            if (next) selectSurah(next);
        }
    };

    const handlePrevSurah = () => {
        if (!selectedSurah) return;
        const prevNum = selectedSurah.number - 1;
        if (prevNum >= 1) {
            const prev = surahs.find(s => s.number === prevNum);
            if (prev) selectSurah(prev);
        }
    };

    // --- Audio Logic ---

    // Effect to handle play/pause and source change
    useEffect(() => {
        if (playingAyah !== null && audioRef.current && selectedSurah) {
            const ayah = ayahs.find(a => a.numberInSurah === playingAyah);
            if (ayah) {
                // Only update src if it's different to prevent reloading
                if (!audioRef.current.src.includes(ayah.audioUrl)) {
                    audioRef.current.src = ayah.audioUrl;
                }

                audioRef.current.playbackRate = playbackSpeed;
                audioRef.current.play().catch(e => console.error("Audio play error:", e));

                // Auto-scroll
                if (ayahRefs.current[playingAyah]) {
                    ayahRefs.current[playingAyah]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // Update last read when playing
                updateLastRead(selectedSurah.number, selectedSurah.englishName, playingAyah);
            }
        } else if (playingAyah === null && audioRef.current) {
            audioRef.current.pause();
        }
    }, [playingAyah, ayahs, selectedSurah]);

    // Effect to update speed on the fly
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    // Time Update for Preloading Logic
    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        const audio = e.currentTarget;
        const progress = audio.currentTime / audio.duration;

        // Preload next ayah at 70% completion
        if (progress > 0.7 && playingAyah !== null && !preloadedUrl) {
            const currentIndex = ayahs.findIndex(a => a.numberInSurah === playingAyah);
            if (currentIndex !== -1 && currentIndex < ayahs.length - 1) {
                const nextUrl = ayahs[currentIndex + 1].audioUrl;
                // Trigger browser preload by creating a disconnected audio object
                const preloadAudio = new Audio(nextUrl);
                preloadAudio.preload = "auto";
                setPreloadedUrl(nextUrl); // Flag that we preloaded for this turn
            }
        }
    };

    const loadNextSurah = () => {
        if (!selectedSurah) return;

        let nextSurahNum: number | null = null;

        if (activeTab === 'favorites' && favorites.length > 0) {
            const currentIndex = favorites.indexOf(selectedSurah.number);
            if (currentIndex !== -1 && currentIndex < favorites.length - 1) {
                nextSurahNum = favorites[currentIndex + 1];
            }
        } else {
            if (selectedSurah.number < 114) {
                nextSurahNum = selectedSurah.number + 1;
            }
        }

        if (nextSurahNum) {
            const nextSurah = surahs.find(s => s.number === nextSurahNum);
            if (nextSurah) {
                setAutoPlayNext(true);
                selectSurah(nextSurah);
            }
        } else {
            setIsAutoPlaying(false);
            setPlayingAyah(null);
        }
    };

    const handleAudioEnded = () => {
        // Reset preload flag for next cycle
        setPreloadedUrl(null);

        if (isAutoPlaying && playingAyah !== null) {
            const currentIndex = ayahs.findIndex(a => a.numberInSurah === playingAyah);
            if (currentIndex !== -1 && currentIndex < ayahs.length - 1) {
                // Play Next Ayah
                setPlayingAyah(ayahs[currentIndex + 1].numberInSurah);
            } else {
                // End of Surah -> Go to Next Surah
                loadNextSurah();
            }
        } else {
            setPlayingAyah(null);
        }
    };

    const toggleSurahPlay = () => {
        if (isAutoPlaying || playingAyah !== null) {
            setIsAutoPlaying(false);
            setPlayingAyah(null);
        } else {
            setIsAutoPlaying(true);
            setPlayingAyah(1);
        }
    };

    const toggleAyahPlay = (id: number) => {
        if (playingAyah === id) {
            // If clicking the currently playing ayah, we pause/stop
            setPlayingAyah(null);
            setIsAutoPlaying(false);
        } else {
            // If clicking a new ayah, we start playing AND enable auto-play for next
            setPlayingAyah(id);
            setIsAutoPlaying(true);
        }
    };

    const cyclePlaybackSpeed = () => {
        const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
        setPlaybackSpeed(PLAYBACK_SPEEDS[nextIndex]);
    };

    // --- Render Helpers ---

    const filteredSurahs = surahs.filter(s => {
        if (activeTab === 'favorites' && !favorites.includes(s.number)) return false;
        return (
            (s.englishName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(s.number).includes(searchQuery)
        );
    });

    const AyahEndSymbol = ({ number }: { number: number }) => (
        <span className="inline-flex items-center justify-center w-8 h-8 mx-1 align-middle relative font-sans text-emerald-600 dark:text-emerald-400 select-none">
            <span className="text-2xl opacity-40">۝</span>
            <span className="absolute text-[0.6rem] font-bold mt-1">{number}</span>
        </span>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/50 dark:border-white/5 overflow-hidden relative">
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                onTimeUpdate={handleTimeUpdate}
                className="hidden"
            />

            {/* --- TOP HEADER --- */}
            <div className="h-16 border-b border-emerald-50 dark:border-emerald-900/20 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 shrink-0 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20">
                        <Book className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-slate-800 dark:text-white text-lg hidden md:block">Al-Qur'an</h2>
                </div>

                {/* Play Surah Button (Desktop) */}
                {selectedSurah && (
                    <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-none justify-end md:justify-center">

                        {/* Playback Speed Control */}
                        <button
                            onClick={cyclePlaybackSpeed}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold"
                            title="Playback Speed"
                        >
                            <Gauge className="w-4 h-4" />
                            {playbackSpeed}x
                        </button>

                        <button
                            onClick={toggleSurahPlay}
                            disabled={contentLoading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all ${(isAutoPlaying || playingAyah !== null)
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                                } ${contentLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {contentLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (isAutoPlaying || playingAyah !== null) ? (
                                <Pause className="w-4 h-4 fill-current" />
                            ) : (
                                <Play className="w-4 h-4 fill-current" />
                            )}
                            <span className="hidden md:inline">
                                {contentLoading ? 'Loading...' : (isAutoPlaying || playingAyah !== null) ? 'Pause' : 'Play Surah'}
                            </span>
                        </button>

                        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{selectedSurah.englishName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{selectedSurah.revelationType}</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 ml-2 relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 transition-colors rounded-full ${showSettings ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Settings Popover */}
                    {showSettings && (
                        <div className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/30 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="font-bold text-slate-800 dark:text-white">View Settings</span>
                                <button onClick={() => setShowSettings(false)}><X className="w-4 h-4 text-slate-400 dark:text-slate-500" /></button>
                            </div>

                            <div className="space-y-4">
                                {/* View Mode */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Layout</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                        <button
                                            onClick={() => setSettings(s => ({ ...s, mode: 'list' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${settings.mode === 'list' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            <AlignJustify className="w-4 h-4" /> List
                                        </button>
                                        <button
                                            onClick={() => setSettings(s => ({ ...s, mode: 'reading' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${settings.mode === 'reading' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            <Book className="w-4 h-4" /> Read
                                        </button>
                                    </div>
                                </div>

                                {/* Translation Toggle */}
                                {settings.mode === 'list' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Translation</label>
                                        <button
                                            onClick={() => setSettings(s => ({ ...s, showTranslation: !s.showTranslation }))}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${settings.showTranslation ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                                        >
                                            <span className="text-sm font-medium">Show English</span>
                                            {settings.showTranslation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                )}

                                {/* Font Size */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Arabic Size</label>
                                    <div className="flex items-center gap-3">
                                        <Type className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        <input
                                            type="range"
                                            min="24"
                                            max="60"
                                            step="2"
                                            value={settings.fontSize}
                                            onChange={(e) => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
                                            className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-6">{settings.fontSize}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN CONTENT SPLIT --- */}
            <div className="flex-1 flex overflow-hidden relative z-10">

                {/* --- SIDEBAR --- */}
                <div className={`w-full md:w-80 border-r border-emerald-50 dark:border-emerald-900/10 bg-white/50 dark:bg-slate-900/70 flex flex-col ${selectedSurah ? 'hidden md:flex' : 'flex'}`}>

                    {/* Last Read Banner - Always visible if exists to allow easy resumption */}
                    {lastRead && (
                        <div className="p-4 pb-0">
                            <button
                                onClick={() => navigateToLocation(lastRead)}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:scale-[1.02] transition-transform text-left group relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 p-3 opacity-10">
                                    <History className="w-12 h-12" />
                                </div>
                                <div className="flex items-center gap-2 mb-2 text-emerald-100 text-xs font-bold uppercase tracking-wider relative z-10">
                                    <History className="w-3 h-3" />
                                    Last Read
                                </div>
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <p className="font-bold text-lg leading-none mb-1">{lastRead.surahName}</p>
                                        <p className="text-xs opacity-80">Ayah {lastRead.ayahNumber}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                                        <Play className="w-4 h-4 fill-current" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Sidebar Tabs */}
                    <div className="p-4 border-b border-emerald-50 dark:border-emerald-900/20">
                        <div className="flex bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl mb-3">
                            {(['surahs', 'favorites', 'bookmarks'] as SidebarTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar (Only for Surahs/Favs) */}
                        {activeTab !== 'bookmarks' && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-white/5 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar List Content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                        {/* List: Bookmarks */}
                        {activeTab === 'bookmarks' && (
                            bookmarks.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 dark:text-slate-600 text-sm">No bookmarks yet.</div>
                            ) : (
                                bookmarks.map((b, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigateToLocation(b)}
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all group text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                <Bookmark className="w-4 h-4 fill-current" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{b.surahName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500">Ayah {b.ayahNumber}</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={(e) => deleteBookmark(e, i)}
                                            className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))
                            )
                        )}

                        {/* List: Surahs / Favorites */}
                        {activeTab !== 'bookmarks' && (
                            loading ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-3">
                                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : filteredSurahs.map((surah) => (
                                <button
                                    key={surah.number}
                                    onClick={() => selectSurah(surah)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group/item ${selectedSurah?.number === surah.number
                                            ? 'bg-white dark:bg-slate-800 shadow-md shadow-emerald-100 dark:shadow-none ring-1 ring-emerald-50 dark:ring-emerald-900/30'
                                            : 'hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-sm'
                                        }`}
                                >
                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner ${selectedSurah?.number === surah.number ? 'bg-emerald-500 text-white' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                        {surah.number}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm font-bold truncate ${selectedSurah?.number === surah.number ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{surah.englishName}</h3>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{surah.englishNameTranslation}</p>
                                    </div>

                                    {/* Hover Action: Favorite */}
                                    <div
                                        onClick={(e) => toggleFavorite(e, surah.number)}
                                        className={`p-2 rounded-full transition-colors ${favorites.includes(surah.number) ? 'text-rose-500' : 'text-slate-200 dark:text-slate-700 hover:text-rose-400'}`}
                                    >
                                        <Star className={`w-4 h-4 ${favorites.includes(surah.number) ? 'fill-current' : ''}`} />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* --- READING PANE --- */}
                <div className={`flex-1 bg-white/80 dark:bg-slate-950/80 overflow-y-auto relative ${!selectedSurah ? 'hidden md:flex' : 'flex flex-col'}`}>
                    {!selectedSurah ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mb-6">
                                <Book className="w-8 h-8 text-emerald-300 dark:text-emerald-800" />
                            </div>
                            <p className="font-medium">Select a Surah to begin reading</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Back Button */}
                            <div className="md:hidden p-4 border-b border-emerald-50 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-30 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedSurah(null)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </button>
                                    <div>
                                        <span className="font-bold block text-slate-800 dark:text-white leading-none">{selectedSurah.englishName}</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase">{selectedSurah.revelationType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Surah Content */}
                            <div className="max-w-4xl mx-auto w-full pb-24 md:pb-20">
                                {/* Bismillah */}
                                <div className="py-12 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/27/Basmala.svg" className="h-12 md:h-16 opacity-80 dark:invert" alt="Bismillah" />
                                </div>

                                {contentLoading ? (
                                    <div className="space-y-8 p-6 md:p-12">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="animate-pulse space-y-4">
                                                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-3/4 ml-auto"></div>
                                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`transition-all duration-300 ${settings.mode === 'reading' ? 'px-6 md:px-12 leading-loose text-justify' : 'divide-y divide-emerald-50 dark:divide-white/5'}`} dir="rtl">
                                        {ayahs.map((ayah) => {
                                            const isBookmarked = bookmarks.some(b => b.surahNumber === selectedSurah.number && b.ayahNumber === ayah.numberInSurah);

                                            // --- VIEW MODE: READING (MUSHAF STYLE) ---
                                            if (settings.mode === 'reading') {
                                                return (
                                                    <span
                                                        key={ayah.numberInSurah}
                                                        ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                                                        onClick={() => {
                                                            toggleAyahPlay(ayah.numberInSurah);
                                                            updateLastRead(selectedSurah.number, selectedSurah.englishName, ayah.numberInSurah);
                                                        }}
                                                        className={`inline font-quran transition-colors duration-300 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded px-1 ${playingAyah === ayah.numberInSurah ? 'bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 rounded-lg shadow-sm box-decoration-clone' :
                                                                isBookmarked ? 'bg-amber-100/50 dark:bg-amber-900/20' : 'text-slate-800 dark:text-slate-200'
                                                            }`}
                                                        style={{
                                                            fontSize: `${settings.fontSize}px`,
                                                            lineHeight: '2.2'
                                                        }}
                                                    >
                                                        {ayah.text}
                                                        <AyahEndSymbol number={ayah.numberInSurah} />
                                                    </span>
                                                );
                                            }

                                            // --- VIEW MODE: LIST (STUDY STYLE) ---
                                            return (
                                                <div
                                                    key={ayah.numberInSurah}
                                                    ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                                                    className={`p-6 md:p-10 transition-all duration-500 ${playingAyah === ayah.numberInSurah
                                                            ? 'bg-emerald-50/60 dark:bg-emerald-900/10 shadow-inner'
                                                            : 'hover:bg-slate-50/50 dark:hover:bg-white/5'
                                                        }`}
                                                >
                                                    {/* Actions Row */}
                                                    <div className="flex items-center justify-between mb-8" dir="ltr">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${playingAyah === ayah.numberInSurah ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                            {ayah.numberInSurah}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => toggleBookmark(ayah.numberInSurah)}
                                                                className={`p-2 rounded-full transition-all ${isBookmarked ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                                                title="Bookmark Ayah"
                                                            >
                                                                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    toggleAyahPlay(ayah.numberInSurah);
                                                                    updateLastRead(selectedSurah.number, selectedSurah.englishName, ayah.numberInSurah);
                                                                }}
                                                                className={`p-2 rounded-full transition-all ${playingAyah === ayah.numberInSurah ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                            >
                                                                {playingAyah === ayah.numberInSurah ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Arabic */}
                                                    <p
                                                        className={`font-quran text-right leading-[2.5] mb-6 transition-colors ${playingAyah === ayah.numberInSurah ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}
                                                        style={{ fontSize: `${settings.fontSize}px` }}
                                                    >
                                                        {ayah.text}
                                                    </p>

                                                    {/* Translation */}
                                                    {settings.showTranslation && (
                                                        <p className={`text-lg font-light leading-relaxed transition-colors ${playingAyah === ayah.numberInSurah ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`} dir="ltr">
                                                            {ayah.translation}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* --- SURAH COMPLETION FOOTER --- */}
                                        <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 rounded-3xl mx-4 md:mx-12 mb-12 flex flex-col items-center text-center" dir="ltr">
                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                                <Check className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">Surah Completed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{selectedSurah.englishName} • {selectedSurah.numberOfAyahs} Ayahs</p>

                                            <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                                                {/* Prev */}
                                                {selectedSurah.number > 1 && (
                                                    <button
                                                        onClick={handlePrevSurah}
                                                        className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all flex items-center gap-2"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" /> Prev Surah
                                                    </button>
                                                )}

                                                {/* Favorite */}
                                                <button
                                                    onClick={(e) => toggleFavorite(e, selectedSurah.number)}
                                                    className={`px-6 py-3 rounded-xl border font-bold transition-all flex items-center gap-2 ${favorites.includes(selectedSurah.number)
                                                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400'
                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-200 hover:text-rose-500'
                                                        }`}
                                                >
                                                    <Star className={`w-4 h-4 ${favorites.includes(selectedSurah.number) ? 'fill-current' : ''}`} />
                                                    {favorites.includes(selectedSurah.number) ? 'Favorited' : 'Add to Favorites'}
                                                </button>

                                                {/* Next */}
                                                {selectedSurah.number < 114 && (
                                                    <button
                                                        onClick={handleNextSurah}
                                                        className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 transition-all flex items-center gap-2"
                                                    >
                                                        Next Surah <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
