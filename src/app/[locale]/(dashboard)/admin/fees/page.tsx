'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Panel, Button, Badge } from '@/components/ui';

interface Due {
  id: string;
  userName: string;
  userEmail: string;
  period: string;
  baseAmount: number;
  lateFee: number;
  status: string;
}

export default function FeesPage() {
  const [dues, setDues] = useState<Due[]>([]);

  async function load() {
    const res = await fetch('/api/admin/fees');
    if (res.ok) setDues(await res.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function markPaid(id: string) {
    await fetch('/api/admin/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Cotisations"
        description="2 000 FCFA / mois. +500 FCFA si le paiement dépasse le 5 du mois. Le paiement mobile (m'bon) sera branché plus tard."
      />
      <Panel>
        <ul className="divide-y divide-default">
          {dues.map((due) => (
            <li key={due.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium text-primary">{due.userName}</p>
                <p className="text-xs text-muted">{due.userEmail}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {due.baseAmount + due.lateFee} FCFA
                  {due.lateFee > 0 ? ` (dont ${due.lateFee} de retard)` : ''}
                </span>
                <Badge variant={due.status === 'paid' ? 'success' : due.status === 'late' ? 'danger' : 'muted'}>
                  {due.status}
                </Badge>
                {due.status !== 'paid' && (
                  <Button size="sm" variant="secondary" onClick={() => void markPaid(due.id)}>
                    Marquer payé
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
