'use client';

import { useEffect, type RefObject } from 'react';

const LG = 1024;
const MIN_H = 220;

type VirtualKeyboardLike = {
  overlaysContent: boolean;
  boundingRect: { height: number };
  addEventListener: (type: 'geometrychange', listener: () => void) => void;
  removeEventListener: (type: 'geometrychange', listener: () => void) => void;
};

function getVirtualKeyboard(): VirtualKeyboardLike | null {
  return (
    (navigator as Navigator & { virtualKeyboard?: VirtualKeyboardLike }).virtualKeyboard ??
    null
  );
}

function isEditable(el: EventTarget | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable;
}

function scrollMessagesToBottom(root: HTMLElement) {
  const list =
    root.querySelector<HTMLElement>('.str-chat__list') ||
    root.querySelector<HTMLElement>('.str-chat__message-list-scroll');
  if (!list) return;
  list.scrollTop = list.scrollHeight;
}

/**
 * Zone réellement visible : visualViewport (iOS / Chrome resizes-visual)
 * plus l’inset Virtual Keyboard si le clavier recouvre sans rétrécir le viewport.
 */
function visibleFrame(): { top: number; height: number } {
  const vv = window.visualViewport;
  const top = vv?.offsetTop ?? 0;
  const vvHeight = vv?.height ?? window.innerHeight;
  const vkHeight = getVirtualKeyboard()?.boundingRect.height ?? 0;

  const alreadyExcluded = Math.max(0, window.innerHeight - top - vvHeight);
  const extraOverlay = Math.max(0, vkHeight - alreadyExcluded);

  return {
    top,
    height: Math.max(MIN_H, vvHeight - extraOverlay),
  };
}

/**
 * La conversation remplit le viewport visible. Quand le clavier sort,
 * cette zone rétrécit : les derniers messages restent au-dessus du champ.
 */
export function useChatViewport(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const body = document.body;
    const html = document.documentElement;
    const prev = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: html.style.overflow,
    };

    let lastHeight = 0;
    const timers: number[] = [];

    const clearTimers = () => {
      while (timers.length) window.clearTimeout(timers.pop());
    };

    const resetDesktop = () => {
      el.style.position = '';
      el.style.top = '';
      el.style.left = '';
      el.style.right = '';
      el.style.height = '';
      el.style.zIndex = '';
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      html.style.overflow = prev.htmlOverflow;
    };

    const layout = (pinBottom = false) => {
      if (window.innerWidth >= LG) {
        resetDesktop();
        return;
      }

      if (window.scrollY !== 0) window.scrollTo(0, 0);
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = '0';
      body.style.width = '100%';
      html.style.overflow = 'hidden';

      const { top, height } = visibleFrame();
      el.style.position = 'fixed';
      el.style.left = '0';
      el.style.right = '0';
      el.style.top = `${Math.round(top)}px`;
      el.style.height = `${Math.round(height)}px`;
      el.style.zIndex = '25';

      const keyboardOpened = lastHeight > 0 && height < lastHeight - 48;
      lastHeight = height;
      if (pinBottom || keyboardOpened) {
        requestAnimationFrame(() => scrollMessagesToBottom(el));
      }
    };

    const relayoutSoon = (pinBottom: boolean) => {
      layout(pinBottom);
      requestAnimationFrame(() => layout(pinBottom));
      clearTimers();
      for (const ms of [50, 160, 320, 500]) {
        timers.push(window.setTimeout(() => layout(pinBottom), ms));
      }
    };

    const onViewport = () => layout(false);
    const onOrientation = () => relayoutSoon(true);
    const onFocusIn = (e: FocusEvent) => {
      if (isEditable(e.target) && el.contains(e.target)) relayoutSoon(true);
    };
    const onFocusOut = () => relayoutSoon(false);
    const onVk = () => layout(true);

    layout(true);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', onViewport);
    vv?.addEventListener('scroll', onViewport);
    window.addEventListener('resize', onViewport);
    window.addEventListener('orientationchange', onOrientation);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    const vk = getVirtualKeyboard();
    const prevOverlays = vk?.overlaysContent;
    if (vk) vk.overlaysContent = true;
    vk?.addEventListener('geometrychange', onVk);

    return () => {
      clearTimers();
      vv?.removeEventListener('resize', onViewport);
      vv?.removeEventListener('scroll', onViewport);
      window.removeEventListener('resize', onViewport);
      window.removeEventListener('orientationchange', onOrientation);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      vk?.removeEventListener('geometrychange', onVk);
      if (vk && prevOverlays !== undefined) vk.overlaysContent = prevOverlays;
      resetDesktop();
    };
  }, [ref]);
}
