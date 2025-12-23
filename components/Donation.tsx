
import React, { useState } from 'react';
import { Heart, ShieldCheck, ArrowRight, CreditCard } from 'lucide-react';

export const Donation: React.FC = () => {
  const [amount, setAmount] = useState<number | ''>(50);
  const [type, setType] = useState<'One-time' | 'Monthly'>('One-time');

  const presetAmounts = [10, 50, 100, 500];

  return (
    <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 fill-emerald-400 text-emerald-400" />
          <h2 className="text-3xl font-bold mb-2">Give Sadaqah</h2>
          <p className="text-emerald-100">"Charity does not decrease wealth." (Muslim)</p>
        </div>

        <div className="p-8 space-y-8">

          {/* Donation Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['One-time', 'Monthly'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t as any)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === t
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Amount (USD)</label>
            <div className="grid grid-cols-4 gap-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-3 rounded-xl border font-medium transition-all ${amount === preset
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-500 bg-white dark:bg-slate-800'
                    }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="Custom Amount"
              />
            </div>
          </div>

          {/* Payment Method Stub */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95 duration-200">
              <CreditCard className="w-5 h-5" />
              Donate ${amount || 0}
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Secure 256-bit SSL Encrypted Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
