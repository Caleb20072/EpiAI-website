'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, Panel, Button, EmptyState, Badge } from '@/components/ui';
import { GraduationCap, Plus } from 'lucide-react';

interface ModuleRow {
  id: string;
  name: string;
  description: string;
  leadName: string;
  isLead: boolean;
  enrolled: boolean;
  level: number;
  enrollmentCount: number;
  projectCount: number;
}

export default function ModulesPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const { isAdmin } = useAuth();
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', leadUserId: '' });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/modules');
    if (res.ok) setModules(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createModule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Erreur');
      return;
    }
    setForm({ name: '', description: '', leadUserId: '' });
    await load();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={fr ? 'Modules' : 'Modules'}
        description={
          fr
            ? 'Tous les modules de l’asso. Tu t’inscris toi-même. Le lead peut aussi t’inscrire de force.'
            : 'Every association module. You enroll yourself. A lead can also force-enroll you.'
        }
      />

      {isAdmin && (
        <Panel title={fr ? 'Nouveau module' : 'New module'}>
          <form onSubmit={createModule} className="grid gap-3 md:grid-cols-2">
            <input
              required
              placeholder={fr ? 'Nom du module' : 'Module name'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-default bg-card px-3 py-2 text-sm"
            />
            <input
              required
              placeholder={fr ? 'ID Clerk du lead' : 'Lead Clerk user id'}
              value={form.leadUserId}
              onChange={(e) => setForm({ ...form, leadUserId: e.target.value })}
              className="rounded-lg border border-default bg-card px-3 py-2 text-sm"
            />
            <textarea
              placeholder={fr ? 'Description' : 'Description'}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="md:col-span-2 rounded-lg border border-default bg-card px-3 py-2 text-sm"
              rows={2}
            />
            {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
            <div>
              <Button type="submit" size="sm">
                <Plus className="w-4 h-4" />
                {fr ? 'Créer' : 'Create'}
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted mt-2">
            {fr
              ? 'Le lead se trouve dans Clerk (User ID). Il verra ce module dans son interface.'
              : 'The lead is a Clerk user id. They will see this module in their interface.'}
          </p>
        </Panel>
      )}

      {loading ? (
        <p className="text-sm text-secondary">{fr ? 'Chargement…' : 'Loading…'}</p>
      ) : modules.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-10 h-10" />}
          title={fr ? 'Aucun module pour le moment' : 'No modules yet'}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {modules.map((mod) => (
            <Link key={mod.id} href={`/${locale}/modules/${mod.id}`}>
              <Panel className="h-full hover:border-brand-500/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-primary">{mod.name}</h2>
                  {mod.isLead ? <Badge variant="amber">{fr ? 'Lead' : 'Lead'}</Badge> : null}
                </div>
                <p className="text-sm text-secondary mt-1 line-clamp-2">{mod.description}</p>
                <p className="text-xs text-muted mt-3">
                  {fr ? 'Lead' : 'Lead'} : {mod.leadName} · {mod.projectCount}{' '}
                  {fr ? 'projets' : 'projects'} · {fr ? 'Niveau' : 'Level'} {mod.level}
                </p>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
