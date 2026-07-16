'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';

export default function ThemeSync() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}
