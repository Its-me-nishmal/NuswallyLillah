import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, X, BookOpen, FileText, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Shortcut {
    id: string;
    title: string;
    type: 'quran' | 'library';
    path: string;
    icon?: string;
}

interface ShortcutsProps {
    onNavigate?: (type: string, path: string) => void;
}

const QURAN_SURAHS = [
    { name: 'Al-Kahf', path: '/dex/quran/alkahf.pdf' },
    { name: 'Yaseen', path: '/dex/quran/yaseen.pdf' },
    { name: 'Ar-Rahman', path: '/dex/quran/arrahmaan.pdf' },
    { name: 'Al-Mulk', path: '/dex/quran/almulk.pdf' },
    { name: 'Al-Waqia', path: '/dex/quran/vaaqia.pdf' },
    { name: 'Ad-Dukhaan', path: '/dex/quran/addukhaan.pdf' },
    { name: 'Al-Hashr', path: '/dex/quran/alhashr.pdf' },
    { name: 'As-Sajda', path: '/dex/quran/assajada.pdf' },
    { name: 'Ayats', path: '/dex/quran/ayats.pdf' },
];

const LIBRARY_BOOKS = [
    // Malappatt
    { name: 'Muhyidheen Mala', path: '/dex/malappatt/muhyidheenMala.pdf' },
    { name: 'Nafeesath Mala', path: '/dex/malappatt/nafeesathMala.pdf' },
    { name: 'Rifaaee Mala', path: '/dex/malappatt/rifaaeeMala.pdf' },
    // Moulid
    { name: 'Ajmeer Moulid', path: '/dex/moulid/AjmeerMoulid.pdf' },
    { name: 'Badr Moulid', path: '/dex/moulid/BadrMoulid.pdf' },
    { name: 'CM Moulid', path: '/dex/moulid/cmMoulid.pdf' },
    { name: 'Yaseen', path: '/dex/moulid/Manqool.pdf' },
    // Baith
    { name: 'Burda', path: '/dex/baith/burda.pdf' },
    { name: 'Dars', path: '/dex/baith/dars.pdf' },
    { name: 'Asmaul Husna', path: '/dex/baith/AsmaaulHusna.pdf' },
    // Dua
    { name: 'Hizbul Bahar', path: '/dex/dua/hizbul-bahar.pdf' },
    { name: 'Kanzul Arsh', path: '/dex/dua/kanzularsh.pdf' },
    { name: 'Common Dua', path: '/dex/dua/commondua.pdf' },
    // Raatheeb
    { name: 'Haddad', path: '/dex/raatheeb/Haddad.pdf' },
    { name: 'Rifaaee Ratheeb', path: '/dex/raatheeb/Rifaaee.pdf' },
];

const ALL_OPTIONS = [
    ...QURAN_SURAHS.map(s => ({ ...s, type: 'quran' as const })),
    ...LIBRARY_BOOKS.map(b => ({ ...b, type: 'library' as const })),
];

export const Shortcuts: React.FC<ShortcutsProps> = ({ onNavigate }) => {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Load shortcuts from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('user-shortcuts');
        if (stored) {
            try {
                setShortcuts(JSON.parse(stored));
            } catch (error) {
                console.error('Failed to load shortcuts:', error);
            }
        }
    }, []);

    // Save shortcuts to localStorage
    const saveShortcuts = (newShortcuts: Shortcut[]) => {
        setShortcuts(newShortcuts);
        localStorage.setItem('user-shortcuts', JSON.stringify(newShortcuts));
    };

    // Add shortcut
    const addShortcut = (option: { name: string; path: string; type: 'quran' | 'library' }) => {
        const newShortcut: Shortcut = {
            id: Date.now().toString(),
            title: option.name,
            type: option.type,
            path: option.path,
        };
        saveShortcuts([...shortcuts, newShortcut]);
        setIsAddMode(false);
        setSearchQuery('');
    };

    // Remove shortcut
    const removeShortcut = (id: string) => {
        saveShortcuts(shortcuts.filter(s => s.id !== id));
    };

    // Filter options for search
    const filteredOptions = ALL_OPTIONS.filter(opt =>
        opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleShortcutClick = (shortcut: Shortcut) => {
        if (onNavigate) {
            onNavigate(shortcut.type, shortcut.path);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                        <Bookmark className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Quick Access</h3>
                </div>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isAddMode
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400'
                        : 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40'
                        }`}
                >
                    {isAddMode ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isAddMode ? (
                    <motion.div
                        key="add-mode"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search Quran or Books..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            autoFocus
                        />

                        {/* Options List */}
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                            {filteredOptions.map((option, idx) => {
                                const alreadyAdded = shortcuts.some(s => s.path === option.path);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => !alreadyAdded && addShortcut(option)}
                                        disabled={alreadyAdded}
                                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${alreadyAdded
                                            ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/30'
                                            : 'hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-600 dark:text-slate-300'
                                            }`}
                                    >
                                        {option.type === 'quran' ? (
                                            <BookOpen className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-blue-500" />
                                        )}
                                        <span className="flex-1 truncate">{option.name}</span>
                                        {alreadyAdded && <Check className="w-4 h-4 text-green-500" />}
                                    </button>
                                );
                            })}
                            {filteredOptions.length === 0 && (
                                <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
                                    No results found
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="shortcuts-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                    >
                        {shortcuts.length === 0 ? (
                            <div className="text-center py-6">
                                <Bookmark className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                <p className="text-xs text-slate-400 dark:text-slate-500">No shortcuts yet</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                    Click + to add quick access
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {shortcuts.map((shortcut) => (
                                    <motion.div
                                        key={shortcut.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="group flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all cursor-pointer"
                                        onClick={() => handleShortcutClick(shortcut)}
                                    >
                                        {shortcut.type === 'quran' ? (
                                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        )}
                                        <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                            {shortcut.title}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeShortcut(shortcut.id);
                                            }}
                                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-all flex-shrink-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
