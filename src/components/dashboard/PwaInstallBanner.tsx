'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, Share, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  const standalone =
    'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return window.matchMedia('(display-mode: standalone)').matches || standalone;
}

export default function PwaInstallBanner() {
  const params = useParams();
  const fr = ((params.locale as string) || 'fr') === 'fr';
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandaloneDisplay()) return;

    const wasDismissed = localStorage.getItem('epiai-pwa-dismissed');
    if (wasDismissed === 'true') return;

    setDismissed(false);
    setIosHint(isIosDevice());

    // Register early so Chrome can offer install + push later.
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/push-sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => undefined);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHint(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem('epiai-pwa-dismissed', 'true');
    setDismissed(true);
    setDeferred(null);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      localStorage.setItem('epiai-pwa-dismissed', 'true');
      setDismissed(true);
    } catch {
      /* user cancelled */
    } finally {
      setInstalling(false);
    }
  }, [deferred]);

  if (dismissed || isStandaloneDisplay()) return null;
  if (!deferred && !iosHint) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-default bg-card px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
        <div>
          <p className="text-sm font-medium text-primary">
            {fr ? 'Installer Epi’AI sur ton téléphone' : 'Install Epi’AI on your phone'}
          </p>
          <p className="mt-0.5 text-xs text-secondary">
            {iosHint
              ? fr
                ? 'Sur iPhone : touche Partager, puis « Sur l’écran d’accueil ». Ensuite ouvre l’icône et active les alertes pour le chat.'
                : 'On iPhone: tap Share, then “Add to Home Screen”. Open the icon and turn on alerts for chat.'
              : fr
                ? 'Comme une app : icône sur l’écran d’accueil, chat et notifications même hors navigateur.'
                : 'Like an app: home-screen icon, chat and notifications outside the browser.'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {deferred ? (
          <button
            type="button"
            onClick={() => void install()}
            disabled={installing}
            className="cursor-pointer rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {installing ? (fr ? 'Installation…' : 'Installing…') : fr ? 'Installer' : 'Install'}
          </button>
        ) : iosHint ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-default px-2.5 py-1.5 text-xs text-secondary">
            <Share className="h-3.5 w-3.5" />
            {fr ? 'Partager' : 'Share'}
          </span>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-card-muted hover:text-primary"
          aria-label={fr ? 'Fermer' : 'Dismiss'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
