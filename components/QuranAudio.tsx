import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download,
    Repeat, Repeat1, Shuffle, X, Music, Gauge, Headphones
} from 'lucide-react';
import type { PlaybackMode, LastListened } from '../types';
import malayalamData from '../services/malayalam-quran.json';
import tamilData from '../services/tamil-quran.json';
import mp3QuranData from '../services/mp3quran.json';

interface QuranChapter {
    index?: number;
    id?: number | string;
    name: string;
    nameTrans?: string;
    translation?: string;
    english_name?: string;
    nameMl?: string;
    fileName?: string;
    link?: string;
    durationInSecs?: number;
}

export const QuranAudio: React.FC = () => {
    const [selectedLang, setSelectedLang] = useState<'malayalam' | 'tamil' | 'arabic'>('arabic');
    const [selectedReciter, setSelectedReciter] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [mode, setMode] = useState<PlaybackMode>('sequential');
    const [showModal, setShowModal] = useState(false);
    const [shuffle, setShuffle] = useState<number[]>([]);
    const [shuffleIdx, setShuffleIdx] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    //Get chapters based on language
    const getChapters = (): QuranChapter[] => {
        try {
            if (selectedLang === 'malayalam') {
                return (malayalamData as any).chapters || [];
            } else if (selectedLang === 'tamil') {
                return (tamilData as any).chapters || [];
            } else {
                const reciter = (mp3QuranData as any[])[selectedReciter];
                return reciter?.audio || [];
            }
        } catch (error) {
            console.error('Error getting chapters:', error);
            return [];
        }
    };

    // Get audio URL
    const getAudioUrl = (chapter: QuranChapter | undefined): string => {
        if (!chapter) return '';

        try {
            if (selectedLang === 'malayalam') {
                return chapter.fileName ? `${(malayalamData as any).baseUrl}${chapter.fileName}` : '';
            } else if (selectedLang === 'tamil') {
                return chapter.fileName ? `${(tamilData as any).baseUrl}${chapter.fileName}` : '';
            } else {
                return chapter.link || '';
            }
        } catch (error) {
            console.error('Error getting audio URL:', error);
            return '';
        }
    };

    const chapters = getChapters();
    const current = chapters && chapters.length > 0 ? chapters[currentIndex] : undefined;
    const audioUrl = current ? getAudioUrl(current) : '';

    // Shuffle setup
    useEffect(() => {
        if (mode === 'shuffle') {
            const list = [...Array(chapters.length).keys()];
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
            setShuffle(list);
            setShuffleIdx(0);
        }
    }, [mode, chapters.length]);

    // Load & save state
    useEffect(() => {
        const saved = localStorage.getItem('quranAudio_lastListened');
        if (saved) {
            const data: LastListened = JSON.parse(saved);
            setSelectedLang(data.language as any);
            if (data.reciterIndex !== undefined) setSelectedReciter(data.reciterIndex);
            setCurrentIndex(data.chapterIndex);
        }
        const vol = localStorage.getItem('quranAudio_volume');
        if (vol) setVolume(parseFloat(vol));
        const spd = localStorage.getItem('quranAudio_playbackSpeed');
        if (spd) setSpeed(parseFloat(spd));
    }, []);

    useEffect(() => {
        localStorage.setItem('quranAudio_lastListened', JSON.stringify({
            language: selectedLang,
            reciterIndex: selectedLang === 'arabic' ? selectedReciter : undefined,
            chapterIndex: currentIndex,
            position: currentTime,
            timestamp: Date.now()
        }));
    }, [selectedLang, selectedReciter, currentIndex, currentTime]);

    useEffect(() => {
        localStorage.setItem('quranAudio_volume', volume.toString());
    }, [volume]);

    useEffect(() => {
        localStorage.setItem('quranAudio_playbackSpeed', speed.toString());
    }, [speed]);

    // Audio controls
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume;
        audio.playbackRate = speed;
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDur = () => setDuration(audio.duration);
        const ended = () => {
            setIsPlaying(false);
            handleNext();
        };
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDur);
        audio.addEventListener('ended', ended);
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDur);
            audio.removeEventListener('ended', ended);
        };
    }, [volume, isMuted, speed]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    };

    const handlePrev = () => {
        if (mode === 'shuffle' && shuffle.length > 0) {
            const idx = shuffleIdx > 0 ? shuffleIdx - 1 : shuffle.length - 1;
            setShuffleIdx(idx);
            setCurrentIndex(shuffle[idx]);
        } else {
            setCurrentIndex(prev => (prev > 0 ? prev - 1 : chapters.length - 1));
        }
        setCurrentTime(0);
        setIsPlaying(false);
    };

    const handleNext = () => {
        if (mode === 'loop-one') {
            setCurrentTime(0);
            audioRef.current?.play();
            setIsPlaying(true);
            return;
        }
        if (mode === 'shuffle' && shuffle.length > 0) {
            const idx = shuffleIdx < shuffle.length - 1 ? shuffleIdx + 1 : 0;
            setShuffleIdx(idx);
            setCurrentIndex(shuffle[idx]);
        } else {
            const next = currentIndex < chapters.length - 1 ? currentIndex + 1 : 0;
            if (mode === 'sequential' && currentIndex === chapters.length - 1) {
                setIsPlaying(false);
                return;
            }
            setCurrentIndex(next);
        }
        setCurrentTime(0);
        setTimeout(() => {
            audioRef.current?.play();
            setIsPlaying(true);
        }, 100);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) audioRef.current.currentTime = time;
    };

    const cycleMode = () => {
        const modes: PlaybackMode[] = ['sequential', 'loop-one', 'loop-all', 'shuffle'];
        const idx = modes.indexOf(mode);
        setMode(modes[(idx + 1) % modes.length]);
    };

    const download = async () => {
        try {
            const res = await fetch(audioUrl);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${current.nameTrans || current.translation || current.english_name}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const formatTime = (s: number) => {
        if (isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const getModeIcon = () => {
        switch (mode) {
            case 'loop-one': return <Repeat1 className="w-5 h-5" />;
            case 'loop-all': return <Repeat className="w-5 h-5" />;
            case 'shuffle': return <Shuffle className="w-5 h-5" />;
            default: return <Repeat className="w-5 h-5 opacity-40" />;
        }
    };

    return (
        <>
            {/* Main Player View */}
            <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 p-4 flex flex-col items-center justify-center font-sans selection:bg-emerald-100">
                {/* Background Decorative Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/5 dark:bg-emerald-900/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/5 dark:bg-teal-900/5 blur-[120px] rounded-full"></div>
                </div>

                <div className="w-full max-w-[360px] relative z-10">
                    {/* Compact Card */}
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-slate-800 p-6">

                        {/* 1. Language Pill Selector (Always Visible) */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-6">
                            {(['arabic', 'malayalam', 'tamil'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        setSelectedLang(lang);
                                        setCurrentIndex(0);
                                        setIsPlaying(false);
                                    }}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${selectedLang === lang
                                        ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {lang === 'arabic' ? 'Arabic' : lang === 'malayalam' ? 'Malayalam' : 'Tamil'}
                                </button>
                            ))}
                        </div>

                        {/* 2. Compact Header Info */}
                        <div className="flex items-center gap-4 mb-6">
                            {/* Small Rotating Art */}
                            <div className="relative w-20 h-20 shrink-0">
                                <div className={`absolute -inset-2 border border-dashed border-emerald-500/20 rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`}></div>
                                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 shadow-lg flex items-center justify-center text-white text-3xl font-black">
                                    {current?.index || current?.id || 1}
                                </div>
                                {isPlaying && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                        <div className="flex gap-0.5 items-end">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '8px', animationDelay: `${i * 0.1}s` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-black text-slate-800 dark:text-white truncate leading-tight">
                                    {current?.nameTrans || current?.translation || current?.english_name || 'Loading...'}
                                </h2>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                    {current?.nameMl || current?.name || ''}
                                </p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Music className="w-3 h-3" />
                                    Change Surah
                                </button>
                            </div>
                        </div>

                        {/* 3. Reciter Selector (Arabic Mode Only) */}
                        {selectedLang === 'arabic' && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Selected Reciter</label>
                                <select
                                    value={selectedReciter}
                                    onChange={(e) => {
                                        setSelectedReciter(parseInt(e.target.value));
                                        setCurrentIndex(0);
                                        setIsPlaying(false);
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-slate-800 dark:text-white font-bold text-xs appearance-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                    {(mp3QuranData as any[]).map((r: any, i: number) => (
                                        <option key={i} value={i}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 4. Progress Area */}
                        <div className="mb-6">
                            <div className="relative group px-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="quran-slider w-full h-1"
                                    style={{ '--progress': `${(currentTime / (duration || 1)) * 100}%` } as any}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2 px-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* 5. Playback Controls */}
                        <div className="flex items-center justify-between gap-2 mb-6">
                            <button
                                onClick={cycleMode}
                                className={`p-2.5 rounded-xl transition-all ${mode !== 'sequential' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:text-slate-500'}`}
                            >
                                {getModeIcon()}
                            </button>

                            <div className="flex items-center gap-4">
                                <button onClick={handlePrev} className="p-2.5 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-75">
                                    <SkipBack className="w-5 h-5" fill="currentColor" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 transition-all active:scale-90"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
                                </button>

                                <button onClick={handleNext} className="p-2.5 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-75">
                                    <SkipForward className="w-5 h-5" fill="currentColor" />
                                </button>
                            </div>

                            <button onClick={download} className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        {/* 6. Settings Grid (Volume & Speed) */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 flex items-center gap-2">
                                <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                </button>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="volume-slider flex-1 h-1"
                                />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 flex items-center gap-2">
                                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                                <select
                                    value={speed}
                                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                    className="flex-1 bg-transparent text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 outline-none border-none p-0 appearance-none text-center"
                                >
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                                        <option key={s} value={s}>{s}x</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .quran-slider {
                    -webkit-appearance: none;
                    background: #e2e8f0;
                    border-radius: 999px;
                    outline: none;
                }
                .dark .quran-slider { background: #1e293b; }
                .quran-slider::-webkit-slider-runnable-track {
                    background: linear-gradient(to right, #10b981 var(--progress), transparent var(--progress));
                    height: 4px; border-radius: 999px;
                }
                .quran-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px; height: 12px;
                    background: #10b981;
                    border-radius: 50%; border: 2px solid white;
                    cursor: pointer; margin-top: -4px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .volume-slider {
                    -webkit-appearance: none;
                    background: #e2e8f0;
                    border-radius: 999px;
                    height: 3px;
                }
                .dark .volume-slider { background: #334155; }
                .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 8px; height: 8px;
                    background: #94a3b8; border-radius: 50%; cursor: pointer;
                }
                @keyframes wave {
                    0%, 100% { height: 4px; }
                    50% { height: 12px; }
                }
                .animate-wave { animation: wave 0.6s ease-in-out infinite; }
                .animate-spin-slow { animation: rotate 12s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Modal - Chapter List */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Browse Surahs</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Select a chapter to play</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-4 space-y-2">
                            {chapters.map((ch, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setCurrentIndex(idx);
                                        setShowModal(false);
                                        setIsPlaying(false);
                                        setTimeout(() => { audioRef.current?.play(); setIsPlaying(true); }, 100);
                                    }}
                                    className={`w-full group p-4 rounded-2xl text-left transition-all ${currentIndex === idx
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${currentIndex === idx ? 'bg-white/20' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-emerald-600'}`}>
                                            {ch.index || ch.id || idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{ch.nameTrans || ch.translation || ch.english_name}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-wider ${currentIndex === idx ? 'text-white/60' : 'text-slate-400'}`}>
                                                {ch.nameMl || ch.name}
                                            </p>
                                        </div>
                                        {currentIndex === idx && isPlaying && <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Audio Element */}
            {audioUrl && (
                <audio ref={audioRef} src={audioUrl} preload="metadata" />
            )}
        </>
    );
};
