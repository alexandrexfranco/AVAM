import { useState, useEffect } from 'react';

export function useSpeedTracker(limitKmH: number = 30) {
  const [speed, setSpeed] = useState<number>(0);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'searching' | 'active' | 'error'>('searching');

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocalização não suportada');
      setStatus('error');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setStatus('active');
        // position.coords.speed is in meters per second
        const speedMs = position.coords.speed;
        
        if (speedMs !== null && speedMs >= 0) {
          const speedKmH = speedMs * 3.6;
          setSpeed(speedKmH);
          setIsOverLimit(speedKmH > limitKmH);
        } else {
          // Fallback for stationary or low quality
          setSpeed(0);
          setIsOverLimit(false);
        }
      },
      (err) => {
        console.error('Speed Tracker Error:', err);
        setError('GPS Inativo');
        setStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [limitKmH]);

  return { speed, isOverLimit, error, status };
}
