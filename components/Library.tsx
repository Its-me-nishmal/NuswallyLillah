import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ChevronRight, ArrowLeft, FileText, X, ChevronLeft, ZoomIn, ZoomOut, Library as LibraryIcon, Search, Sparkles } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker using Vite's URL handling for maximum compatibility
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

// Types
type Category = 'Malappatt' | 'Raatheeb' | 'Swalath' | 'Moulid' | 'Baith' | 'Dua' | 'Other' | 'Quran';

interface Asset {
    id: string; // Changed to string for flexibility
    title: string;
    category: Category;
    path: string;
}

// Helper to format title from filename
const formatTitle = (filename: string) => {
    return filename.replace('.pdf', '')
        .replace(/([A-Z])/g, ' $1') // Add space before caps
        .replace(/[-_]/g, ' ') // Replace underscores/hyphens
        .trim();
};

// Data
const ASSETS: Asset[] = [
    // Malappatt
    { id: '1', title: 'Muhyidheen Mala', category: 'Malappatt', path: '/dex/malappatt/muhyidheenMala.pdf' },
    { id: '2', title: 'Nafeesath Mala', category: 'Malappatt', path: '/dex/malappatt/nafeesathMala.pdf' },
    { id: '3', title: 'Rifaaee Mala', category: 'Malappatt', path: '/dex/malappatt/rifaaeeMala.pdf' },

    // Moulid
    { id: '4', title: 'Ajmeer Moulid', category: 'Moulid', path: '/dex/moulid/AjmeerMoulid.pdf' },
    { id: '5', title: 'Badr Moulid', category: 'Moulid', path: '/dex/moulid/BadrMoulid.pdf' },
    { id: '6', title: 'CM Moulid', category: 'Moulid', path: '/dex/moulid/cmMoulid.pdf' },
    { id: '7', title: 'Davoodul Hakeem', category: 'Moulid', path: '/dex/moulid/Davoodulhakeem.pdf' },
    { id: '8', title: 'Mamburam', category: 'Moulid', path: '/dex/moulid/Mamburam.pdf' },
    { id: '9', title: 'Manqool', category: 'Moulid', path: '/dex/moulid/Manqool.pdf' },
    { id: '10', title: 'Manqoos', category: 'Moulid', path: '/dex/moulid/Manqoos.pdf' },
    { id: '11', title: 'Muhiyidheen Moulid', category: 'Moulid', path: '/dex/moulid/MuhiyidheenMoulid.pdf' },
    { id: '12', title: 'Rifaaee Moulid', category: 'Moulid', path: '/dex/moulid/RifaaeeMo.pdf' },
    { id: '13', title: 'Shamsul Ulama', category: 'Moulid', path: '/dex/moulid/ShamsulUlamaMaulid.pdf' },
    { id: '14', title: 'Sharafal Anam', category: 'Moulid', path: '/dex/moulid/SharafalAnam.pdf' },

    // Baith
    { id: '15', title: 'Alfa', category: 'Baith', path: '/dex/baith/alfa.pdf' },
    { id: '16', title: 'Aqsam', category: 'Baith', path: '/dex/baith/aqsam.pdf' },
    { id: '17', title: 'Ashraqa', category: 'Baith', path: '/dex/baith/ashraqa.pdf' },
    { id: '18', title: 'Asmaul Husna', category: 'Baith', path: '/dex/baith/AsmaaulHusna.pdf' },
    { id: '19', title: 'Burda', category: 'Baith', path: '/dex/baith/burda.pdf' },
    { id: '20', title: 'Dars', category: 'Baith', path: '/dex/baith/dars.pdf' },
    { id: '21', title: 'Dikrullah', category: 'Baith', path: '/dex/baith/dikrllah.pdf' },
    { id: '22', title: 'Davoodul Hakeem Baith', category: 'Baith', path: '/dex/baith/dvdlhakm.pdf' },
    { id: '23', title: 'HBNB', category: 'Baith', path: '/dex/baith/hbnb.pdf' },
    { id: '24', title: 'Qaseeda Muhammadiya', category: 'Baith', path: '/dex/baith/qsdmhmdya.pdf' },
    { id: '25', title: 'Salam', category: 'Baith', path: '/dex/baith/salam.pdf' },
    { id: '26', title: 'Yaa Sayyidee', category: 'Baith', path: '/dex/baith/yasydi.pdf' },
    { id: '27', title: 'Yaa Akram', category: 'Baith', path: '/dex/baith/ykrama.pdf' },

    // Dua
    { id: '28', title: 'Bank Dua', category: 'Dua', path: '/dex/dua/bank.pdf' },
    { id: '29', title: 'Common Dua', category: 'Dua', path: '/dex/dua/commondua.pdf' },
    { id: '30', title: 'Dua Al Karb', category: 'Dua', path: '/dex/dua/dua-al-karb.pdf' },
    { id: '31', title: 'Hizbul Bahar', category: 'Dua', path: '/dex/dua/hizbul-bahar.pdf' },
    { id: '32', title: 'Hizbun Nasr', category: 'Dua', path: '/dex/dua/hizbunnasr.pdf' },
    { id: '33', title: 'Kanzul Arsh', category: 'Dua', path: '/dex/dua/kanzularsh.pdf' },
    { id: '34', title: 'Noorul Eemaan', category: 'Dua', path: '/dex/dua/nooruleemaan.pdf' },
    { id: '35', title: 'Qabar Dua', category: 'Dua', path: '/dex/dua/qabar.pdf' },
    { id: '36', title: 'Quran Dua', category: 'Dua', path: '/dex/dua/quran.pdf' },
    { id: '37', title: 'Tharaveeh', category: 'Dua', path: '/dex/dua/tharaveeh.pdf' },
    { id: '38', title: 'Travell', category: 'Dua', path: '/dex/dua/travell.pdf' },
    { id: '39', title: 'Virdullatheef', category: 'Dua', path: '/dex/dua/virdullatheef.pdf' },
    { id: '40', title: 'Vuzu', category: 'Dua', path: '/dex/dua/vuzu.pdf' },

    // Swalath
    { id: '41', title: 'Aizamu Swalath', category: 'Swalath', path: '/dex/swalath/AizamuSwalath.pdf' },
    { id: '42', title: 'Aurad Majlis', category: 'Swalath', path: '/dex/swalath/AuradmajlisSwalath.pdf' },
    { id: '43', title: 'Friday Swalath', category: 'Swalath', path: '/dex/swalath/fridayswalath.pdf' },
    { id: '44', title: 'Munajath', category: 'Swalath', path: '/dex/swalath/munajath.pdf' },
    { id: '45', title: 'Nariyath Swalath', category: 'Swalath', path: '/dex/swalath/nariyathSwalath.pdf' },
    { id: '46', title: 'Swalathul Munjiyath', category: 'Swalath', path: '/dex/swalath/swalathul munjiyath.pdf' },
    { id: '47', title: 'Swalathu Thaj', category: 'Swalath', path: '/dex/swalath/SwalathuThaj.pdf' },

    // Raatheeb
    { id: '48', title: 'Asmaul Husna', category: 'Raatheeb', path: '/dex/raatheeb/AsmasulHusna.pdf' },
    { id: '49', title: 'Haddad', category: 'Raatheeb', path: '/dex/raatheeb/Haddad.pdf' },
    { id: '50', title: 'Jalaliyya', category: 'Raatheeb', path: '/dex/raatheeb/jalaliyya.pdf' },
    { id: '51', title: 'Muhiyidheen Ratheeb', category: 'Raatheeb', path: '/dex/raatheeb/MuhiyidheenRatheeb.pdf' },
    { id: '52', title: 'Pookkoya Thangal', category: 'Raatheeb', path: '/dex/raatheeb/pookkoyathangal.pdf' },
    { id: '53', title: 'Quthubiyath', category: 'Raatheeb', path: '/dex/raatheeb/Quthubiyath.pdf' },
    { id: '54', title: 'Rifaaee', category: 'Raatheeb', path: '/dex/raatheeb/Rifaaee.pdf' },

    // Other
    { id: '55', title: 'Asmaul Badar', category: 'Other', path: '/dex/other/asmaulBadar.pdf' },
    { id: '56', title: 'Asmaul Husna', category: 'Other', path: '/dex/other/asmaulhusna.pdf' },
    { id: '57', title: 'Khuthubathu Nikkah', category: 'Other', path: '/dex/other/KhuthubathuNikkah.pdf' },
    { id: '58', title: 'Maashira', category: 'Other', path: '/dex/other/maashira.pdf' },
    { id: '59', title: 'Mayyith', category: 'Other', path: '/dex/other/mayyith.pdf' },
    { id: '60', title: 'Sayyidhul Isthigfar', category: 'Other', path: '/dex/other/sayyidhulIsthigfar.pdf' },
    { id: '61', title: 'Thalqeen', category: 'Other', path: '/dex/other/thalqeen.pdf' },
    { id: '62', title: 'Thasbeeh', category: 'Other', path: '/dex/other/thasbeeh.pdf' },

    // Quran
    { id: '63', title: 'Ad-Dukhaan', category: 'Quran', path: '/dex/quran/addukhaan.pdf' },
    { id: '64', title: 'Al-Hashr', category: 'Quran', path: '/dex/quran/alhashr.pdf' },
    { id: '65', title: 'Al-Kahf', category: 'Quran', path: '/dex/quran/alkahf.pdf' },
    { id: '66', title: 'Al-Mulk', category: 'Quran', path: '/dex/quran/almulk.pdf' },
    { id: '67', title: 'Ar-Rahmaan', category: 'Quran', path: '/dex/quran/arrahmaan.pdf' },
    { id: '68', title: 'As-Sajada', category: 'Quran', path: '/dex/quran/assajada.pdf' },
    { id: '69', title: 'Ayats', category: 'Quran', path: '/dex/quran/ayats.pdf' },
    { id: '70', title: 'Vaaqia', category: 'Quran', path: '/dex/quran/vaaqia.pdf' },
    { id: '71', title: 'Yaseen', category: 'Quran', path: '/dex/quran/yaseen.pdf' },
];

const CATEGORIES: { id: Category; label: string; count: number; color: string }[] = [
    { id: 'Malappatt', label: 'Malappatt', count: ASSETS.filter(a => a.category === 'Malappatt').length, color: 'from-emerald-400 to-teal-500' },
    { id: 'Raatheeb', label: 'Raatheeb', count: ASSETS.filter(a => a.category === 'Raatheeb').length, color: 'from-blue-400 to-indigo-500' },
    { id: 'Swalath', label: 'Swalath', count: ASSETS.filter(a => a.category === 'Swalath').length, color: 'from-violet-400 to-purple-500' },
    { id: 'Moulid', label: 'Moulid', count: ASSETS.filter(a => a.category === 'Moulid').length, color: 'from-fuchsia-400 to-pink-500' },
    { id: 'Baith', label: 'Baith', count: ASSETS.filter(a => a.category === 'Baith').length, color: 'from-rose-400 to-red-500' },
    { id: 'Dua', label: 'Dua', count: ASSETS.filter(a => a.category === 'Dua').length, color: 'from-orange-400 to-amber-500' },
    { id: 'Quran', label: 'Quran', count: ASSETS.filter(a => a.category === 'Quran').length, color: 'from-teal-400 to-green-500' },
    { id: 'Other', label: 'Other', count: ASSETS.filter(a => a.category === 'Other').length, color: 'from-slate-400 to-gray-500' },
];

export const Library = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [activePdf, setActivePdf] = useState<Asset | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(1.0);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Filter assets by category AND search query
    const filteredAssets = ASSETS.filter(a => {
        const matchesCategory = activeCategory ? a.category === activeCategory : true;
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Get count for each category considering search
    const getCategoryCount = (catId: Category) => {
        return ASSETS.filter(a => a.category === catId &&
            (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.category.toLowerCase().includes(searchQuery.toLowerCase()))).length;
    };

    const resetSelection = () => {
        setActivePdf(null);
        setActiveCategory(null);
        setScale(1.0);
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    useEffect(() => {
        if (activePdf) {
            setLoading(true);
            setNumPages(null); // Reset numPages
        }
    }, [activePdf]);

    // Listen for shortcut navigation events
    useEffect(() => {
        const handleOpenPdf = (event: any) => {
            const { path } = event.detail;
            // Find the asset by path
            const asset = ASSETS.find(a => a.path === path);
            if (asset) {
                setIsOpen(true);
                setActivePdf(asset);
                // Determine the category
                setActiveCategory(asset.category);
            }
        };

        window.addEventListener('openLibraryPdf', handleOpenPdf);
        return () => {
            window.removeEventListener('openLibraryPdf', handleOpenPdf);
        };
    }, []);

    return (
        <>
            {/* Dashboard Entry Point - Modern Gradient Card (Kept Colorful) */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(true)}
                className="neumorphic-card w-full h-full p-2 md:p-4 flex flex-row md:flex-row items-center justify-between md:justify-start min-h-[60px] md:min-h-[90px] group"
            >
                <div className="flex flex-row items-center justify-between w-full h-full">
                    <div className="text-left flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-slate-700 dark:text-slate-200 tracking-tight leading-none truncate">Library</h3>
                        <p className="text-emerald-600 dark:text-emerald-400 text-[10px] md:text-xs font-medium mt-0.5 leading-tight truncate">Books & Duas</p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Book className="w-5 h-5" />
                    </div>
                </div>
            </motion.button>

            {/* Full Screen Library Overlay - Light Theme */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        // Adaptive Gradient Background
                        className="fixed inset-0 z-40 bg-gradient-to-br from-[#F0FDF4] via-[#F5F3FF] to-[#ECFEFF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col pt-safe-top"
                    >
                        {/* Header - Light & Glassmorphic */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/50 dark:border-white/5 sticky top-0 z-20 shadow-sm">
                            <div className="flex items-center gap-4">
                                {activePdf && (
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => setActivePdf(null)}
                                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </motion.button>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                                        {activePdf ? activePdf.title : 'Library'}
                                    </h2>
                                    {activePdf && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reading Mode</p>}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    resetSelection();
                                }}
                                className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 dark:text-rose-400 flex items-center justify-center transition-colors border border-rose-100 dark:border-rose-900/30 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                                {!activePdf ? (
                                    <>
                                        {/* Search Bar - Modern & Accessible */}
                                        <div className="relative mb-8">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Search className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search by title or category..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Category Chips - Horizontal at Top */}
                                        <motion.div
                                            className="flex flex-wrap gap-2 mb-8 no-scrollbar overflow-x-auto pb-2"
                                            initial="hidden"
                                            animate="visible"
                                            variants={{
                                                hidden: { opacity: 0 },
                                                visible: {
                                                    opacity: 1,
                                                    transition: {
                                                        staggerChildren: 0.05
                                                    }
                                                }
                                            }}
                                        >
                                            <motion.button
                                                variants={{
                                                    hidden: { opacity: 0, y: -10 },
                                                    visible: { opacity: 1, y: 0 }
                                                }}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setActiveCategory(null)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!activeCategory
                                                    ? 'bg-emerald-500 text-white shadow-lg'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                                                    }`}
                                            >
                                                All
                                            </motion.button>
                                            {CATEGORIES.map((cat) => (
                                                <motion.button
                                                    key={cat.id}
                                                    variants={{
                                                        hidden: { opacity: 0, y: -10 },
                                                        visible: { opacity: 1, y: 0 }
                                                    }}
                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setActiveCategory(cat.id)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id
                                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                                                        }`}
                                                >
                                                    {cat.label} ({getCategoryCount(cat.id)})
                                                </motion.button>
                                            ))}
                                        </motion.div>

                                        {/* Files List Below */}
                                        <AnimatePresence mode="wait">
                                            {activeCategory ? (
                                                <motion.div
                                                    key={activeCategory}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-3"
                                                >
                                                    <motion.h3
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-lg font-bold text-slate-800 dark:text-white mb-4"
                                                    >
                                                        {CATEGORIES.find(c => c.id === activeCategory)?.label} Files ({filteredAssets.length})
                                                    </motion.h3>
                                                    {filteredAssets.map((asset, i) => (
                                                        <motion.button
                                                            key={asset.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                                            whileHover={{ scale: 1.02, x: 4 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setActivePdf(asset)}
                                                            className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/30 hover:border-emerald-200 dark:hover:border-slate-600/50 hover:shadow-lg transition-all text-left group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <motion.div
                                                                    whileHover={{ rotate: 5 }}
                                                                    className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                                                                >
                                                                    <FileText className="w-5 h-5" />
                                                                </motion.div>
                                                                <div>
                                                                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors block">{asset.title}</span>
                                                                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">PDF Document</span>
                                                                </div>
                                                            </div>
                                                            <motion.div
                                                                whileHover={{ x: 4 }}
                                                                className="p-2 rounded-full bg-slate-50 dark:bg-slate-700/50 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-slate-400 dark:text-slate-500 transition-all"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </motion.div>
                                                        </motion.button>
                                                    ))}
                                                    {filteredAssets.length === 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500"
                                                        >
                                                            <LibraryIcon className="w-16 h-16 mb-4 opacity-20" />
                                                            <p>No files available in this category</p>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="flex flex-col items-center justify-center py-20 text-center"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6"
                                                    >
                                                        <LibraryIcon className="w-10 h-10 text-white" />
                                                    </motion.div>
                                                    <motion.h3
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="text-2xl font-bold text-slate-800 dark:text-white mb-2"
                                                    >
                                                        Select a Category
                                                    </motion.h3>
                                                    <motion.p
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 }}
                                                        className="text-slate-500 dark:text-slate-400"
                                                    >
                                                        Choose a category above to browse PDFs
                                                    </motion.p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    /* PDF Viewer */
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center w-full h-full min-h-screen"
                                    >
                                        <div className="w-full h-full flex justify-center p-4">
                                            <Document
                                                file={activePdf.path}
                                                onDocumentLoadSuccess={onDocumentLoadSuccess}
                                                loading={
                                                    <div className="flex flex-col items-center py-20">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent mb-4"></div>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">Loading Document...</span>
                                                    </div>
                                                }
                                                error={
                                                    <div className="flex flex-col items-center justify-center py-20 text-rose-500 dark:text-rose-400">
                                                        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-3">
                                                            <X className="w-6 h-6" />
                                                        </div>
                                                        <p className="font-bold">Unable to load document</p>
                                                        <p className="text-sm opacity-60 mt-1 max-w-xs text-center break-all">{activePdf.path}</p>
                                                    </div>
                                                }
                                                className="flex flex-col items-center space-y-8"
                                            >
                                                {numPages && Array.from({ length: numPages }, (_, index) => (
                                                    <React.Fragment key={`page_${index + 1}`}>
                                                        <Page
                                                            pageNumber={index + 1}
                                                            scale={scale}
                                                            renderTextLayer={false}
                                                            renderAnnotationLayer={false}
                                                            className="rounded-lg overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700"
                                                            width={window.innerWidth > 768 ? 600 : window.innerWidth - 64}
                                                            loading={
                                                                <div className="h-[800px] w-full bg-white dark:bg-slate-800 animate-pulse rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700">
                                                                    Loading Page {index + 1}...
                                                                </div>
                                                            }
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </Document>
                                        </div>

                                        {/* Floating Zoom Controls */}
                                        {numPages && (
                                            <div className="fixed bottom-24 right-6 md:right-12 z-50 flex flex-col gap-2">
                                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-2 shadow-xl flex flex-col gap-2">
                                                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.2))} className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                                        <ZoomIn className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                                        <ZoomOut className="w-5 h-5" />
                                                    </button>
                                                    <div className="h-[1px] w-full bg-slate-100 dark:bg-white/10 my-1" />
                                                    <div className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold font-mono">
                                                        {numPages}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
