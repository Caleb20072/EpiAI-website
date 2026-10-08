'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/components/ui';
import { CONTRACT_CLAUSES_FR } from '@/lib/modules/contract';

interface Workspace {
  contractAccepted: boolean;
  due: {
    period: string;
    total: number;
    baseAmount: number;
    lateFee: number;
    status: string;
  } | null;
  modules: { id: string; name: string; level: number }[];
}

export function WorkspaceCard({ locale }: { locale: string }) {
  const fr = locale === 'fr';
  const [data, setData] = useState<Workspace | null>(null);

  async function load() {
    const res = await fetch('/api/me/workspace');
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function accept() {
    const res = await fetch('/api/me/workspace', { method: 'POST' });
    if (res.ok) setData(await res.json());
  }

  if (!data) return null;

  return (
    <Panel title={fr ? 'Mon espace asso' : 'My association space'}>
      <div className="space-y-4 text-sm">
        {data.due && (
          <p>
            {fr ? 'Cotisation' : 'Fee'} {data.due.period} : <strong>{data.due.total} FCFA</strong>
            {data.due.lateFee > 0 ? ` (${fr ? 'dont' : 'incl.'} ${data.due.lateFee} ${fr ? 'de retard' : 'late'})` : ''}
            {' · '}
            {data.due.status}
          </p>
        )}
        <div>
          <p className="font-medium mb-2">{fr ? 'Contrat' : 'Agreement'}</p>
          <ul className="list-disc pl-5 space-y-1 text-secondary">
            {CONTRACT_CLAUSES_FR.map((clause) => (
              <li key={clause}>{clause}</li>
            ))}
          </ul>
          {data.contractAccepted ? (
            <p className="mt-2 text-brand-500">{fr ? 'Accepté.' : 'Accepted.'}</p>
          ) : (
            <Button className="mt-3" size="sm" onClick={() => void accept()}>
              {fr ? "J'accepte" : 'I agree'}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.modules.map((mod) => (
            <Link key={mod.id} href={`/${locale}/modules/${mod.id}`} className="text-brand-500 hover:underline">
              {mod.name} · {fr ? 'niveau' : 'level'} {mod.level}
            </Link>
          ))}
          <Link href={`/${locale}/modules`} className="text-muted hover:underline">
            {fr ? 'Tous les modules' : 'All modules'}
          </Link>
        </div>
      </div>
    </Panel>
  );
}
