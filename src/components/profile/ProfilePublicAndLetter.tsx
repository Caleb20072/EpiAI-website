'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { FileText, Linkedin, Loader2 } from 'lucide-react';
import { Button, Input, Panel, Select, Textarea } from '@/components/ui';

type ProfilePayload = {
  firstName: string;
  lastName: string;
  linkedin: string | null;
  photoUrl: string | null;
  teamRole: string | null;
  onPublicTeam: boolean;
};

export function ProfilePublicAndLetter({ locale }: { locale: string }) {
  const fr = locale === 'fr';
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [linkedin, setLinkedin] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'m' | 'f' | ''>('');
  const [memberRole, setMemberRole] = useState('');
  const [focus, setFocus] = useState(fr ? "l'intelligence artificielle" : 'artificial intelligence');
  const [contributions, setContributions] = useState('');
  const [letterBusy, setLetterBusy] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ProfilePayload | null) => {
        if (!data) return;
        setProfile(data);
        setLinkedin(data.linkedin || '');
        setFirstName(data.firstName || user?.firstName || '');
        setLastName(data.lastName || user?.lastName || '');
        setMemberRole(data.teamRole || '');
      })
      .catch(() => {});
  }, [user?.firstName, user?.lastName]);

  useEffect(() => {
    if (!user?.imageUrl) return;
    void fetch('/api/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: user.imageUrl }),
    });
  }, [user?.imageUrl]);

  async function saveLinkedin() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'save');
      setProfile(data);
      setLinkedin(data.linkedin || '');
      setMessage(
        data.onPublicTeam
          ? fr
            ? 'LinkedIn enregistré. Il apparaît sur la page Équipe.'
            : 'LinkedIn saved. It now appears on the Team page.'
          : fr
            ? 'LinkedIn enregistré sur ton profil.'
            : 'LinkedIn saved on your profile.',
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function onPhoto(file: File) {
    if (!user) return;
    setPhotoBusy(true);
    setMessage(null);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: user.imageUrl }),
      });
      if (!res.ok) throw new Error(fr ? 'Photo enregistrée sur Clerk, pas sur la page équipe.' : 'Photo saved on Clerk, not on the team page.');
      const data = await res.json();
      setProfile(data);
      setMessage(
        data.onPublicTeam
          ? fr
            ? 'Photo mise à jour sur ton profil et sur la page Équipe.'
            : 'Photo updated on your profile and the Team page.'
          : fr
            ? 'Photo de profil mise à jour.'
            : 'Profile photo updated.',
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function generateLetter() {
    setLetterBusy(true);
    setLetterError(null);
    try {
      const res = await fetch('/api/letters/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          memberRole,
          focus,
          contributions,
          locale: fr ? 'fr' : 'en',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (fr ? 'Impossible de générer la lettre.' : 'Could not generate the letter.'));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${firstName}_${lastName}_Lettre_de_recommandation.pdf`.replace(/\s+/g, '_');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setLetterError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLetterBusy(false);
    }
  }

  return (
    <>
      <Panel title={fr ? 'Présence publique' : 'Public presence'}>
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            {fr
              ? 'Ta photo et ton LinkedIn sont les mêmes que sur la page Équipe du site. Change-les ici, la vitrine se met à jour.'
              : 'Your photo and LinkedIn match the public Team page. Change them here and the site updates too.'}
          </p>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onPhoto(file);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={photoBusy}
              onClick={() => fileRef.current?.click()}
            >
              {photoBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {fr ? 'Changer ma photo' : 'Change my photo'}
            </Button>
          </div>
          <Input
            label="LinkedIn"
            type="url"
            placeholder="https://www.linkedin.com/in/…"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
          <Button type="button" size="sm" disabled={saving} onClick={() => void saveLinkedin()}>
            <Linkedin className="w-4 h-4" />
            {saving ? (fr ? 'Enregistrement…' : 'Saving…') : fr ? 'Enregistrer LinkedIn' : 'Save LinkedIn'}
          </Button>
          {message ? <p className="text-sm text-brand-600">{message}</p> : null}
        </div>
      </Panel>

      <Panel title={fr ? 'Lettre de recommandation' : 'Letter of recommendation'}>
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            {fr
              ? 'Tous les membres peuvent générer une lettre officielle Epi’AI / EPITECH au format PDF. Remplis tes informations, puis télécharge le document.'
              : 'Every member can generate an official Epi’AI / EPITECH PDF letter. Fill in your details, then download it.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label={fr ? 'Prénom' : 'First name'} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label={fr ? 'Nom' : 'Last name'} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Select
              label={fr ? 'Genre (pour l’accord)' : 'Gender (for grammar)'}
              value={gender}
              onChange={(e) => setGender(e.target.value as 'm' | 'f' | '')}
            >
              <option value="">{fr ? 'Choisir…' : 'Choose…'}</option>
              <option value="m">{fr ? 'Masculin' : 'Masculine'}</option>
              <option value="f">{fr ? 'Féminin' : 'Feminine'}</option>
            </Select>
            <Input
              label={fr ? 'Rôle dans l’association' : 'Role in the association'}
              placeholder={fr ? 'Membre, commission Projets…' : 'Member, Projects commission…'}
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
            />
          </div>
          <Input
            label={fr ? 'Domaine mis en avant' : 'Highlighted field'}
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
          <Textarea
            label={fr ? 'Complément (optionnel)' : 'Extra paragraph (optional)'}
            rows={4}
            value={contributions}
            onChange={(e) => setContributions(e.target.value)}
            placeholder={
              fr
                ? 'Un projet, une responsabilité ou une qualité que tu veux voir dans la lettre.'
                : 'A project, responsibility or quality you want in the letter.'
            }
          />
          {letterError ? <p className="text-sm text-red-500">{letterError}</p> : null}
          <Button type="button" disabled={letterBusy || !gender} onClick={() => void generateLetter()}>
            {letterBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {letterBusy
              ? fr
                ? 'Génération…'
                : 'Generating…'
              : fr
                ? 'Télécharger la lettre PDF'
                : 'Download the PDF letter'}
          </Button>
        </div>
      </Panel>
    </>
  );
}
