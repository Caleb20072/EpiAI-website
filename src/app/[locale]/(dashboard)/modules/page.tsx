'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, Panel, Button, EmptyState, Badge } from '@/components/ui';
import { GraduationCap, Plus } from 'lucide-react';
import { MemberPicker } from '@/components/members/MemberPicker';

interface ModuleRow {
  id: string;
  name: string;
  description: string;
  leadUserId: string;
  leadName: string;
  lead2UserId?: string | null;
  lead2Name?: string | null;
  isLead: boolean;
  enrolled: boolean;
  level: number;
  enrollmentCount: number;
  projectCount: number;
}

const emptyForm = {
  name: '',
  description: '',
  leadUserId: '',
  leadName: '',
  lead2UserId: '',
  lead2Name: '',
};

export default function ModulesPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const { isAdmin } = useAuth();
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/modules');
    if (res.ok) setModules(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setPickerKey((key) => key + 1);
  }

  function beginEdit(mod: ModuleRow) {
    setError(null);
    setEditingId(mod.id);
    setForm({
      name: mod.name,
      description: mod.description || '',
      leadUserId: mod.leadUserId,
      leadName: mod.leadName,
      lead2UserId: mod.lead2UserId || '',
      lead2Name: mod.lead2Name || '',
    });
    setPickerKey((key) => key + 1);
    document.getElementById('module-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function saveModule(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.leadUserId) {
      setError(fr ? 'Choisis le lead dans les suggestions.' : 'Pick the lead from the suggestions.');
      return;
    }
    if (form.lead2UserId && form.lead2UserId === form.leadUserId) {
      setError(fr ? 'Choisis deux personnes différentes.' : 'Pick two different people.');
      return;
    }
    const res = await fetch(editingId ? `/api/modules/${editingId}` : '/api/modules', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Erreur');
      return;
    }
    resetForm();
    await load();
  }

  async function removeModule(mod: ModuleRow) {
    const message = fr
      ? `Supprimer définitivement « ${mod.name} » ? Les inscrits, les projets et les ressources de ce module seront effacés.`
      : `Permanently delete “${mod.name}”? Enrollments, projects and resources for this module will be removed.`;
    if (!confirm(message)) return;
    setError(null);
    const res = await fetch(`/api/modules/${mod.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Erreur');
      return;
    }
    if (editingId === mod.id) resetForm();
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
        <Panel title={editingId ? (fr ? 'Modifier le module' : 'Edit module') : fr ? 'Nouveau module' : 'New module'}>
          <form id="module-form" onSubmit={saveModule} className="grid gap-3 md:grid-cols-2">
            <input
              required
              placeholder={fr ? 'Nom du module' : 'Module name'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="md:col-span-2 rounded-lg border border-default bg-card px-3 py-2 text-sm"
            />
            <MemberPicker
              key={`${pickerKey}-1`}
              locale={locale}
              selectedId={form.leadUserId}
              selectedName={form.leadName}
              placeholder={fr ? 'Premier lead' : 'First lead'}
              onSelect={(member) =>
                setForm((current) => ({
                  ...current,
                  leadUserId: member?.id || '',
                  leadName: member?.name || '',
                }))
              }
            />
            <MemberPicker
              key={`${pickerKey}-2`}
              locale={locale}
              required={false}
              selectedId={form.lead2UserId}
              selectedName={form.lead2Name}
              placeholder={fr ? 'Second lead, si besoin' : 'Second lead, if needed'}
              onSelect={(member) =>
                setForm((current) => ({
                  ...current,
                  lead2UserId: member?.id || '',
                  lead2Name: member?.name || '',
                }))
              }
            />
            <textarea
              placeholder={fr ? 'Description' : 'Description'}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="md:col-span-2 rounded-lg border border-default bg-card px-3 py-2 text-sm"
              rows={2}
            />
            {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                {editingId ? null : <Plus className="w-4 h-4" />}
                {editingId ? (fr ? 'Enregistrer' : 'Save') : fr ? 'Créer' : 'Create'}
              </Button>
              {editingId ? (
                <Button type="button" size="sm" variant="secondary" onClick={resetForm}>
                  {fr ? 'Annuler' : 'Cancel'}
                </Button>
              ) : null}
            </div>
          </form>
          <p className="text-xs text-muted mt-2">
            {fr
              ? 'Choisis un ou deux leads. Chacun gère le module et voit le suivi de ses étudiants.'
              : 'Pick one or two leads. Each one manages the module and follows its students.'}
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
            <Panel key={mod.id} className="h-full">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/${locale}/modules/${mod.id}`} className="font-semibold text-primary hover:text-brand-600">
                  {mod.name}
                </Link>
                {mod.isLead ? <Badge variant="amber">{fr ? 'Lead' : 'Lead'}</Badge> : null}
              </div>
              <Link href={`/${locale}/modules/${mod.id}`} className="block">
                <p className="text-sm text-secondary mt-1 line-clamp-2">{mod.description}</p>
                <p className="text-xs text-muted mt-3">
                  {fr ? 'Leads' : 'Leads'} : {[mod.leadName, mod.lead2Name].filter(Boolean).join(' · ')} · {mod.projectCount}{' '}
                  {fr ? 'projets' : 'projects'} · {fr ? 'Niveau' : 'Level'} {mod.level}
                </p>
              </Link>
              {isAdmin ? (
                <div className="flex gap-2 mt-3">
                  <Button type="button" size="sm" variant="secondary" onClick={() => beginEdit(mod)}>
                    {fr ? 'Modifier' : 'Edit'}
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => void removeModule(mod)}>
                    {fr ? 'Supprimer' : 'Delete'}
                  </Button>
                </div>
              ) : null}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
