'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader, Panel, Button } from '@/components/ui';

export default function PresencePage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const [activityId, setActivityId] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('a');
    if (id) setActivityId(id);
  }, []);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setOk(false);
    const res = await fetch(`/api/activities/${activityId}/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setOk(res.ok);
    setMessage(res.ok ? (fr ? 'Présence enregistrée.' : 'Marked present.') : data.error || 'Erreur');
  }

  return (
    <div className="max-w-md space-y-5">
      <PageHeader
        title={fr ? 'Pointer ma présence' : 'Check in'}
        description={
          fr
            ? 'Scanne le QR affiché en séance, puis saisis le code à 6 chiffres tant qu’il est valide (10 secondes).'
            : 'Scan the session QR, then enter the 6-digit code while it is still valid (10 seconds).'
        }
      />
      <Panel>
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            placeholder={fr ? 'Identifiant activité' : 'Activity id'}
            className="w-full rounded-lg border border-default bg-card px-3 py-2 text-sm"
          />
          <input
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="w-full rounded-lg border border-default bg-card px-3 py-2 text-2xl tracking-[0.4em] text-center"
          />
          <Button type="submit">{fr ? 'Valider' : 'Confirm'}</Button>
          {message && (
            <p className={ok ? 'text-sm text-brand-500' : 'text-sm text-red-400'}>{message}</p>
          )}
        </form>
      </Panel>
    </div>
  );
}
