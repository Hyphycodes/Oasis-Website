'use client';

import { useEffect } from 'react';

/**
 * Lets /admin/look repaint the real site inside its iframe as the dials move.
 *
 * Only a same-origin parent is listened to, and only variables are accepted;
 * they are set as inline custom properties on <html>, which wins over every
 * stylesheet and is exactly what the saved version will emit. Nothing here
 * persists: reload the frame and the saved look is back.
 */
export function AppearancePreviewListener() {
  useEffect(() => {
    // Hydration is done: inline variables set from here on will stick.
    document.documentElement.dataset.previewReady = '1';
    if (window.parent === window) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; vars?: Record<string, string> } | null;
      if (!data || data.type !== 'oasis:appearance' || !data.vars) return;
      const root = document.documentElement;
      for (const [key, value] of Object.entries(data.vars)) {
        if (!/^--[a-z0-9-]+$/.test(key) && key !== 'color-scheme') continue;
        if (typeof value !== 'string' || value.length > 80) continue;
        root.style.setProperty(key, value);
      }
    };
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'oasis:appearance-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  return null;
}
