'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Plus, Edit2, Trash2, Save, Eye, EyeOff, Upload, ImageIcon } from 'lucide-react';
import type { ITeamMember, CreateTeamMemberInput } from '@/lib/team/types';
import { TEAM_POLES } from '@/lib/team/poles';
import {
  PageHeader,
  Button,
  ListRow,
  SectionTitle,
  Modal,
  Input,
  Textarea,
  Select,
} from '@/components/ui';

const SECTION_OPTIONS = [
  { value: 'executive', label: { en: 'Executive Board', fr: 'Bureau Exécutif' } },
  { value: 'referent', label: { en: 'Referent', fr: 'Référent' } },
  { value: 'pole', label: { en: 'Strategic Pole', fr: 'Pôle Stratégique' } },
  { value: 'mentor', label: { en: 'Mentor', fr: 'Mentor' } },
];

export default function AdminTeamPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const fr = locale === 'fr';

  const [members, setMembers] = useState<ITeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ITeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateTeamMemberInput & { isActive?: boolean }>({
    name: '',
    role: '',
    title: '',
    section: 'pole',
    poleKey: '',
    description: '',
    photoUrl: '',
    socialLinks: { linkedin: '', github: '' },
    displayOrder: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch('/api/team-members?all=true');
      if (res.ok) setMembers(await res.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setForm({
      name: '',
      role: '',
      title: '',
      section: 'pole',
      poleKey: '',
      description: '',
      photoUrl: '',
      socialLinks: { linkedin: '', github: '' },
      displayOrder: members.length,
    });
    setShowForm(true);
  }

  function openEditForm(member: ITeamMember) {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      title: member.title || '',
      section: member.section,
      poleKey: member.poleKey || '',
      description: member.description || '',
      photoUrl: member.photoUrl || '',
      socialLinks: { ...member.socialLinks },
      displayOrder: member.displayOrder,
      isActive: member.isActive,
    });
    setShowForm(true);
  }

  const handlePhotoUpload = useCallback(async (file: File) => {
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch('/api/upload/team-photo', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setForm((f) => ({ ...f, photoUrl: data.url }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      console.error('Upload error:', e);
      alert('Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  }, []);

  async function handleSave() {
    try {
      const url = editing ? `/api/team-members/${editing.id}` : '/api/team-members';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || 'Error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(fr ? 'Supprimer ce membre?' : 'Delete this member?')) return;
    try {
      const res = await fetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMembers();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleToggleActive(member: ITeamMember) {
    try {
      const res = await fetch(`/api/team-members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      if (res.ok) fetchMembers();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const grouped = {
    executive: members.filter((m) => m.section === 'executive'),
    pole: members.filter((m) => m.section === 'pole'),
    mentor: members.filter((m) => m.section === 'mentor'),
  };

  return (
    <PermissionGate permission="team.manage">
      <div className="space-y-6">
        <PageHeader
          title={fr ? "Gestion de l'Équipe" : 'Team Management'}
          description={
            fr
              ? "Gérez les membres affichés sur la page d'accueil. Les changements sont immédiats."
              : 'Manage team members displayed on the homepage. Changes are immediate.'
          }
          actions={
            <Button onClick={openCreateForm}>
              <Plus className="w-5 h-5" />
              {fr ? 'Ajouter' : 'Add Member'}
            </Button>
          }
        />

        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={
            editing
              ? fr
                ? 'Modifier le membre'
                : 'Edit Member'
              : fr
                ? 'Ajouter un membre'
                : 'Add Member'
          }
          footer={
            <>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4" />
                {fr ? 'Sauvegarder' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                {fr ? 'Annuler' : 'Cancel'}
              </Button>
            </>
          }
        >
          <Input
            label={fr ? 'Nom complet *' : 'Full Name *'}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={fr ? 'Rôle/Poste *' : 'Role/Position *'}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="Ex: Président"
            />
            <Input
              label={fr ? 'Titre' : 'Title'}
              value={form.title || ''}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Section *"
              value={form.section}
              onChange={(e) => setForm((f) => ({ ...f, section: e.target.value as CreateTeamMemberInput['section'] }))}
            >
              {SECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label[locale as 'en' | 'fr']}
                </option>
              ))}
            </Select>
            <Select
              label={fr ? 'Clé du pôle' : 'Pole Key'}
              value={form.poleKey || ''}
              onChange={(e) => setForm((f) => ({ ...f, poleKey: e.target.value }))}
            >
              <option value="">—</option>
              {TEAM_POLES.map((p) => (
                <option key={p.key} value={p.key}>
                  {fr ? p.nameFr : p.nameEn}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-secondary mb-1.5 block">
              {fr ? 'Photo' : 'Photo'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-default hover:border-brand-500/40 transition-colors overflow-hidden min-h-[100px] bg-card-muted"
            >
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="" className="w-full h-36 object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted">
                  {photoUploading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-default border-t-brand-500 rounded-full" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <p className="text-xs">{fr ? 'Cliquer ou glisser une photo' : 'Click or drag a photo'}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <Textarea
            label="Description"
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="LinkedIn"
              value={form.socialLinks?.linkedin || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, linkedin: e.target.value } }))
              }
            />
            <Input
              label="GitHub"
              value={form.socialLinks?.github || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, github: e.target.value } }))
              }
            />
          </div>
          <Input
            label={fr ? "Ordre d'affichage" : 'Display Order'}
            type="number"
            value={form.displayOrder || 0}
            onChange={(e) => setForm((f) => ({ ...f, displayOrder: parseInt(e.target.value) || 0 }))}
            className="w-24"
          />
        </Modal>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-card-muted border border-default animate-pulse" />
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([section, sectionMembers]) => (
            <div key={section}>
              <SectionTitle
                title={
                  SECTION_OPTIONS.find((s) => s.value === section)?.label[locale as 'en' | 'fr'] || section
                }
                count={sectionMembers.length}
              />
              {sectionMembers.length === 0 ? (
                <p className="text-muted text-sm py-2">{fr ? 'Aucun membre' : 'No members'}</p>
              ) : (
                <div className="space-y-2 mb-6">
                  {sectionMembers.map((member) => (
                    <ListRow
                      key={member.id}
                      muted={!member.isActive}
                      leading={
                        <div className="w-12 h-12 rounded-xl bg-card-muted border border-default flex items-center justify-center overflow-hidden">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-muted text-lg font-bold">{member.name.charAt(0)}</span>
                          )}
                        </div>
                      }
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(member)}
                            className={`p-2 rounded-lg transition-colors ${
                              member.isActive
                                ? 'text-brand-600 hover:bg-brand-500/10'
                                : 'text-muted hover:bg-card-muted'
                            }`}
                          >
                            {member.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(member)}
                            className="p-2 rounded-lg text-brand-600 hover:bg-brand-500/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(member.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      }
                    >
                      <p className="text-primary font-medium text-sm truncate">{member.name}</p>
                      <p className="text-secondary text-xs truncate">
                        {member.role}
                        {member.title ? ` — ${member.title}` : ''}
                      </p>
                      {member.poleKey ? (
                        <p className="text-muted text-[10px] truncate">{member.poleKey}</p>
                      ) : null}
                    </ListRow>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </PermissionGate>
  );
}
