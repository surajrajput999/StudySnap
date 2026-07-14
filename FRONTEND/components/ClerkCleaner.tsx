'use client';

import { useEffect } from 'react';

export default function ClerkCleaner() {
  useEffect(() => {
    const hideDevBanner = () => {
      document.querySelectorAll('[class*="cl-internal-1hp5nqm"], [class*="cl-internal-18t7b6f"], [class*="cl-development"], [class*="cl-keyless"], [id*="cl-keyless"], [id*="cl-development"]').forEach(el => {
        if (el instanceof HTMLElement) el.style.display = 'none';
      });
    };

    hideDevBanner();
    const observer = new MutationObserver(hideDevBanner);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
