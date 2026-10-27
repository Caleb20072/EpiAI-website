'use client';

import { useEffect, type RefObject } from 'react';

const LG = 1024;

function scrollMessagesToBottom(root: HTMLElement) {
  const list =
    root.querySelector<HTMLElement>('.str-chat__list') ||
    root.querySelector<HTMLElement>('.str-chat__message-list-scroll');
  if (!list) return;
  list.scrollTop = list.scrollHeight;
}

/**
 * La conversation remplit le viewport visible. Quand le clavier sort,
 * cette zone rétrécit : les messages restent dans le chat, au-dessus du champ.
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

    const layout = () => {
      if (window.innerWidth >= LG) {
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
        return;
      }

      window.scrollTo(0, 0);
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = '0';
      body.style.width = '100%';
      html.style.overflow = 'hidden';

      const vv = window.visualViewport;
      const top = vv?.offsetTop ?? 0;
      const height = vv?.height ?? window.innerHeight;

      el.style.position = 'fixed';
      el.style.left = '0';
      el.style.right = '0';
      el.style.top = `${Math.round(top)}px`;
      el.style.height = `${Math.round(Math.max(220, height))}px`;
      el.style.zIndex = '25';

      scrollMessagesToBottom(el);
    };

    layout();
    const vv = window.visualViewport;
    vv?.addEventListener('resize', layout);
    vv?.addEventListener('scroll', layout);
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', layout);

    return () => {
      vv?.removeEventListener('resize', layout);
      vv?.removeEventListener('scroll', layout);
      window.removeEventListener('resize', layout);
      window.removeEventListener('orientationchange', layout);
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      html.style.overflow = prev.htmlOverflow;
    };
  }, [ref]);
}
