'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bell, BellOff, X } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function toUint8(src: BufferSource): Uint8Array {
  if (src instanceof ArrayBuffer) return new Uint8Array(src);
  return new Uint8Array(src.buffer, src.byteOffset, src.byteLength);
}

function uint8Equal(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function vapidKeyBytes(publicKey: string): Uint8Array {
  const bytes = urlBase64ToUint8Array(publicKey.trim());
  if (bytes.byteLength !== 65 || bytes[0] !== 0x04) {
    throw new Error('Invalid VAPID public key');
  }
  return bytes;
}

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

function waitForWorkerActivated(worker: ServiceWorker, timeoutMs = 15000): Promise<void> {
  if (worker.state === 'activated') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      worker.removeEventListener('statechange', onChange);
      if (worker.state === 'activated') resolve();
      else reject(new Error('Service worker timeout'));
    }, timeoutMs);

    function onChange() {
      if (worker.state === 'activated') {
        window.clearTimeout(timer);
        worker.removeEventListener('statechange', onChange);
        resolve();
        return;
      }
      if (worker.state === 'redundant') {
        window.clearTimeout(timer);
        worker.removeEventListener('statechange', onChange);
        reject(new Error('Service worker redundant'));
      }
    }

    worker.addEventListener('statechange', onChange);
  });
}

async function getPushRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.register('/push-sw.js', {
    scope: '/',
    updateViaCache: 'none',
  });

  const pending = reg.installing || reg.waiting;
  if (pending) await waitForWorkerActivated(pending);
  if (!reg.active) {
    await Promise.race([
      navigator.serviceWorker.ready,
      delay(15000).then(() => {
        throw new Error('Service worker timeout');
      }),
    ]);
  }
  if (!reg.active) throw new Error('Service worker registration failed');

  if (!navigator.serviceWorker.controller) {
    await Promise.race([
      new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
      }),
      delay(1500),
    ]);
  }

  await delay(50);
  return reg;
}

async function subscribeWithKey(
  reg: ServiceWorkerRegistration,
  publicKey: string,
): Promise<PushSubscription> {
  const expected = vapidKeyBytes(publicKey);
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    const current = existing.options.applicationServerKey
      ? toUint8(existing.options.applicationServerKey)
      : null;
    if (!current || uint8Equal(current, expected)) return existing;
    await existing.unsubscribe().catch(() => undefined);
    await delay(350);
  }

  let lastErr: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: expected.slice(),
      });
    } catch (err) {
      lastErr = err;
      const name = err instanceof DOMException ? err.name : '';
      const leftover = await reg.pushManager.getSubscription();
      if (leftover) return leftover;
      const msg = err instanceof Error ? err.message : '';
      if (/push service not available/i.test(msg)) throw err;
      if (name !== 'AbortError' && name !== 'InvalidStateError') throw err;
      await delay(400 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Push subscribe aborted');
}

let subscribeLock: Promise<void> = Promise.resolve();

function withSubscribeLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = subscribeLock.then(fn, fn);
  subscribeLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function pushErrorMessage(err: unknown, fr: boolean) {
  const name = err instanceof DOMException ? err.name : '';
  const raw = err instanceof Error ? err.message : '';
  if (name === 'NotAllowedError' || /permission|not allowed/i.test(raw)) {
    return fr
      ? 'Le navigateur a bloqué les notifications. Autorise-les pour epiai.eu, puis réessaie.'
      : 'The browser blocked notifications. Allow them for epiai.eu, then try again.';
  }
  if (/push service not available/i.test(raw)) {
    return fr
      ? 'Ce navigateur ne peut pas recevoir d’alertes hors ligne (souvent Chromium sous Linux). Ouvre Epi’AI dans Google Chrome, Firefox ou Edge, puis réessaie.'
      : 'This browser cannot receive background alerts (common with Chromium on Linux). Open Epi’AI in Google Chrome, Firefox or Edge, then try again.';
  }
  if (name === 'AbortError' || name === 'InvalidStateError') {
    return fr
      ? 'Le navigateur a interrompu l’activation. Recharge la page, puis réessaie.'
      : 'The browser interrupted activation. Reload the page, then try again.';
  }
  if (/service worker|registration|timeout/i.test(raw)) {
    return fr
      ? 'Le service des alertes n’a pas démarré. Recharge la page et réessaie.'
      : 'The alert service did not start. Reload the page and try again.';
  }
  if (/vapid/i.test(raw)) {
    return fr
      ? 'Les alertes ne sont pas encore activées sur le serveur. Préviens un admin.'
      : 'Alerts are not configured on the server yet. Ask an admin.';
  }
  return fr
    ? 'L’activation a échoué. Rien n’a été enregistré. Recharge la page, autorise les notifications, puis réessaie.'
    : 'Activation failed. Nothing was saved. Reload, allow notifications, then try again.';
}

async function persistSubscription(
  sub: PushSubscription,
  sendTest: boolean,
): Promise<{ ok: boolean; pushed: number; pushReady: boolean; status: number }> {
  const json = sub.toJSON();
  const saveRes = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      sendTest,
    }),
  });
  const data = (await saveRes.json().catch(() => ({}))) as {
    pushed?: number;
    pushReady?: boolean;
  };
  return {
    ok: saveRes.ok,
    pushed: data.pushed || 0,
    pushReady: data.pushReady !== false,
    status: saveRes.status,
  };
}

async function activatePush(sendTest: boolean) {
  const [keyRes, reg] = await Promise.all([
    fetch('/api/push/vapid-key'),
    getPushRegistration(),
  ]);
  if (!keyRes.ok) {
    throw new Error('VAPID key unavailable');
  }
  const { publicKey } = (await keyRes.json()) as { publicKey?: string };
  if (!publicKey) throw new Error('VAPID key unavailable');

  const sub = await subscribeWithKey(reg, publicKey);
  const saved = await persistSubscription(sub, sendTest);
  if (!saved.ok) throw new Error('persist failed');
  if (!saved.pushReady) throw new Error('push not ready');
  return saved;
}

export default function PushNotificationManager() {
  const params = useParams();
  const fr = ((params.locale as string) || 'fr') === 'fr';
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [iosNeedsInstall, setIosNeedsInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
    setIosNeedsInstall(isIosDevice() && !isStandaloneDisplay());

    const wasDismissed = localStorage.getItem('epiai-push-dismissed');
    if (wasDismissed === 'true') setDismissed(true);

    if (!ok || Notification.permission !== 'granted') return;

    void withSubscribeLock(async () => {
      try {
        const existingReg = await navigator.serviceWorker.getRegistration('/');
        const existing = await existingReg?.pushManager.getSubscription();
        if (existing) {
          await persistSubscription(existing, false);
          return;
        }
        await activatePush(false);
      } catch {
        setError(
          fr
            ? 'Les alertes ne sont pas encore enregistrées. Clique sur Activer.'
            : 'Alerts are not saved yet. Click Turn on.',
        );
      }
    });
  }, [fr]);

  const subscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await withSubscribeLock(async () => {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          setPermission(perm);
        } else {
          setPermission(Notification.permission);
        }

        if (Notification.permission === 'denied') {
          setError(
            fr
              ? 'Le navigateur a bloqué les notifications. Autorise-les dans les paramètres du site, puis réessaie.'
              : 'The browser blocked notifications. Allow them in the site settings, then try again.',
          );
          return;
        }
        if (Notification.permission !== 'granted') return;
        await delay(150);

        try {
          await activatePush(true);
        } catch (err) {
          if (err instanceof Error && err.message === 'VAPID key unavailable') {
            setError(
              fr
                ? 'Les alertes ne sont pas encore activées sur le serveur. Rien n’a été enregistré.'
                : 'Alerts are not configured on the server yet. Nothing was saved.',
            );
            return;
          }
          if (err instanceof Error && err.message === 'persist failed') {
            setError(
              fr
                ? 'Le navigateur a accepté, mais l’enregistrement a échoué. Réessaie.'
                : 'The browser allowed it, but saving failed. Try again.',
            );
            return;
          }
          if (err instanceof Error && err.message === 'push not ready') {
            setError(
              fr
                ? 'Abonnement enregistré, mais le serveur ne peut pas encore envoyer d’alerte. Préviens un admin.'
                : 'Subscription saved, but the server cannot send alerts yet.',
            );
            return;
          }
          throw err;
        }

        localStorage.removeItem('epiai-push-dismissed');
        setSuccess(true);
        window.setTimeout(() => setDismissed(true), 6000);
      });
    } catch (err) {
      console.warn('[Push] Subscription failed:', err);
      setError(pushErrorMessage(err, fr));
    } finally {
      setLoading(false);
    }
  }, [fr]);

  const dismiss = () => {
    localStorage.setItem('epiai-push-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed && !success) return null;
  if (!iosNeedsInstall && (!supported || permission === 'granted') && !success && !error) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
        <div>
          <p className="text-sm font-medium text-primary">
            {success
              ? fr
                ? 'Alertes activées'
                : 'Alerts on'
              : iosNeedsInstall
                ? fr
                  ? 'Alertes iPhone'
                  : 'iPhone alerts'
                : fr
                  ? 'Activer les alertes hors ligne'
                  : 'Turn on alerts'}
          </p>
          <p className="text-xs text-secondary mt-0.5">
            {success
              ? fr
                ? 'Une notification de test vient d’être envoyée. Tu seras prévenu pour le forum, le chat et les événements, même sans ouvrir Epi’AI.'
                : 'A test notification was just sent. You’ll get alerts for the forum, chat and events even when Epi’AI is closed.'
              : iosNeedsInstall
                ? fr
                  ? 'Sur iPhone : Partager → Sur l’écran d’accueil, ouvre Epi’AI depuis l’icône, puis appuie sur Activer.'
                  : 'On iPhone: Share → Add to Home Screen, open Epi’AI from the icon, then tap Turn on.'
                : fr
                  ? 'Reçois une notification sur ton appareil quand il y a une réponse forum, un événement ou un message chat — même sans ouvrir Epi’AI.'
                  : 'Get a notification on your device for a forum reply, an event, or a chat message — even when Epi’AI is closed.'}
          </p>
          {error ? <p className="text-xs text-red-400 mt-1">{error}</p> : null}
        </div>
      </div>
      {!success && (
        <div className="flex items-center gap-2 shrink-0">
          {(!iosNeedsInstall || isStandaloneDisplay()) && supported && permission !== 'denied' && (
            <button
              type="button"
              onClick={subscribe}
              disabled={loading}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-brand-500 disabled:opacity-50"
            >
              {loading ? (fr ? 'Activation…' : 'Turning on…') : fr ? 'Activer' : 'Turn on'}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1.5 text-muted hover:bg-card-muted hover:text-primary"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function PushSettingsToggle() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window,
    );
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setEnabled(Notification.permission === 'granted');
    }
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        if (Notification.permission === 'granted') {
          const reg = await navigator.serviceWorker.getRegistration('/');
          const sub = await reg?.pushManager.getSubscription();
          if (sub) {
            await fetch('/api/push/subscribe', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
            await sub.unsubscribe();
          }
          setEnabled(false);
        } else {
          window.location.reload();
        }
      }}
      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary"
    >
      {enabled ? <Bell className="h-3.5 w-3.5 text-brand-400" /> : <BellOff className="h-3.5 w-3.5" />}
      {enabled ? 'Alertes activées' : 'Alertes désactivées'}
    </button>
  );
}
