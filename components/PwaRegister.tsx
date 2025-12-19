'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => console.log('SW registered', reg))
        .catch((err) => console.error('SW registration failed', err));
    }
  }, []);

  return null;
}