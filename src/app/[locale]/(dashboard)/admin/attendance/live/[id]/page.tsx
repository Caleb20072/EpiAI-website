'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader, Panel } from '@/components/ui';

export default function LiveAttendancePage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const id = params.id as string;
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    async function tick() {
      const res = await fetch(`/api/activities/${id}/attendance-code`);
      if (!res.ok || stop) return;
      const data = await res.json();
      setCode(data.code);
      setExpiresAt(data.expiresAt);
    }
    void tick();
    const timer = setInterval(tick, 2000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [id]);

  const target =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/presence?a=${id}`
      : '';
  const qr = target
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(target)}`
    : '';

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <PageHeader
        title={fr ? 'Présence en direct' : 'Live attendance'}
        description={
          fr
            ? 'Le code change toutes les 10 secondes. Les étudiants scannent puis le saisissent sur Epi’AI.'
            : 'The code changes every 10 seconds. Students scan, then type it on Epi’AI.'
        }
      />
      <Panel>
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="QR" className="mx-auto rounded-xl bg-white p-3" />
        ) : null}
        <p className="mt-6 text-5xl font-mono tracking-[0.3em] text-primary">{code || '------'}</p>
        <p className="text-xs text-muted mt-2">
          {expiresAt ? new Date(expiresAt).toLocaleTimeString(locale) : ''}
        </p>
      </Panel>
    </div>
  );
}
