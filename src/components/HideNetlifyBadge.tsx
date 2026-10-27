'use client';

import { useEffect } from 'react';

const SELECTOR = [
  'iframe[title="Powered by Netlify"]',
  'iframe[title="Netlify Badge"]',
  'iframe[src*="netlify-cdp-loader"]',
  'iframe[src*="app.netlify.com"]',
].join(',');

function removeBadges() {
  document.querySelectorAll(SELECTOR).forEach((el) => el.remove());
}

/** Netlify injecte un iframe « Powered by Netlify » qui recouvre la barre mobile. */
export default function HideNetlifyBadge() {
  useEffect(() => {
    removeBadges();
    const observer = new MutationObserver(removeBadges);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
