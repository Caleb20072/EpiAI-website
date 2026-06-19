'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

const STEP_KEYS = ['welcome', 'profile', 'chat', 'resources', 'done'] as const;

export default function OnboardingWizard() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const t = useTranslations('Onboarding');
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    fetch('/api/onboarding')
      .then((r) => r.json())
      .then((data) => {
        if (!data.done) {
          setVisible(true);
          setStep(data.step || 0);
        }
      })
      .catch(() => {});
  }, []);

  const finish = async (done: boolean) => {
    const nextStep = done ? STEP_KEYS.length - 1 : Math.min(step + 1, STEP_KEYS.length - 1);
    await fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: nextStep, done }),
    });
    if (done) setVisible(false);
    else setStep(nextStep);
  };

  if (!visible) return null;

  const key = STEP_KEYS[step] || 'welcome';
  const isLast = step >= STEP_KEYS.length - 1;

  const actions: Record<string, { href: string; label: string } | null> = {
    welcome: null,
    profile: { href: '/profile', label: t('actions.profile') },
    chat: { href: '/chat', label: t('actions.chat') },
    resources: { href: '/resources', label: t('actions.resources') },
    done: { href: '/events', label: t('actions.events') },
  };

  const action = actions[key];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={() => finish(true)}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1"
          aria-label={t('skip')}
        >
          <X className="w-5 h-5" />
        </button>
        <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">
          {t('label')} {step + 1}/{STEP_KEYS.length}
        </p>
        <h2 id="onboarding-title" className="text-xl font-bold text-white mb-3">
          {t(`steps.${key}.title`)}
        </h2>
        <p className="text-white/60 text-sm mb-6">{t(`steps.${key}.body`)}</p>
        <div className="flex gap-3 flex-wrap">
          {action && (
            <Link
              href={action.href}
              onClick={() => finish(false)}
              className="inline-flex items-center gap-1 flex-1 justify-center py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium min-w-[120px]"
            >
              {action.label}
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={() => finish(false)}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm min-w-[120px]"
            >
              {t('next')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => finish(true)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm"
            >
              {t('finish')}
            </button>
          )}
          <button
            type="button"
            onClick={() => finish(true)}
            className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white text-sm"
          >
            {t('skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
