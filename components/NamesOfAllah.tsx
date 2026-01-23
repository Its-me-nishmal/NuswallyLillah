
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Search, Volume2, Play, Pause, Volume2 as VolumeIcon } from 'lucide-react';

interface NameOfAllah {
   number: number;
   arabic: string;
   transliteration: string;
   meaning: string;
}

const ALL_NAMES: NameOfAllah[] = [
   { number: 1, arabic: "ٱللَّٰهُ", transliteration: "Allah", meaning: "The Greatest Name" },
   { number: 2, arabic: "ٱلرَّحْمَٰنُ", transliteration: "Ar-Rahman", meaning: "The All-Compassionate" },
   { number: 3, arabic: "ٱلرَّحِيمُ", transliteration: "Ar-Rahim", meaning: "The All-Merciful" },
   { number: 4, arabic: "ٱلْمَلِكُ", transliteration: "Al-Malik", meaning: "The Absolute Ruler" },
   { number: 5, arabic: "ٱلْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Pure One" },
   { number: 6, arabic: "ٱلسَّلَامُ", transliteration: "As-Salam", meaning: "The Source of Peace" },
   { number: 7, arabic: "ٱلْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Inspirer of Faith" },
   { number: 8, arabic: "ٱلْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning: "The Guardian" },
   { number: 9, arabic: "ٱلْعَزِيزُ", transliteration: "Al-Aziz", meaning: "The Victorious" },
   { number: 10, arabic: "ٱلْجَبَّارُ", transliteration: "Al-Jabbar", meaning: "The Compeller" },
   { number: 11, arabic: "ٱلْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning: "The Supreme" },
   { number: 12, arabic: "ٱلْخَالِقُ", transliteration: "Al-Khaliq", meaning: "The Creator" },
   { number: 13, arabic: "ٱلْبَارِئُ", transliteration: "Al-Bari'", meaning: "The Maker of Order" },
   { number: 14, arabic: "ٱلْمُصَوِّرُ", transliteration: "Al-Musawwir", meaning: "The Shaper of Beauty" },
   { number: 15, arabic: "ٱلْغَفَّارُ", transliteration: "Al-Ghaffar", meaning: "The Forgiving" },
   { number: 16, arabic: "ٱلْقَهَّارُ", transliteration: "Al-Qahhar", meaning: "The Subduer" },
   { number: 17, arabic: "ٱلْوَهَّابُ", transliteration: "Al-Wahhab", meaning: "The Giver of All" },
   { number: 18, arabic: "ٱلرَّزَّاقُ", transliteration: "Ar-Razzaq", meaning: "The Sustainer" },
   { number: 19, arabic: "ٱلْفَتَّاحُ", transliteration: "Al-Fattah", meaning: "The Opener" },
   { number: 20, arabic: "ٱلْعَلِيمُ", transliteration: "Al-'Alim", meaning: "The Knower of All" },
   { number: 21, arabic: "ٱلْقَابِضُ", transliteration: "Al-Qabid", meaning: "The Constrictor" },
   { number: 22, arabic: "ٱلْبَاسِطُ", transliteration: "Al-Basit", meaning: "The Reliever" },
   { number: 23, arabic: "ٱلْخَافِضُ", transliteration: "Al-Khafid", meaning: "The Abaser" },
   { number: 24, arabic: "ٱلرَّافِعُ", transliteration: "Ar-Rafi'", meaning: "The Exalter" },
   { number: 25, arabic: "ٱلْمُعِزُّ", transliteration: "Al-Mu'izz", meaning: "The Bestower of Honors" },
   { number: 26, arabic: "ٱلْمُذِلُّ", transliteration: "Al-Mudhill", meaning: "The Humiliator" },
   { number: 27, arabic: "ٱلسَّمِيعُ", transliteration: "As-Sami'", meaning: "The Hearer of All" },
   { number: 28, arabic: "ٱلْبَصِيرُ", transliteration: "Al-Basir", meaning: "The Seer of All" },
   { number: 29, arabic: "ٱلْحَكَمُ", transliteration: "Al-Hakam", meaning: "The Judge" },
   { number: 30, arabic: "ٱلْعَدْلُ", transliteration: "Al-'Adl", meaning: "The Just" },
   { number: 31, arabic: "ٱللَّطِيفُ", transliteration: "Al-Latif", meaning: "The Subtle One" },
   { number: 32, arabic: "ٱلْخَبِيرُ", transliteration: "Al-Khabir", meaning: "The All-Aware" },
   { number: 33, arabic: "ٱلْحَلِيمُ", transliteration: "Al-Halim", meaning: "The Forbearing" },
   { number: 34, arabic: "ٱلْعَظِيمُ", transliteration: "Al-Azim", meaning: "The Magnificent" },
   { number: 35, arabic: "ٱلْغَفُورُ", transliteration: "Al-Ghafur", meaning: "The Forgiver and Hider of Faults" },
   { number: 36, arabic: "ٱلشَّكُورُ", transliteration: "Ash-Shakur", meaning: "The Rewarder of Thankfulness" },
   { number: 37, arabic: "ٱلْعَلِيُّ", transliteration: "Al-'Ali", meaning: "The Highest" },
   { number: 38, arabic: "ٱلْكَبِيرُ", transliteration: "Al-Kabir", meaning: "The Greatest" },
   { number: 39, arabic: "ٱلْحَفِيظُ", transliteration: "Al-Hafiz", meaning: "The Preserver" },
   { number: 40, arabic: "ٱلْمُقِيتُ", transliteration: "Al-Muqit", meaning: "The Nourisher" },
   { number: 41, arabic: "ٱلْحَسِيبُ", transliteration: "Al-Hasib", meaning: "The Accounter" },
   { number: 42, arabic: "ٱلْجَلِيلُ", transliteration: "Al-Jalil", meaning: "The Mighty" },
   { number: 43, arabic: "ٱلْكَرِيمُ", transliteration: "Al-Karim", meaning: "The Generous" },
   { number: 44, arabic: "ٱلرَّقِيبُ", transliteration: "Ar-Raqib", meaning: "The Watchful One" },
   { number: 45, arabic: "ٱلْمُجِيبُ", transliteration: "Al-Mujib", meaning: "The Responsive One" },
   { number: 46, arabic: "ٱلْوَاسِعُ", transliteration: "Al-Wasi'", meaning: "The All-Comprehending" },
   { number: 47, arabic: "ٱلْحَكِيمُ", transliteration: "Al-Hakim", meaning: "The Perfectly Wise" },
   { number: 48, arabic: "ٱلْوَدُودُ", transliteration: "Al-Wadud", meaning: "The Loving One" },
   { number: 49, arabic: "ٱلْمَجِيدُ", transliteration: "Al-Majid", meaning: "The Majestic One" },
   { number: 50, arabic: "ٱلْبَاعِثُ", transliteration: "Al-Ba'ith", meaning: "The Resurrector" },
   { number: 51, arabic: "ٱلشَّهِيدُ", transliteration: "Ash-Shahid", meaning: "The Witness" },
   { number: 52, arabic: "ٱلْحَقُّ", transliteration: "Al-Haqq", meaning: "The Truth" },
   { number: 53, arabic: "ٱلْوَكِيلُ", transliteration: "Al-Wakil", meaning: "The Trustee" },
   { number: 54, arabic: "ٱلْقَوِيُّ", transliteration: "Al-Qawiyy", meaning: "The Possessor of All Strength" },
   { number: 55, arabic: "ٱلْمَتِينُ", transliteration: "Al-Matin", meaning: "The Forceful One" },
   { number: 56, arabic: "ٱلْوَلِيُّ", transliteration: "Al-Waliyy", meaning: "The Governor" },
   { number: 57, arabic: "ٱلْحَمِيدُ", transliteration: "Al-Hamid", meaning: "The Praised One" },
   { number: 58, arabic: "ٱلْمُحْصِي", transliteration: "Al-Muhsi", meaning: "The Appraiser" },
   { number: 59, arabic: "ٱلْمُبْدِئُ", transliteration: "Al-Mubdi'", meaning: "The Originator" },
   { number: 60, arabic: "ٱلْمُعِيدُ", transliteration: "Al-Mu'id", meaning: "The Restorer" },
   { number: 61, arabic: "ٱلْمُحْيِي", transliteration: "Al-Muhyi", meaning: "The Giver of Life" },
   { number: 62, arabic: "ٱلْمُمِيتُ", transliteration: "Al-Mumit", meaning: "The Taker of Life" },
   { number: 63, arabic: "ٱلْحَيُّ", transliteration: "Al-Hayy", meaning: "The Ever Living One" },
   { number: 64, arabic: "ٱلْقَيُّومُ", transliteration: "Al-Qayyum", meaning: "The Self-Existing One" },
   { number: 65, arabic: "ٱلْوَاجِدُ", transliteration: "Al-Wajid", meaning: "The Finder" },
   { number: 66, arabic: "ٱلْمَاجِدُ", transliteration: "Al-Majid", meaning: "The Glorious" },
   { number: 67, arabic: "ٱلْوَاحِدُ", transliteration: "Al-Wahid", meaning: "The One" },
   { number: 68, arabic: "ٱلصَّمَدُ", transliteration: "As-Samad", meaning: "The Satisfier of All Needs" },
   { number: 69, arabic: "ٱلْقَادِرُ", transliteration: "Al-Qadir", meaning: "The All Powerful" },
   { number: 70, arabic: "ٱلْمُقْتَدِرُ", transliteration: "Al-Muqtadir", meaning: "The Creator of All Power" },
   { number: 71, arabic: "ٱلْمُقَدِّمُ", transliteration: "Al-Muqaddim", meaning: "The Expediter" },
   { number: 72, arabic: "ٱلْمُؤَخِّرُ", transliteration: "Al-Mu'akhkhir", meaning: "The Delayer" },
   { number: 73, arabic: "ٱلْأَوَّلُ", transliteration: "Al-Awwal", meaning: "The First" },
   { number: 74, arabic: "ٱلْآخِرُ", transliteration: "Al-Akhir", meaning: "The Last" },
   { number: 75, arabic: "ٱلظَّاهِرُ", transliteration: "Az-Zahir", meaning: "The Manifest One" },
   { number: 76, arabic: "ٱلْبَاطِنُ", transliteration: "Al-Batin", meaning: "The Hidden One" },
   { number: 77, arabic: "ٱلْوَالِي", transliteration: "Al-Wali", meaning: "The Protecting Friend" },
   { number: 78, arabic: "ٱلْمُتَعَالِي", transliteration: "Al-Muta'ali", meaning: "The Supreme One" },
   { number: 79, arabic: "ٱلْبَرُّ", transliteration: "Al-Barr", meaning: "The Doer of Good" },
   { number: 80, arabic: "ٱلتَّوَّابُ", transliteration: "At-Tawwab", meaning: "Guide to Repentance" },
   { number: 81, arabic: "ٱلْمُنْتَقِمُ", transliteration: "Al-Muntaqim", meaning: "The Avenger" },
   { number: 82, arabic: "ٱلْعَفُوُّ", transliteration: "Al-'Afuww", meaning: "The Forgiver" },
   { number: 83, arabic: "ٱلرَّؤُوفُ", transliteration: "Ar-Ra'uf", meaning: "The Clement" },
   { number: 84, arabic: "مَالِكُ ٱلْمُلْكِ", transliteration: "Malik-al-Mulk", meaning: "The Owner of All" },
   { number: 85, arabic: "ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ", transliteration: "Dhu-al-Jalal wa-al-Ikram", meaning: "Lord of Majesty and Bounty" },
   { number: 86, arabic: "ٱلْمُقْسِطُ", transliteration: "Al-Muqsit", meaning: "The Equitable One" },
   { number: 87, arabic: "ٱلْجَامِعُ", transliteration: "Al-Jami'", meaning: "The Gatherer" },
   { number: 88, arabic: "ٱلْغَنِيُّ", transliteration: "Al-Ghani", meaning: "The Rich One" },
   { number: 89, arabic: "ٱلْمُغْنِي", transliteration: "Al-Mughni", meaning: "The Enricher" },
   { number: 90, arabic: "ٱلْمَانِعُ", transliteration: "Al-Mani'", meaning: "The Preventer of Harm" },
   { number: 91, arabic: "ٱلضَّارُّ", transliteration: "Ad-Darr", meaning: "The Creator of The Harmful" },
   { number: 92, arabic: "ٱلنَّافِعُ", transliteration: "An-Nafi'", meaning: "The Creator of Good" },
   { number: 93, arabic: "ٱلنُّورُ", transliteration: "An-Nur", meaning: "The Light" },
   { number: 94, arabic: "ٱلْهَادِي", transliteration: "Al-Hadi", meaning: "The Guide" },
   { number: 95, arabic: "ٱلْبَدِيعُ", transliteration: "Al-Badi'", meaning: "The Originator" },
   { number: 96, arabic: "ٱلْبَاقِي", transliteration: "Al-Baqi", meaning: "The Everlasting One" },
   { number: 97, arabic: "ٱلْوَارِثُ", transliteration: "Al-Warith", meaning: "The Inheritor of All" },
   { number: 98, arabic: "ٱلرَّشِيدُ", transliteration: "Ar-Rashid", meaning: "The Righteous Teacher" },
   { number: 99, arabic: "ٱلصَّبُورُ", transliteration: "As-Sabur", meaning: "The Patient One" },
];

export const NamesOfAllah: React.FC = () => {
   const [search, setSearch] = useState('');
   const [hideMeaning, setHideMeaning] = useState(false);
   const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [autoPlay, setAutoPlay] = useState(false);
   const [currentTime, setCurrentTime] = useState(0);
   const [duration, setDuration] = useState(0);
   const audioRef = useRef<HTMLAudioElement | null>(null);

   // Use refs to avoid stale closures in event listeners
   const autoPlayRef = useRef(autoPlay);
   const currentPlayingRef = useRef(currentPlaying);

   // Long press detection
   const pressTimer = useRef<NodeJS.Timeout | null>(null);
   const [longPressTriggered, setLongPressTriggered] = useState(false);

   useEffect(() => {
      autoPlayRef.current = autoPlay;
   }, [autoPlay]);

   useEffect(() => {
      currentPlayingRef.current = currentPlaying;
   }, [currentPlaying]);

   const filteredNames = ALL_NAMES.filter(n =>
      n.transliteration.toLowerCase().includes(search.toLowerCase()) ||
      n.meaning.toLowerCase().includes(search.toLowerCase())
   );

   const playAudio = async (number: number) => {
      const audioUrl = `https://cdn.jsdelivr.net/gh/soachishti/Asma-ul-Husna@master/audio/${number}.mp3`;

      if (audioRef.current) {
         if (currentPlaying === number && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
         }

         try {
            audioRef.current.src = audioUrl;
            await audioRef.current.play();
            setCurrentPlaying(number);
            setIsPlaying(true);
         } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
         }
      }
   };

   const togglePlayPause = async () => {
      if (audioRef.current) {
         if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
         } else {
            try {
               if (currentPlaying) {
                  await audioRef.current.play();
                  setIsPlaying(true);
               } else {
                  playAudio(1);
               }
            } catch (error) {
               console.error('Error toggling playback:', error);
               setIsPlaying(false);
            }
         }
      }
   };

   const playNext = () => {
      if (currentPlayingRef.current && currentPlayingRef.current < 99) {
         playAudio(currentPlayingRef.current + 1);
      }
   };

   const playFromStart = () => {
      setAutoPlay(true);
      playAudio(1);
   };

   // Long press handlers
   const handlePressStart = (number: number) => {
      setLongPressTriggered(false);
      pressTimer.current = setTimeout(() => {
         setLongPressTriggered(true);
         setAutoPlay(true); // Enable auto-play when long pressing
         playAudio(number);
      }, 500); // 500ms for long press
   };

   const handlePressEnd = () => {
      if (pressTimer.current) {
         clearTimeout(pressTimer.current);
         pressTimer.current = null;
      }
      setLongPressTriggered(false);
   };

   useEffect(() => {
      const audio = new Audio();
      audioRef.current = audio;

      const handleTimeUpdate = () => {
         setCurrentTime(audio.currentTime);
      };

      const handleLoadedMetadata = () => {
         setDuration(audio.duration);
      };

      const handleEnded = () => {
         setIsPlaying(false);
         // Check if we should play next using refs to avoid stale closure
         if (autoPlayRef.current && currentPlayingRef.current && currentPlayingRef.current < 99) {
            setTimeout(() => playNext(), 100);
         }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
         audio.removeEventListener('timeupdate', handleTimeUpdate);
         audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
         audio.removeEventListener('ended', handleEnded);
         audio.pause();
         audio.src = '';
      };
   }, []);

   const formatTime = (time: number) => {
      if (isNaN(time)) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
   };

   return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

         <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-2">
               <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Asmaul Husna</h2>
            <p className="text-slate-500 dark:text-slate-400">The 99 Beautiful Names of Allah</p>
         </div>

         {/* Audio Player Control Bar - Always Visible */}
         <div className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-lg backdrop-blur-lg border border-white/20 mb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
               <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <button
                     onClick={playFromStart}
                     className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                     title="Play from Start"
                  >
                     <Play className="w-5 h-5" />
                  </button>
                  {currentPlaying && (
                     <>
                        <button
                           onClick={togglePlayPause}
                           className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                        >
                           {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <div className="flex-1">
                           <p className="font-bold text-sm">
                              {ALL_NAMES[currentPlaying - 1]?.transliteration} ({currentPlaying}/99)
                           </p>
                           <p className="text-xs opacity-90">{formatTime(currentTime)} / {formatTime(duration)}</p>
                        </div>
                     </>
                  )}
                  {!currentPlaying && (
                     <div className="flex-1">
                        <p className="font-bold text-sm">Press and hold any name to start</p>
                        <p className="text-xs opacity-90">Or click "Play from Start" button</p>
                     </div>
                  )}
               </div>
               <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${autoPlay ? 'bg-white text-emerald-600' : 'bg-white/20 hover:bg-white/30'
                     }`}
               >
                  {autoPlay ? 'Auto-Play: ON' : 'Auto-Play: OFF'}
               </button>
            </div>
         </div>

         <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm backdrop-blur-sm sticky top-0 z-30">
            <div className="relative w-full md:w-80">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
               <input
                  type="text"
                  placeholder="Search names..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white"
               />
            </div>
            <button
               onClick={() => setHideMeaning(!hideMeaning)}
               className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${hideMeaning ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
            >
               {hideMeaning ? "Show Meanings" : "Hide Meanings (Memorize)"}
            </button>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredNames.map((item) => (
               <div
                  key={item.number}
                  onMouseDown={() => handlePressStart(item.number)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(item.number)}
                  onTouchEnd={handlePressEnd}
                  className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none ${currentPlaying === item.number && isPlaying
                     ? 'border-emerald-500 dark:border-emerald-400 shadow-emerald-100 dark:shadow-emerald-900/40 ring-2 ring-emerald-500/20'
                     : 'border-emerald-50 dark:border-emerald-900/20 hover:shadow-emerald-50 dark:hover:shadow-emerald-900/20'
                     }`}
               >
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-emerald-200 dark:text-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">{item.number}</span>

                  {currentPlaying === item.number && isPlaying && (
                     <VolumeIcon className="absolute top-3 right-3 w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  )}

                  <h3 className="font-quran text-4xl text-slate-800 dark:text-white mb-4 mt-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" dir="rtl">{item.arabic}</h3>

                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{item.transliteration}</p>

                  <div className={`transition-all duration-300 ${hideMeaning ? 'opacity-0 blur-sm group-hover:opacity-100 group-hover:blur-0' : 'opacity-100'}`}>
                     <p className="text-xs text-slate-500 dark:text-slate-400">{item.meaning}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};
