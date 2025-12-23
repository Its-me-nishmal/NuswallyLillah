
import React, { useState } from 'react';
import { BookHeart, Copy, Check, Sun, Moon, Home, Plane, Heart, Shield } from 'lucide-react';

interface Dua {
  id: string;
  category: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
}

const DUAS: Dua[] = [
  {
    id: '1',
    category: 'Morning',
    title: 'Waking Up',
    arabic: 'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-lathee ahyana ba'da ma amatana wa-ilayhin-nushoor",
    translation: "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
    reference: "Al-Bukhari 11/113, Muslim 4/2083"
  },
  {
    id: '2',
    category: 'Morning',
    title: 'Morning Remembrance',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
    transliteration: "Asbahna wa-asbahal-mulku lillah",
    translation: "We have entered the morning and at this very time the whole kingdom belongs to Allah.",
    reference: "Muslim 4/2088"
  },
  {
    id: '3',
    category: 'Travel',
    title: 'Start of Journey',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: "Subhanal-lathee sakhkhara lana hatha wama kunna lahu muqrineen wa-inna ila rabbina lamunqaliboon",
    translation: "Glory is to Him Who has subjected this to us, and we were not able to do it. And surely to our Lord we will return.",
    reference: "Surah Az-Zukhruf 43:13-14"
  },
  {
    id: '4',
    category: 'Home',
    title: 'Entering Home',
    arabic: 'بِسْمِ اللهِ وَلَجْنَا، وَ بِسْمِ اللهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration: "Bismillahi walajna, wabismillahi kharajna, wa'ala rabbina tawakkalna",
    translation: "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we depend.",
    reference: "Abu Dawud 4/325"
  },
  {
    id: '5',
    category: 'Distress',
    title: 'For Anxiety & Sorrow',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    transliteration: "Allahumma innee a'oothu bika minal-hammi wal-hazan",
    translation: "O Allah, I seek refuge in You from anxiety and sorrow.",
    reference: "Al-Bukhari 7/158"
  }
];

const CATEGORIES = [
  { id: 'All', icon: BookHeart, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'Morning', icon: Sun, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'Evening', icon: Moon, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { id: 'Travel', icon: Plane, color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400' },
  { id: 'Home', icon: Home, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 'Distress', icon: Heart, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400' },
];

export const DuaCollection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDuas = selectedCategory === 'All'
    ? DUAS
    : DUAS.filter(d => d.category === selectedCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in slide-in-from-bottom-4 duration-500">

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Fortress of the Muslim</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Authentic supplications for your daily life.</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${selectedCategory === cat.id
                ? 'bg-slate-800 dark:bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? 'text-white' : ''}`} />
            {cat.id}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-6">
        {filteredDuas.map(dua => (
          <div key={dua.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-50/50 dark:border-emerald-900/10 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                {dua.category}
              </span>
              <button
                onClick={() => handleCopy(`${dua.arabic}\n\n${dua.translation}`, dua.id)}
                className="p-2 text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Copy to clipboard"
              >
                {copiedId === dua.id ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{dua.title}</h3>

            <p className="font-quran text-3xl md:text-4xl text-right text-slate-800 dark:text-white leading-[2.2] mb-6" dir="rtl">
              {dua.arabic}
            </p>

            <div className="space-y-3">
              <p className="text-emerald-700 dark:text-emerald-400 font-medium italic text-sm md:text-base bg-emerald-50/50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-50 dark:border-emerald-900/10">
                "{dua.transliteration}"
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {dua.translation}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Ref: {dua.reference}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
