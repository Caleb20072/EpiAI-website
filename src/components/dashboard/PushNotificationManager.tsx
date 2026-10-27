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

async function getPushRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
  if (reg.installing) {
    await new Promise<void>((resolve) => {
      const worker = reg.installing;
      if (!worker) {
        resolve();
        return;
      }
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated' || worker.state === 'redundant') resolve();
      });
    });
  }
  await reg.update().catch(() => undefined);
  return reg;
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

    if (ok && Notification.permission === 'granted') {
      void (async () => {
        try {
          const keyRes = await fetch('/api/push/vapid-key');
          if (!keyRes.ok) return;
          const { publicKey } = await keyRes.json();
          if (!publicKey) return;
          const reg = await getPushRegistration();
          let sub = await reg.pushManager.getSubscription();
          if (!sub) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
          }
          await persistSubscription(sub, false);
        } catch {
          /* silent repair */
        }
      })();
    }
  }, []);

  const subscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const keyRes = await fetch('/api/push/vapid-key');
      if (!keyRes.ok) {
        setError(
          fr
            ? 'Les alertes ne sont pas encore activées sur le serveur. Rien n’a été enregistré.'
            : 'Alerts are not configured on the server yet. Nothing was saved.',
        );
        return;
      }
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setError(
          fr
            ? 'Les alertes ne sont pas encore activées sur le serveur. Rien n’a été enregistré.'
            : 'Alerts are not configured on the server yet. Nothing was saved.',
        );
        return;
      }

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'denied') {
        setError(
          fr
            ? 'Le navigateur a bloqué les notifications. Autorise-les dans les paramètres du site, puis réessaie.'
            : 'The browser blocked notifications. Allow them in the site settings, then try again.',
        );
        return;
      }
      if (perm !== 'granted') return;

      const reg = await getPushRegistration();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const saved = await persistSubscription(sub, true);
      if (!saved.ok) {
        setError(
          fr
            ? 'Le navigateur a accepté, mais l’enregistrement a échoué. Réessaie.'
            : 'The browser allowed it, but saving failed. Try again.',
        );
        return;
      }
      if (!saved.pushReady) {
        setError(
          fr
            ? 'Abonnement enregistré, mais le serveur ne peut pas encore envoyer d’alerte. Préviens un admin.'
            : 'Subscription saved, but the server cannot send alerts yet.',
        );
        return;
      }

      localStorage.removeItem('epiai-push-dismissed');
      setSuccess(true);
      window.setTimeout(() => setDismissed(true), 6000);
    } catch (err) {
      console.warn('[Push] Subscription failed:', err);
      setError(
        fr
          ? 'L’activation a échoué. Rien n’a été enregistré.'
          : 'Activation failed. Nothing was saved.',
      );
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
