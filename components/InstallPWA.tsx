import React, { useEffect, useState } from 'react';
import { Download, Share, Smartphone, Wifi, Clock, BookOpen, Moon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if already in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);

        // Capture the install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (isStandalone) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="max-w-md w-full space-y-8 text-center pb-10">

                {/* Header / Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                >
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-xl flex items-center justify-center transform rotate-3">
                        <span className="text-4xl">🕌</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                        Nuswally Lillah
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Your Complete Islamic Companion
                    </p>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="grid grid-cols-2 gap-4 py-6"
                >
                    {[
                        { icon: <Wifi className="w-6 h-6" />, text: "100% Offline" },
                        { icon: <Clock className="w-6 h-6" />, text: "Prayer Times" },
                        { icon: <BookOpen className="w-6 h-6" />, text: "Quran Reader" },
                        { icon: <Moon className="w-6 h-6" />, text: "Dark Mode" },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 dark:border-slate-700 flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            {feature.icon}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.text}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Installation Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="space-y-6"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-lg border border-emerald-100 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                            Install App Required
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                            To ensure the best experience and offline capabilities, please install this app to your device.
                        </p>

                        {isIOS ? (
                            <div className="text-left space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Tap the Share button</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">Usually at the bottom of the screen</p>
                                        <Share className="w-6 h-6 text-blue-500 mt-2" />
                                    </div>
                                </div>
                                <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Select "Add to Home Screen"</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">Scroll down to find this option</p>
                                        <div className="flex items-center gap-2 mt-2 bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
                                            <span className="text-xl">+</span>
                                            <span className="text-xs font-semibold">Add to Home Screen</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                disabled={!deferredPrompt}
                                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Download className="w-5 h-5" />
                                {deferredPrompt ? 'Install App' : 'App Installed / Not Supported'}
                            </button>
                        )}

                        {!isIOS && !deferredPrompt && (
                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-3 px-4 bg-amber-50 dark:bg-amber-900/20 py-2 rounded-lg">
                                If the install button doesn't work, look for the install icon in your browser's address bar or menu.
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs text-slate-400 dark:text-slate-600 pt-8"
                >
                    v1.0.0 • Better on Mobile
                </motion.div>
            </div>
        </div>
    );
};
