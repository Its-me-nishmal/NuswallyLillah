
import React, { useState, useEffect } from 'react';
import { MapPin, ChevronRight, X, Search, Globe } from 'lucide-react';
import { UserLocation, KeralaDistrict } from '../types';

interface LocationPickerProps {
    onSelect: (location: UserLocation) => void;
    onClose?: () => void;
    showClose?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect, onClose, showClose = false }) => {
    const [step, setStep] = useState<'initial' | 'district' | 'place'>('initial');
    const [districts, setDistricts] = useState<KeralaDistrict[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<KeralaDistrict | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Load index.json
        fetch('/KERALA-AZAN-DATA-main/index.json')
            .then(res => res.json())
            .then(data => setDistricts(data))
            .catch(err => console.error("Failed to load Kerala location data", err));
    }, []);

    const handleKeralaSelect = () => {
        setStep('district');
    };

    const handleOtherSelect = () => {
        onSelect({ type: 'other' });
    };

    const handleDistrictSelect = (district: KeralaDistrict) => {
        setSelectedDistrict(district);
        setStep('place');
        setSearchQuery('');
    };

    const handlePlaceSelect = (place: { id: number, name: string }) => {
        if (selectedDistrict) {
            onSelect({
                type: 'kerala',
                districtId: selectedDistrict.id,
                locationId: place.id,
                locationName: place.name,
                districtName: selectedDistrict.name
            });
        }
    };

    const filteredDistricts = districts.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPlaces = selectedDistrict?.locations.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/5 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {step === 'initial' && "Welcome"}
                            {step === 'district' && "Select District"}
                            {step === 'place' && "Select Place"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {step === 'initial' && "Choose your location for accurate prayer times"}
                            {step === 'district' && "Choose your district in Kerala"}
                            {step === 'place' && `Places in ${selectedDistrict?.name}`}
                        </p>
                    </div>
                    {showClose && onClose && (
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    )}
                </div>

                {/* Search Bar for districts and places */}
                {(step === 'district' || step === 'place') && (
                    <div className="px-6 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={`Search ${step === 'district' ? 'districts' : 'places'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none dark:text-white"
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 pt-2 no-scrollbar">
                    {step === 'initial' && (
                        <div className="grid gap-4">
                            <button
                                onClick={handleKeralaSelect}
                                className="group p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all text-left flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white">I am from Kerala</h3>
                                    <p className="text-xs text-slate-500 dark:text-emerald-400/70">Use high-precision regional data</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={handleOtherSelect}
                                className="group p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Other Location</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Use standard GPS/API times</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 'district' && (
                        <div className="grid gap-2">
                            {filteredDistricts.map(district => (
                                <button
                                    key={district.id}
                                    onClick={() => handleDistrictSelect(district)}
                                    className="p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left font-medium text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-100 dark:hover:border-white/5"
                                >
                                    {district.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 'place' && (
                        <div className="grid gap-2">
                            {filteredPlaces.map(place => (
                                <button
                                    key={place.id}
                                    onClick={() => handlePlaceSelect(place)}
                                    className="p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left font-medium text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-100 dark:hover:border-white/5"
                                >
                                    {place.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Back */}
                {(step === 'district' || step === 'place') && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => {
                                if (step === 'place') setStep('district');
                                else setStep('initial');
                                setSearchQuery('');
                            }}
                            className="w-full py-3 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
