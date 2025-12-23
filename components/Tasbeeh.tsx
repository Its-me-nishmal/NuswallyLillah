
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, History, ChevronDown, Check, X, Smartphone, SmartphoneNfc, Plus, Trash2, Edit2, Save } from 'lucide-react';

interface DhikrPreset {
    id: string;
    label: string;
    arabic: string;
    target: number;
    isCustom?: boolean;
}

interface TasbeehSession {
    id: string;
    presetLabel: string;
    count: number;
    date: string;
}

const DEFAULT_PRESETS: DhikrPreset[] = [
    { id: 'subhanallah', label: 'SubhanAllah', arabic: 'سُبْحَانَ ٱللَّٰهِ', target: 33 },
    { id: 'alhamdulillah', label: 'Alhamdulillah', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', target: 33 },
    { id: 'allahuakbar', label: 'Allahu Akbar', arabic: 'ٱللَّٰهُ أَكْبَرُ', target: 34 },
    { id: 'istighfar', label: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ', target: 100 },
    { id: 'kalima', label: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', target: 100 },
    { id: 'salawat', label: 'Salawat', arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', target: 100 },
    { id: 'free', label: 'Open Counter', arabic: 'ذِكْر', target: 0 }, // 0 = Infinite
];

export const Tasbeeh: React.FC = () => {
    // --- Core State ---
    const [count, setCount] = useState(0);
    const [lap, setLap] = useState(0);
    const [totalLifetime, setTotalLifetime] = useState(0);

    // --- Data State ---
    const [presets, setPresets] = useState<DhikrPreset[]>(DEFAULT_PRESETS);
    const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(DEFAULT_PRESETS[0]);
    const [history, setHistory] = useState<TasbeehSession[]>([]);

    // --- UI/Settings State ---
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrateEnabled, setVibrateEnabled] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [showPresets, setShowPresets] = useState(false);

    // --- Modal Form State ---
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', label: '', arabic: '', target: 33 });

    // Refs for audio
    const clickSound = useRef<HTMLAudioElement | null>(null);
    const completeSound = useRef<HTMLAudioElement | null>(null);

    // --- Initialization ---
    useEffect(() => {
        clickSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3');
        clickSound.current.volume = 0.3;

        completeSound.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3');
        completeSound.current.volume = 0.4;

        // Load Data
        const savedCount = localStorage.getItem('tasbeeh_current_count');
        const savedPresetId = localStorage.getItem('tasbeeh_preset_id');
        const savedHistory = localStorage.getItem('tasbeeh_history');
        const savedTotal = localStorage.getItem('tasbeeh_total_lifetime');
        const savedLap = localStorage.getItem('tasbeeh_lap');
        const savedCustomPresets = localStorage.getItem('tasbeeh_custom_presets');

        // Restore Presets
        let currentPresets = [...DEFAULT_PRESETS];
        if (savedCustomPresets) {
            try {
                const custom = JSON.parse(savedCustomPresets);
                currentPresets = [...DEFAULT_PRESETS, ...custom];
                setPresets(currentPresets);
            } catch (e) {
                console.error("Failed to parse custom presets", e);
            }
        }

        if (savedCount) setCount(parseInt(savedCount));
        if (savedLap) setLap(parseInt(savedLap));
        if (savedTotal) setTotalLifetime(parseInt(savedTotal));

        if (savedPresetId) {
            const found = currentPresets.find(p => p.id === savedPresetId);
            if (found) setSelectedPreset(found);
        }

        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    // --- Persistence ---
    useEffect(() => {
        localStorage.setItem('tasbeeh_current_count', count.toString());
        localStorage.setItem('tasbeeh_lap', lap.toString());
        localStorage.setItem('tasbeeh_total_lifetime', totalLifetime.toString());
        localStorage.setItem('tasbeeh_preset_id', selectedPreset.id);
        localStorage.setItem('tasbeeh_history', JSON.stringify(history));
    }, [count, lap, totalLifetime, selectedPreset, history]);

    // Persist custom presets whenever they change
    useEffect(() => {
        const customOnly = presets.filter(p => p.isCustom);
        localStorage.setItem('tasbeeh_custom_presets', JSON.stringify(customOnly));
    }, [presets]);

    // --- Interaction Handlers ---
    const handleTap = () => {
        const newCount = count + 1;
        setCount(newCount);
        setTotalLifetime(prev => prev + 1);

        if (soundEnabled && clickSound.current) {
            clickSound.current.currentTime = 0;
            clickSound.current.play().catch(() => { });
        }
        if (vibrateEnabled && navigator.vibrate) {
            navigator.vibrate(15);
        }

        if (selectedPreset.target > 0 && newCount === selectedPreset.target) {
            handleCycleComplete();
        }
    };

    const handleCycleComplete = () => {
        if (soundEnabled && completeSound.current) {
            completeSound.current.currentTime = 0;
            completeSound.current.play().catch(() => { });
        }
        if (vibrateEnabled && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }

        // Add to History
        const newSession: TasbeehSession = {
            id: Date.now().toString(),
            presetLabel: selectedPreset.label,
            count: selectedPreset.target,
            date: new Date().toLocaleString()
        };
        setHistory(prev => [newSession, ...prev].slice(0, 50));
        setLap(prev => prev + 1);

        // We do NOT reset count automatically to allow continuing if desired, 
        // or users can hit reset. The loop animation completes at target.
        // But typically tasbeeh resets. Let's reset for better UX flow.
        setTimeout(() => setCount(0), 300); // Slight delay to see the full circle
    };

    const handleReset = () => {
        if (window.confirm("Reset current counter and laps?")) {
            setCount(0);
            setLap(0);
        }
    };

    const changePreset = (preset: DhikrPreset) => {
        setSelectedPreset(preset);
        setCount(0);
        setLap(0);
        setShowPresets(false);
    };

    // --- CRUD Handlers ---
    const openAddForm = () => {
        setFormData({ id: '', label: '', arabic: '', target: 33 });
        setIsEditing(false);
        setShowForm(true);
        setShowPresets(false);
    };

    const openEditForm = (e: React.MouseEvent, preset: DhikrPreset) => {
        e.stopPropagation();
        setFormData({
            id: preset.id,
            label: preset.label,
            arabic: preset.arabic,
            target: preset.target
        });
        setIsEditing(true);
        setShowForm(true);
        setShowPresets(false);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Delete this preset?")) {
            const newPresets = presets.filter(p => p.id !== id);
            setPresets(newPresets);
            // If we deleted the active one, switch to default
            if (selectedPreset.id === id) {
                changePreset(DEFAULT_PRESETS[0]);
            }
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            setPresets(prev => prev.map(p => p.id === formData.id ? { ...formData, isCustom: true } : p));
            if (selectedPreset.id === formData.id) {
                setSelectedPreset({ ...formData, isCustom: true });
            }
        } else {
            const newPreset: DhikrPreset = {
                ...formData,
                id: Date.now().toString(),
                isCustom: true
            };
            setPresets(prev => [...prev, newPreset]);
            changePreset(newPreset);
        }
        setShowForm(false);
    };

    // --- Visual Calculations ---
    // Ensure the circle is always a perfect circle and responsive
    const radius = 120;
    const strokeWidth = 16;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // CLAMP PERCENTAGE at 100 to prevent visual glitching when count > target
    const rawPercentage = selectedPreset.target > 0 ? (count / selectedPreset.target) * 100 : 0;
    const visualPercentage = Math.min(rawPercentage, 100);

    const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col relative overflow-hidden animate-in fade-in duration-500">

            {/* --- Top Bar --- */}
            <div className="flex justify-between items-center px-4 py-4 relative z-20">
                <div className="relative">
                    <button
                        onClick={() => setShowPresets(!showPresets)}
                        className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-100 dark:border-emerald-900/30 px-4 py-2.5 rounded-2xl shadow-sm text-slate-800 dark:text-white font-bold hover:bg-white dark:hover:bg-slate-900 transition-all ring-1 ring-emerald-50 dark:ring-emerald-900/20"
                    >
                        <span className="text-sm">{selectedPreset.label}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showPresets && (
                        <div className="absolute top-14 left-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/30 p-2 z-50 animate-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto flex flex-col">
                            <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 p-2 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Dhikr</span>
                                <button
                                    onClick={openAddForm}
                                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                >
                                    <Plus className="w-3 h-3" /> New
                                </button>
                            </div>

                            <div className="py-2 space-y-1">
                                {presets.map(p => (
                                    <div
                                        key={p.id}
                                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${selectedPreset.id === p.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        onClick={() => changePreset(p)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedPreset.id === p.id ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-medium truncate ${selectedPreset.id === p.id ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {p.label}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">Target: {p.target > 0 ? p.target : '∞'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {p.isCustom && (
                                                <>
                                                    <button
                                                        onClick={(e) => openEditForm(e, p)}
                                                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(e, p.id)}
                                                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                            {selectedPreset.id === p.id && !p.isCustom && <Check className="w-4 h-4 text-emerald-500 ml-2" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHistory(true)}
                        className="p-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/5 rounded-xl hover:bg-white dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm"
                    >
                        <History className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* --- Main Circular Interface --- */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 min-h-[300px]">

                {/* Stats Stats */}
                <div className="flex justify-between w-full max-w-[280px] mb-6 absolute top-4 md:top-8 md:relative">
                    <div className="text-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Laps</span>
                        <span className="text-xl font-bold text-slate-800 dark:text-white bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-xl border border-white/60 dark:border-white/5">{lap}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Total</span>
                        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 px-3 py-1 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">{totalLifetime.toLocaleString()}</span>
                    </div>
                </div>

                {/* The SVG Circle Button */}
                <div className="relative group cursor-pointer touch-none select-none" onClick={handleTap} style={{ WebkitTapHighlightColor: 'transparent' }}>
                    {/* Progress SVG Container */}
                    <div className="w-[300px] h-[300px] md:w-[360px] md:h-[360px] relative transition-all duration-300">
                        <svg
                            className="w-full h-full transform -rotate-90 drop-shadow-2xl"
                            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                        >
                            {/* Background Track */}
                            <circle
                                cx={radius} cy={radius} r={normalizedRadius}
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                className="opacity-30 text-slate-200 dark:text-slate-800"
                            />
                            {/* Active Progress */}
                            {selectedPreset.target > 0 && (
                                <circle
                                    cx={radius} cy={radius} r={normalizedRadius}
                                    stroke="url(#gradient)"
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-[stroke-dashoffset] duration-300 ease-out"
                                />
                            )}
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Inner Content (Visual Only) */}
                        <div className="absolute inset-4 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border border-white dark:border-slate-800 group-active:scale-[0.98] transition-transform duration-100 z-10">
                            <div className="flex flex-col items-center justify-center p-8 text-center w-full h-full rounded-full">
                                <p className="font-quran text-2xl md:text-3xl text-slate-400 dark:text-slate-500 mb-2 opacity-80 leading-relaxed max-w-[80%]">
                                    {selectedPreset.arabic}
                                </p>
                                <h1 className="text-7xl md:text-8xl font-bold text-slate-800 dark:text-white tracking-tighter tabular-nums leading-none">
                                    {count}
                                </h1>
                                <div className="mt-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        {selectedPreset.target > 0 ? `Target: ${selectedPreset.target}` : 'Infinity Mode'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ripple Animation Container */}
                    <div className="absolute inset-6 rounded-full border-4 border-emerald-400 opacity-0 group-active:animate-ping pointer-events-none z-0"></div>
                </div>

                <p className="mt-6 text-xs text-emerald-600/60 dark:text-emerald-400/60 font-medium animate-pulse hidden md:block">
                    Tap circle to count
                </p>
            </div>

            {/* --- Bottom Controls --- */}
            <div className="flex justify-center items-center gap-6 pb-8 pt-4 relative z-20">
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-4 rounded-2xl transition-all duration-300 border ${soundEnabled ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                <button
                    onClick={handleReset}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-xl hover:scale-105 hover:text-red-500 dark:hover:text-red-400 text-slate-400 dark:text-slate-500 transition-all group"
                >
                    <RotateCcw className="w-6 h-6 group-hover:-rotate-180 transition-transform duration-500" />
                </button>

                <button
                    onClick={() => setVibrateEnabled(!vibrateEnabled)}
                    className={`p-4 rounded-2xl transition-all duration-300 border ${vibrateEnabled ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                    {vibrateEnabled ? <SmartphoneNfc className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </button>
            </div>

            {/* --- Modals --- */}

            {/* 1. History Modal */}
            {showHistory && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">History Log</h2>
                        <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {history.length === 0 ? (
                            <div className="text-center text-slate-400 dark:text-slate-600 mt-20 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                    <History className="w-8 h-8 opacity-20" />
                                </div>
                                <p>No completed sessions yet.</p>
                            </div>
                        ) : (
                            history.map((session) => (
                                <div key={session.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">{session.presetLabel}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{session.date}</p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold px-3 py-1 rounded-lg text-sm">
                                        {session.count}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                            <span>Lifetime Total</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{totalLifetime.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Add/Edit Form Modal */}
            {showForm && (
                <div className="absolute inset-0 bg-black/20 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-600 text-white">
                            <h3 className="font-bold text-lg">{isEditing ? 'Edit Dhikr' : 'New Dhikr'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Label (English)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g. SubhanAllah"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Arabic Text (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.arabic}
                                    onChange={e => setFormData({ ...formData, arabic: e.target.value })}
                                    placeholder="e.g. سُبْحَانَ ٱللَّٰهِ"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-quran text-right text-slate-800 dark:text-white"
                                    dir="rtl"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Count</label>
                                <div className="flex gap-2">
                                    {[33, 100, 0].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, target: val })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border ${formData.target === val ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                                        >
                                            {val === 0 ? '∞' : val}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.target}
                                        onChange={e => setFormData({ ...formData, target: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 dark:text-white"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-bold">COUNT</span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-4 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};
