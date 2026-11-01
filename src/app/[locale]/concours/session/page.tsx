'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PdfPages } from '@/components/admission/PdfPages';

type Question = { id: string; prompt: string; type: string; points: number; response: string };

type Session = {
  firstName: string;
  examTitle: string;
  instructions: string;
  startsAt: string;
  closeAt: string;
  started: boolean;
  submitted: boolean;
  ended: boolean;
  hasSubjectPdf?: boolean;
  questions: Question[];
};

function remainingLabel(closeAt: string) {
  const ms = new Date(closeAt).getTime() - Date.now();
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ExamSessionPage() {
  const params = useParams();
  const locale = (params.locale as string) === 'en' ? 'en' : 'fr';
  const fr = locale === 'fr';
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [clock, setClock] = useState('--:--');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const report = useCallback((event: string, detail = '') => {
    void fetch('/api/exam/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'event', event, detail }),
    });
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        report('fullscreen_enter');
      }
    } catch {
      report('fullscreen_exit', 'request_failed');
    }
  }, [report]);

  async function load() {
    const res = await fetch('/api/exam/session');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Session invalide');
    setSession(json);
    if (json.submitted || json.ended) {
      setDone(true);
      return;
    }
    const next: Record<string, string> = {};
    for (const q of json.questions as Question[]) next[q.id] = q.response || '';
    setAnswers(next);
  }

  const submit = useCallback(
    async (timedOut = false) => {
      if (submitting || done) return;
      setSubmitting(true);
      const payload = Object.entries(answersRef.current).map(([questionId, response]) => ({
        questionId,
        response,
      }));
      await fetch('/api/exam/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', answers: payload, timedOut }),
      });
      setDone(true);
      setSubmitting(false);
    },
    [done, submitting],
  );

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Erreur'));
  }, []);

  useEffect(() => {
    void enterFullscreen();
    const onFs = () => {
      if (!document.fullscreenElement) {
        report('fullscreen_exit');
        void enterFullscreen();
      }
    };
    const onVis = () => report(document.hidden ? 'tab_hidden' : 'tab_visible');
    const onBlur = () => report('window_blur');
    const onFocus = () => report('window_focus');
    const block = (e: Event) => {
      e.preventDefault();
      const type =
        e.type === 'copy' ? 'copy' : e.type === 'paste' ? 'paste' : e.type === 'cut' ? 'cut' : 'context_menu';
      report(type);
    };
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const blocked =
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u', 's', 'p', 'a'].includes(key)) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key));
      if (blocked) {
        e.preventDefault();
        report('shortcut', e.key);
      }
    };
    const onPrint = (e: Event) => {
      e.preventDefault();
      report('print');
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('contextmenu', block);
    document.addEventListener('keydown', onKey);
    window.addEventListener('beforeprint', onPrint);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeprint', onPrint);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, [enterFullscreen, report]);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (!session) return;
      setClock(remainingLabel(session.started ? session.closeAt : session.startsAt));
      if (session.started && !done && new Date(session.closeAt).getTime() <= Date.now()) {
        void submit(true);
      }
    }, 250);
    return () => window.clearInterval(t);
  }, [session, done, submit]);

  useEffect(() => {
    if (!session?.started || done) return;
    const t = window.setInterval(() => {
      const payload = Object.entries(answersRef.current).map(([questionId, response]) => ({
        questionId,
        response,
      }));
      void fetch('/api/exam/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload }),
      });
    }, 15000);
    return () => window.clearInterval(t);
  }, [session?.started, done]);

  useEffect(() => {
    if (!session || session.started || done) return;
    const t = window.setInterval(() => {
      load().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(t);
  }, [session, done]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b16] px-4 text-red-200">
        {error}
      </div>
    );
  }
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b16] text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (done || session.submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b16] px-4 text-center text-white">
        <div>
          <h1 className="text-2xl font-semibold">{fr ? 'Copie envoyée' : 'Paper submitted'}</h1>
          <p className="mt-3 max-w-md text-sm text-white/70">
            {fr
              ? 'Tes réponses ont été transmises au jury. Tu seras contacté(e) par e-mail après correction.'
              : 'Your answers were sent to the board. You will hear by email after grading.'}
          </p>
        </div>
      </div>
    );
  }

  if (!session.started) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b16] px-4 text-center text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Epi’AI</p>
        <h1 className="mt-2 text-2xl font-semibold">{session.examTitle}</h1>
        <p className="mt-4 text-white/70">{fr ? 'Début dans' : 'Starts in'}</p>
        <p className="mt-2 font-mono text-5xl tabular-nums">{clock}</p>
        <p className="mt-6 max-w-md text-sm text-white/60">
          {fr
            ? 'Reste sur cette page en plein écran. Toute sortie d’onglet est enregistrée.'
            : 'Stay on this page in fullscreen. Leaving the tab is recorded.'}
        </p>
        <button
          type="button"
          onClick={() => void enterFullscreen()}
          className="mt-6 cursor-pointer rounded-lg bg-[#3479F0] px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#2b6ae3]"
        >
          {fr ? 'Plein écran' : 'Fullscreen'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b16] text-white select-none">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#070b16]/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-medium">{session.examTitle}</p>
          <p className="text-xs text-white/50">{session.firstName}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl tabular-nums text-amber-300">{clock}</p>
          <p className="text-[11px] text-white/40">{fr ? 'Temps restant' : 'Time left'}</p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {session.hasSubjectPdf ? (
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-blue-300">
              {fr ? 'Sujet complet (toutes les pages)' : 'Full exam paper (every page)'}
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
              <PdfPages src="/api/exam/subject" />
            </div>
          </section>
        ) : session.instructions ? (
          <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">{session.instructions}</p>
        ) : null}
        <p className="text-sm text-white/60">
          {fr
            ? 'Lis le sujet ci-dessus en entier, puis écris tes réponses ici.'
            : 'Read the full paper above, then write your answers here.'}
        </p>
        {session.questions.map((q, i) => (
          <section key={q.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-blue-300">
              {fr ? 'Réponse' : 'Answer'} {i + 1} · {q.points} pt
            </p>
            {q.prompt ? (
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{q.prompt}</p>
            ) : null}
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              rows={q.type === 'long' ? 8 : 3}
              className="mt-4 w-full cursor-text select-text rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white transition-colors hover:border-white/25 focus:border-[#3479F0] focus:outline-none focus:ring-2 focus:ring-[#3479F0]/40"
              placeholder={fr ? 'Ta réponse' : 'Your answer'}
            />
          </section>
        ))}
        <button
          type="button"
          disabled={submitting}
          onClick={() => void submit(false)}
          className="mb-16 w-full cursor-pointer rounded-xl bg-[#3479F0] py-3 text-sm font-semibold transition-colors hover:bg-[#2b6ae3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (fr ? 'Envoi…' : 'Sending…') : fr ? 'Envoyer ma copie' : 'Submit paper'}
        </button>
      </main>
    </div>
  );
}
