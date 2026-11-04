'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ExamLoginPage() {
  const params = useParams();
  const locale = (params.locale as string) === 'en' ? 'en' : 'fr';
  const fr = locale === 'fr';
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/exam/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connexion impossible');
      router.push(`/${locale}/concours/session`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b16] px-4 py-16 text-white">
      <form onSubmit={submit} className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Epi’AI</p>
        <h1 className="mt-2 text-2xl font-semibold">{fr ? 'Salle d’examen' : 'Exam room'}</h1>
        <p className="mt-2 text-sm text-white/70">
          {fr
            ? 'Identifiants reçus par e-mail, 10 minutes avant le test. Pas ceux d’un compte membre.'
            : 'Use the login emailed 10 minutes before the test - not a member account.'}
        </p>
        {error ? <p className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p> : null}
        <label className="mt-6 block text-xs uppercase tracking-wide text-white/50">
          {fr ? 'Identifiant' : 'Login'}
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white transition-colors hover:border-white/25 focus:border-[#3479F0] focus:outline-none focus:ring-2 focus:ring-[#3479F0]/40"
            required
          />
        </label>
        <label className="mt-4 block text-xs uppercase tracking-wide text-white/50">
          {fr ? 'Mot de passe' : 'Password'}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white transition-colors hover:border-white/25 focus:border-[#3479F0] focus:outline-none focus:ring-2 focus:ring-[#3479F0]/40"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3479F0] py-3 text-sm font-semibold transition-colors hover:bg-[#2b6ae3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {fr ? 'Entrer' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
