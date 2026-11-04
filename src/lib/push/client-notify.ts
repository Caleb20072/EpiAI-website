/**
 * Affiche une notification système côté client (via le service worker).
 * Sert de secours quand l'app est ouverte en arrière-plan / autre onglet,
 * et quand le webhook Stream n'a pas encore livré le push serveur.
 */

export type ClientNotifyPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  /** Forcer même si l'onglet est visible (ex. message chat hors canal actif). */
  force?: boolean;
};

const recentTags = new Map<string, number>();
const DEDUPE_MS = 8_000;

function shouldDedupe(tag: string | undefined): boolean {
  if (!tag) return false;
  const now = Date.now();
  const last = recentTags.get(tag) ?? 0;
  if (now - last < DEDUPE_MS) return true;
  recentTags.set(tag, now);
  if (recentTags.size > 40) {
    const cutoff = now - DEDUPE_MS;
    for (const [k, t] of recentTags) {
      if (t < cutoff) recentTags.delete(k);
    }
  }
  return false;
}

export async function showClientNotification(payload: ClientNotifyPayload): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  if (!payload.force && !document.hidden) return false;
  if (shouldDedupe(payload.tag)) return false;

  const data = {
    type: 'SHOW_NOTIFICATION' as const,
    title: payload.title || "Epi'AI",
    body: payload.body || '',
    url: payload.url || '/fr/dashboard',
    tag: payload.tag || 'epiai-alert',
  };

  try {
    const reg =
      (await navigator.serviceWorker.getRegistration('/')) ||
      (await navigator.serviceWorker.getRegistration());
    if (reg?.active) {
      reg.active.postMessage(data);
      return true;
    }
    if (reg?.showNotification) {
      await reg.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: data.tag,
        data: { url: data.url },
      } as NotificationOptions);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function setAppBadgeCount(count: number) {
  if (typeof navigator === 'undefined') return;
  try {
    if (count > 0 && 'setAppBadge' in navigator) {
      void (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(count);
    } else if (count <= 0 && 'clearAppBadge' in navigator) {
      void (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge();
    }
  } catch {
    /* unsupported */
  }
}
