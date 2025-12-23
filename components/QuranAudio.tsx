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
    index: number;
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
    const [selectedLang, setSelectedLang] = useState<'malayalam' | 'tamil' | 'arabic'>('malayalam');
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
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-4 md:p-8 flex items-center justify-center">
                <div className="max-w-2xl w-full">
                    {/* Floating Player Card */}
                    <div className="relative">
                        {/* Background Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 blur-3xl rounded-full"></div>

                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 md:p-12">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
                                    <Headphones className="w-4 h-4 text-emer ald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Quran Audio</span>
                                </div>
                            </div>

                            {/* Album Art */}
                            <div className="relative mb-8">
                                <div className="w-64 h-64 mx-auto rounded-[2rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-2xl flex items-center justify-center overflow-hidden relative">
                                    {/* Animated background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

                                    {/* Content */}
                                    <div className="relative z-10 text-center text-white">
                                        <div className="text-7xl font-bold mb-2">{current?.index || current?.id || 1}</div>
                                        <div className="text-sm opacity-90 font-medium">{selectedLang === 'arabic' ? (mp3QuranData as any[])[selectedReciter]?.name : selectedLang.toUpperCase()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Track Info */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                                    {current?.nameTrans || current?.translation || current?.english_name || 'Loading...'}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 text-lg">
                                    {current?.nameMl || current?.name || ''}
                                </p>
                            </div>

                            {/* Progress */}
                            <div className="mb-8">
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) ${(currentTime / (duration || 1)) * 100}%, rgb(226 232 240) ${(currentTime / (duration || 1)) * 100}%, rgb(226 232 240) 100%)`
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Main Controls */}
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <button
                                    onClick={cycleMode}
                                    className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
                                    title={mode}
                                >
                                    {getModeIcon()}
                                </button>

                                <button
                                    onClick={handlePrev}
                                    className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
                                >
                                    <SkipBack className="w-6 h-6" fill="currentColor" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110"
                                >
                                    {isPlaying ? <Pause className="w-9 h-9" fill="currentColor" /> : <Play className="w-9 h-9 ml-1" fill="currentColor" />}
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
                                >
                                    <SkipForward className="w-6 h-6" fill="currentColor" />
                                </button>

                                <button
                                    onClick={download}
                                    className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all hover:scale-105"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Secondary Controls */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {/* Volume */}
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3">
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-slate-600 dark:text-slate-300">
                                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Speed */}
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3">
                                    <Gauge className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    <select
                                        value={speed}
                                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                        className="flex-1 bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                                    >
                                        <option value="0.5">0.5x</option>
                                        <option value="0.75">0.75x</option>
                                        <option value="1">1x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="2">2x</option>
                                    </select>
                                </div>
                            </div>

                            {/* Browse Button */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Music className="w-5 h-5" />
                                Browse All Surahs
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal - Chapter List */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Select Surah</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Language/Reciter Selector */}
                            <div className="space-y-3">
                                <select
                                    value={selectedLang}
                                    onChange={(e) => {
                                        setSelectedLang(e.target.value as any);
                                        setCurrentIndex(0);
                                        setIsPlaying(false);
                                    }}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="malayalam">🇮🇳 Malayalam Translation</option>
                                    <option value="tamil">🇮🇳 Tamil Translation</option>
                                    <option value="arabic">🇸🇦 Arabic Recitation</option>
                                </select>

                                {selectedLang === 'arabic' && (
                                    <select
                                        value={selectedReciter}
                                        onChange={(e) => {
                                            setSelectedReciter(parseInt(e.target.value));
                                            setCurrentIndex(0);
                                            setIsPlaying(false);
                                        }}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {(mp3QuranData as any[]).map((r: any, i: number) => (
                                            <option key={i} value={i}>🎙️ {r.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Chapter List */}
                        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-2">
                            {chapters.map((ch, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setCurrentIndex(idx);
                                        setShowModal(false);
                                        setIsPlaying(false);
                                        setTimeout(() => {
                                            audioRef.current?.play();
                                            setIsPlaying(true);
                                        }, 100);
                                    }}
                                    className={`w-full p-4 rounded-2xl text-left transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-[0.98] mb-2 ${currentIndex === idx
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                                        : 'bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`text-2xl font-bold ${currentIndex === idx ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {ch.index || ch.id || idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-lg truncate">{ch.nameTrans || ch.translation || ch.english_name}</p>
                                            <p className={`text-sm truncate ${currentIndex === idx ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {ch.nameMl || ch.name}
                                            </p>
                                        </div>
                                        {currentIndex === idx && isPlaying && (
                                            <div className="flex gap-0.5 items-center">
                                                <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
                                                <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Audio Element - Only render if we have a valid URL */}
            {audioUrl && (
                <audio ref={audioRef} src={audioUrl} preload="metadata" />
            )}
        </>
    );
};
