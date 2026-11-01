'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Loader2, MapPin } from 'lucide-react';

type Slot = { id: string; startsAt: string; examTitle?: string; durationMinutes?: number; room?: string; remaining: number };

function formatWhen(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function AdmissionSlotPage() {
  const params = useParams();
  const locale = (params.locale as string) === 'en' ? 'en' : 'fr';
  const token = String(params.token || '');
  const fr = locale === 'fr';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    firstName: string;
    stage: string;
    examBooking: { startsAt: string; examTitle: string } | null;
    interviewBooking: { startsAt: string; room: string } | null;
    examSlots: Slot[];
    interviewSlots: Slot[];
  } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admission/${token}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lien invalide');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function book(kind: 'exam' | 'interview', slotId: string) {
    setSaving(slotId);
    setError(null);
    try {
      const res = await fetch(`/api/admission/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, slotId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Impossible de réserver');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="paper-page min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-default bg-card p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-400">Epi’AI</p>
        <h1 className="mt-2 text-2xl font-semibold text-primary">
          {fr ? 'Convocation' : 'Invitation'}
        </h1>
        {loading ? (
          <p className="mt-6 flex items-center gap-2 text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" /> {fr ? 'Chargement…' : 'Loading…'}
          </p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        ) : data ? (
          <div className="mt-6 space-y-6">
            <p className="text-secondary">
              {fr ? `Bonjour ${data.firstName}.` : `Hello ${data.firstName}.`}
            </p>
            {data.examBooking ? (
              <div className="rounded-xl border border-brand-500/25 bg-brand-500/10 p-4 text-sm text-primary">
                {fr ? 'Test confirmé :' : 'Test booked:'}{' '}
                <strong>{data.examBooking.examTitle}</strong>
                <br />
                {formatWhen(data.examBooking.startsAt, locale)}
                <p className="mt-2 text-xs text-secondary">
                  {fr
                    ? 'Tes identifiants de composition arriveront 10 minutes avant le début.'
                    : 'Exam login details will arrive 10 minutes before the start.'}
                </p>
              </div>
            ) : null}
            {data.interviewBooking ? (
              <div className="rounded-xl border border-brand-500/25 bg-brand-500/10 p-4 text-sm text-primary">
                {fr ? 'Entretien confirmé' : 'Interview booked'}
                <br />
                {formatWhen(data.interviewBooking.startsAt, locale)}
                {data.interviewBooking.room ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-secondary">
                    <MapPin className="h-3.5 w-3.5" /> {data.interviewBooking.room}
                  </p>
                ) : null}
              </div>
            ) : null}

            {data.examSlots.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-medium text-primary">
                  {fr ? 'Choisis un créneau de test' : 'Pick a test slot'}
                </h2>
                <ul className="space-y-2">
                  {data.examSlots.map((slot) => (
                    <li key={slot.id} className="flex items-center justify-between gap-3 rounded-xl border border-default p-3">
                      <div>
                        <p className="text-sm font-medium text-primary">{slot.examTitle}</p>
                        <p className="text-xs text-secondary">
                          <Calendar className="mr-1 inline h-3.5 w-3.5" />
                          {formatWhen(slot.startsAt, locale)} · {slot.durationMinutes} min
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!!saving}
                        onClick={() => book('exam', slot.id)}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {saving === slot.id ? '…' : fr ? 'Choisir' : 'Choose'}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {data.interviewSlots.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-medium text-primary">
                  {fr ? 'Choisis un créneau d’entretien' : 'Pick an interview slot'}
                </h2>
                <ul className="space-y-2">
                  {data.interviewSlots.map((slot) => (
                    <li key={slot.id} className="flex items-center justify-between gap-3 rounded-xl border border-default p-3">
                      <div>
                        <p className="text-sm text-primary">{formatWhen(slot.startsAt, locale)}</p>
                        {slot.room ? (
                          <p className="text-xs text-secondary">
                            <MapPin className="mr-1 inline h-3.5 w-3.5" />
                            {slot.room}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={!!saving}
                        onClick={() => book('interview', slot.id)}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {saving === slot.id ? '…' : fr ? 'Choisir' : 'Choose'}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {!data.examBooking && !data.interviewBooking && data.examSlots.length === 0 && data.interviewSlots.length === 0 ? (
              <p className="text-sm text-secondary">
                {fr
                  ? 'Aucun créneau n’est ouvert pour le moment. Surveille ta boîte mail.'
                  : 'No slots are open yet. Check your email.'}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
