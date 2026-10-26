import { useCallback, useEffect, useState } from 'react';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'fazopix.install.dismissed';
const DISMISS_DAYS = 14;

export function isDismissed(raw: string | null, now = Date.now()): boolean {
  const at = Number(raw);
  const age = now - at;
  return Number.isFinite(at) && at > 0 && age >= 0 && age < DISMISS_DAYS * 86_400_000;
}

function readDismissed(): boolean {
  try {
    return isDismissed(localStorage.getItem(DISMISS_KEY));
  } catch {
    return false;
  }
}

export type InstallMode = 'native' | 'ios' | 'none';

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// iPadOS 13+ reports itself as a Mac, so touch support is the tiebreaker.
export function isIosSafari(ua: string, maxTouchPoints: number): boolean {
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
  return ios && !otherBrowser;
}

export function useInstall() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Private mode: the dismissal just lasts until the next visit.
    }
    setDismissed(true);
  }, []);

  const mode: InstallMode = installed || dismissed
    ? 'none'
    : event
      ? 'native'
      : isIosSafari(navigator.userAgent, navigator.maxTouchPoints)
        ? 'ios'
        : 'none';

  const install = useCallback(async () => {
    if (!event) return;
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === 'dismissed') dismiss();
    } catch {
      // The browser refused to reopen the prompt; fall through and hide the button.
    }
    setEvent(null);
  }, [event, dismiss]);

  return { mode, install, dismiss };
}
