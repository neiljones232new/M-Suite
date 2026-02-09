'use client';

import { useEffect, useState } from 'react';

export function useHealth(url: string, interval = 3000) {
  const [isUp, setIsUp] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(url, {
          signal: controller.signal,
          mode: 'no-cors', // Allow checking without CORS
        });
        
        clearTimeout(timeoutId);
        setIsUp(true);
        setIsChecking(false);
      } catch {
        setIsUp(false);
        setIsChecking(false);
      }
    };

    check();
    const timer = setInterval(check, interval);
    
    return () => clearInterval(timer);
  }, [url, interval]);

  return { isUp, isChecking };
}
