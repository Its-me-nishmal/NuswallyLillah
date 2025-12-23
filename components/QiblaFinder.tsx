
import React, { useEffect, useState } from 'react';
import { Compass, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

export const QiblaFinder: React.FC = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Kaaba Coordinates
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  const calculateQibla = (lat: number, lng: number) => {
    const phiK = (KAABA_LAT * Math.PI) / 180.0;
    const lambdaK = (KAABA_LNG * Math.PI) / 180.0;
    const phi = (lat * Math.PI) / 180.0;
    const lambda = (lng * Math.PI) / 180.0;

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    let result = Math.atan2(y, x);

    // Convert to degrees
    result = (result * 180.0) / Math.PI;
    setQiblaBearing((result + 360) % 360);
  };

  useEffect(() => {
    // Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          calculateQibla(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError("Location access required to calculate Qibla direction.");
        }
      );
    } else {
      setError("Geolocation not supported on this device.");
    }
  }, []);

  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError("Compass permission denied.");
        }
      } catch (e) {
        setError("Error requesting compass permission.");
      }
    } else {
      // Non-iOS 13+ devices
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    // Cast to any to support iOS specific property
    const event = e as any;

    if (event.webkitCompassHeading) {
      // iOS
      setHeading(event.webkitCompassHeading);
    } else if (e.alpha !== null) {
      // Android / Standard (Approximate - relies on device calibration)
      setHeading(360 - e.alpha);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate rotation: We want the Qibla (Bearing) to be at the top center relative to phone heading
  // Compass rotates against heading.
  // Needle pointing to Qibla = qiblaBearing.
  // We rotate the CARD so North aligns with phone, then draw needle?
  // Easier: Rotate the entire Compass Dial opposite to Heading (so N points North).
  // Then draw Qibla Marker at `qiblaBearing`.

  const compassRotation = heading ? -heading : 0;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Qibla Finder</h2>
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <MapPin className="w-4 h-4 text-emerald-500" />
          {qiblaBearing !== null
            ? `Kaaba Direction: ${Math.round(qiblaBearing)}°`
            : "Locating..."}
        </div>
      </div>

      <div className="relative w-72 h-72 md:w-96 md:h-96">

        {/* Background Glow */}
        <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full blur-3xl opacity-30"></div>

        {/* The Rotating Compass Dial */}
        <div
          className="w-full h-full relative transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `rotate(${compassRotation}deg)` }}
        >
          {/* Compass Body */}
          <div className="absolute inset-0 rounded-full border-4 border-white dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl flex items-center justify-center">
            {/* Degree Ticks */}
            {[0, 90, 180, 270].map((deg) => (
              <div
                key={deg}
                className="absolute w-full text-center font-bold text-slate-400 dark:text-slate-500 text-xs"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <span className="block pt-2" style={{ transform: `rotate(${-deg}deg)` }}>
                  {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W'}
                </span>
              </div>
            ))}

            {/* Decorative Inner Circle */}
            <div className="w-2/3 h-2/3 rounded-full border border-emerald-100/50 dark:border-emerald-900/30"></div>
          </div>

          {/* Qibla Indicator (Kaaba Icon) */}
          {qiblaBearing !== null && (
            <div
              className="absolute w-full h-full"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-8 h-8 bg-black border border-amber-400 shadow-lg relative flex items-center justify-center rounded-sm">
                  <div className="w-full h-[2px] bg-amber-400 absolute top-2"></div>
                </div>
                <div className="w-0.5 h-8 bg-emerald-500/50 mt-1"></div>
              </div>
            </div>
          )}
        </div>

        {/* Static Center Point / Phone Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-600 rounded-full border-2 border-white dark:border-slate-800 shadow-sm z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-16 bg-slate-800/20 dark:bg-white/20 -z-0"></div>
      </div>

      {/* Controls / Errors */}
      <div className="mt-12 text-center max-w-xs">
        {!permissionGranted && (
          <button
            onClick={requestCompassPermission}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex items-center gap-2 mx-auto"
          >
            <Compass className="w-5 h-5" />
            Start Compass
          </button>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          For best accuracy, hold your device flat and move it in a figure-8 motion to calibrate.
        </p>
      </div>
    </div>
  );
};
