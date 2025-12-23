
import React, { useState } from 'react';
import { Plane, MapPin, Info, ArrowRight, Book } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    description: string;
    location: string;
    dua?: string;
}

const UMRAH_STEPS: Step[] = [
    {
        id: 1,
        title: 'Ihram',
        location: 'Miqat',
        description: 'Enter the state of purity. Men wear two white cloths; women wear modest dress. Niyyah (Intention) is made here.',
        dua: 'Labbayk Allahumma Umrah (Here I am, O Allah, for Umrah)'
    },
    {
        id: 2,
        title: 'Tawaf',
        location: 'Kaaba',
        description: 'Circumambulate the Kaaba 7 times counter-clockwise, starting from the Black Stone. Recite personal duas.',
        dua: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar'
    },
    {
        id: 3,
        title: 'Sa\'i',
        location: 'Safa & Marwa',
        description: 'Walk 7 times between the hills of Safa and Marwa, emulating Hajar (AS). Start at Safa and end at Marwa.',
        dua: 'Innas-Safa wal-Marwata min sha\'a\'irillah'
    },
    {
        id: 4,
        title: 'Halq or Taqsir',
        location: 'Mecca',
        description: 'Men shave their head (Halq) or trim hair (Taqsir). Women cut a small fingertip length of hair. This concludes Umrah.',
    }
];

const HAJJ_STEPS: Step[] = [
    { id: 1, title: 'Ihram', location: 'Miqat', description: 'Enter state of Ihram with intention for Hajj.' },
    { id: 2, title: 'Mina (Day 8)', location: 'Mina', description: 'Stay in tents in Mina. Pray Dhuhr, Asr, Maghrib, Isha and Fajr.' },
    { id: 3, title: 'Arafat (Day 9)', location: 'Mount Arafat', description: 'The pinnacle of Hajj. Stand in prayer and repentance from noon until sunset. This is the most critical pillar.', dua: 'La ilaha illallah wahdahu la sharika lah...' },
    { id: 4, title: 'Muzdalifah (Night 9)', location: 'Muzdalifah', description: 'Spend the night under the open sky. Collect pebbles for Rami.' },
    { id: 5, title: 'Rami (Day 10)', location: 'Jamaraat', description: 'Stoning the big pillar (Jamarat al-Aqaba) with 7 pebbles.' },
    { id: 6, title: 'Qurbani & Halq', location: 'Mina', description: 'Sacrifice an animal and shave/trim hair. Exit first stage of Ihram.' },
    { id: 7, title: 'Tawaf Al-Ifadah', location: 'Kaaba', description: 'The obligatory Tawaf of Hajj.' },
    { id: 8, title: 'Mina (Days 11-13)', location: 'Mina', description: 'Stay in Mina and stone all three pillars daily.' },
    { id: 9, title: 'Tawaf Al-Wada', location: 'Kaaba', description: 'Farewell Tawaf before leaving Mecca.' }
];

export const HajjGuide: React.FC = () => {
    const [mode, setMode] = useState<'Umrah' | 'Hajj'>('Umrah');
    const [activeStep, setActiveStep] = useState<number | null>(null);

    const steps = mode === 'Umrah' ? UMRAH_STEPS : HAJJ_STEPS;

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="bg-sky-600 rounded-[2.5rem] p-8 text-white mb-8 relative overflow-hidden shadow-lg shadow-sky-200 dark:shadow-sky-900/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Plane className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Pilgrimage Guide</h2>
                    <p className="text-sky-100">Step-by-step companion for your spiritual journey.</p>

                    <div className="flex justify-center gap-4 mt-8">
                        {['Umrah', 'Hajj'].map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m as any); setActiveStep(null); }}
                                className={`px-8 py-3 rounded-xl font-bold transition-all ${mode === m ? 'bg-white text-sky-700 shadow-lg' : 'bg-sky-700/50 text-sky-100 hover:bg-sky-700'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative px-4">
                {/* Vertical Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-sky-100 dark:bg-sky-900/30 -ml-px hidden md:block"></div>
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-sky-100 dark:bg-sky-900/30 -ml-px md:hidden"></div>

                <div className="space-y-8">
                    {steps.map((step, idx) => {
                        const isEven = idx % 2 === 0;
                        const isActive = activeStep === step.id;

                        return (
                            <div key={step.id} className={`relative flex items-start md:items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                {/* Timeline Dot */}
                                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-4 border-sky-500 z-10 shadow-sm flex items-center justify-center text-[10px] font-bold text-sky-700 dark:text-sky-400">
                                    {idx + 1}
                                </div>

                                {/* Spacer for Desktop Layout */}
                                <div className="hidden md:block w-1/2"></div>

                                {/* Content Card */}
                                <div className={`w-full md:w-[calc(50%-2rem)] ml-16 md:ml-0 ${isEven ? 'md:mr-8' : 'md:ml-8'}`}>
                                    <div
                                        onClick={() => setActiveStep(isActive ? null : step.id)}
                                        className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all cursor-pointer group ${isActive ? 'border-sky-500 shadow-lg shadow-sky-100 dark:shadow-sky-900/20 ring-4 ring-sky-50 dark:ring-sky-900/20' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{step.title}</h3>
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-1 rounded-lg">
                                                <MapPin className="w-3 h-3" /> {step.location}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                                            {step.description}
                                        </p>

                                        {step.dua && (
                                            <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30 flex gap-3">
                                                    <Book className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                                                    <div>
                                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Recommended Dua</p>
                                                        <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{step.dua}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {!isActive && (
                                            <div className="text-sky-500 dark:text-sky-400 text-xs font-bold flex items-center gap-1 mt-2">
                                                View Details <ArrowRight className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};
