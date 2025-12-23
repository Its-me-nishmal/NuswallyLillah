
import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Info, ShieldCheck, RefreshCcw } from 'lucide-react';

export const ZakatCalculator: React.FC = () => {
    // Asset State
    const [cash, setCash] = useState<number>(0);
    const [gold, setGold] = useState<number>(0); // Value in currency
    const [silver, setSilver] = useState<number>(0); // Value in currency
    const [investments, setInvestments] = useState<number>(0);
    const [liabilities, setLiabilities] = useState<number>(0);

    // Settings
    const [goldPricePerGram, setGoldPricePerGram] = useState<number>(65); // Approx USD
    const [silverPricePerGram, setSilverPricePerGram] = useState<number>(0.80); // Approx USD

    // Results
    const [totalAssets, setTotalAssets] = useState(0);
    const [netWealth, setNetWealth] = useState(0);
    const [zakatDue, setZakatDue] = useState(0);
    const [isEligible, setIsEligible] = useState(false);

    // Nisab (Gold Standard: 87.48g)
    const nisabThreshold = 87.48 * goldPricePerGram;

    useEffect(() => {
        const total = cash + gold + silver + investments;
        const net = Math.max(0, total - liabilities);
        const due = net * 0.025;

        setTotalAssets(total);
        setNetWealth(net);
        setZakatDue(due);
        setIsEligible(net >= nisabThreshold);
    }, [cash, gold, silver, investments, liabilities, nisabThreshold]);

    return (
        <div className="max-w-4xl mx-auto pb-10 animate-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="text-center mb-8 space-y-2">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                    <Calculator className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Zakat Calculator</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Easily calculate your annual Zakat (2.5%) based on your assets and liabilities.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Input Form */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" /> Assets (Wealth)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Cash & Bank Balances</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={cash || ''}
                                        onChange={e => setCash(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Investments / Stocks</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={investments || ''}
                                        onChange={e => setInvestments(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Gold Value</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={gold || ''}
                                        onChange={e => setGold(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Silver Value</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={silver || ''}
                                        onChange={e => setSilver(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-rose-500" /> Liabilities (Debts)
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Debts Due Immediately</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={liabilities || ''}
                                    onChange={e => setLiabilities(parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 dark:text-white"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Only include debts that are due now or deduct from your current accessible wealth.</p>
                        </div>
                    </div>

                    {/* Gold Price Settings (Advanced) */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800">
                        <button className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                            <RefreshCcw className="w-3 h-3" /> Market Rates (Per Gram)
                        </button>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 dark:text-slate-500">Gold:</span>
                                <input
                                    type="number"
                                    value={goldPricePerGram}
                                    onChange={e => setGoldPricePerGram(parseFloat(e.target.value))}
                                    className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Result Panel */}
                <div className="lg:col-span-1">
                    <div className={`sticky top-6 rounded-[2rem] p-6 text-white shadow-xl transition-all duration-500 ${isEligible ? 'bg-gradient-to-bl from-emerald-600 to-teal-700 shadow-emerald-200 dark:shadow-emerald-900/30' : 'bg-slate-800 dark:bg-slate-700'}`}>

                        <div className="mb-8">
                            <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest mb-1">Total Zakat Due</p>
                            <h2 className="text-5xl font-bold tracking-tight">${zakatDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm opacity-80">Total Assets</span>
                                <span className="font-mono font-bold">${totalAssets.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm opacity-80">Liabilities</span>
                                <span className="font-mono font-bold text-rose-300">-${liabilities.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm opacity-80">Net Wealth</span>
                                <span className="font-mono font-bold">${netWealth.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-sm opacity-80">Nisab Threshold</span>
                                <span className="font-mono font-bold text-amber-300">${nisabThreshold.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl flex gap-3 items-start ${isEligible ? 'bg-white/20' : 'bg-rose-500/20'}`}>
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm mb-1">{isEligible ? "You are eligible." : "Below Nisab Threshold."}</p>
                                <p className="text-xs opacity-80 leading-relaxed">
                                    {isEligible
                                        ? "Your net wealth exceeds the Nisab (value of 87.48g gold). Zakat is obligatory."
                                        : "Your net wealth is currently below the threshold required for Zakat."}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
