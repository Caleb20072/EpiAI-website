'use client';

import { useEffect, useState } from 'react';
import { ClipboardCheck, Loader2, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { Button, Panel, StatCard } from '@/components/ui';
import { PdfPages } from '@/components/admission/PdfPages';
import { admissionStatusLabel, admissionStatusTone } from '@/lib/admission/status';

type Exam = {
  id: string;
  title: string;
  durationMinutes: number;
  published: boolean;
  questionCount: number;
  examPdfName: string | null;
  keyPdfName: string | null;
};

type Slot = {
  id: string;
  startsAt: string;
  booked: number;
  capacity: number;
  examTitle?: string;
  examId?: string;
  room?: string;
};

type AttemptRow = {
  id: string;
  gradeStatus: string;
  autoScore: number | null;
  adminScore: number | null;
  maxScore: number;
  integrityFlag: boolean;
  eventCount: number;
  submittedAt: string | null;
  examTitle: string;
  candidate: { id: string; name: string; email: string };
};

function datetimeLocalValue(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const fieldClass =
  'rounded-lg border border-default bg-card px-3 py-2 text-sm text-primary transition-[border-color,box-shadow] hover:border-brand-400/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25';
const fileClass =
  'cursor-pointer text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-300 hover:file:bg-brand-500/35';
const clickRowClass =
  'flex w-full cursor-pointer justify-between rounded-xl border border-default p-3 text-left transition-colors hover:border-brand-400/50 hover:bg-brand-500/10';
const iconDangerClass =
  'rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300 cursor-pointer';

export function AdmissionWorkspace({ locale }: { locale: string }) {
  const fr = locale === 'fr';
  const [tab, setTab] = useState<'suivi' | 'tests' | 'copies' | 'entretiens'>('suivi');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['suivi', 'tests', 'copies', 'entretiens'] as const).map((id) => (
          <Button key={id} size="sm" variant={tab === id ? 'primary' : 'secondary'} onClick={() => setTab(id)}>
            {id === 'suivi'
              ? fr ? 'Suivi' : 'Status'
              : id === 'tests'
                ? fr ? 'Tests & créneaux' : 'Tests & slots'
                : id === 'copies'
                  ? fr ? 'Copies' : 'Papers'
                  : fr ? 'Entretiens' : 'Interviews'}
          </Button>
        ))}
      </div>
      {tab === 'suivi' ? <SuiviPanel fr={fr} /> : null}
      {tab === 'tests' ? <TestsPanel fr={fr} /> : null}
      {tab === 'copies' ? <CopiesPanel fr={fr} /> : null}
      {tab === 'entretiens' ? <InterviewsPanel fr={fr} /> : null}
    </div>
  );
}

function toneClass(stage: string) {
  const tone = admissionStatusTone(stage);
  if (tone === 'wait') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  if (tone === 'ok') return 'bg-brand-500/15 text-brand-300 border-brand-500/30';
  if (tone === 'run') return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  if (tone === 'no') return 'bg-red-500/15 text-red-300 border-red-500/30';
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
}

function SuiviPanel({ fr }: { fr: boolean }) {
  const [data, setData] = useState<{
    stats: {
      testWaiting: number;
      testConfirmed: number;
      testDeclined: number;
      interviewWaiting: number;
      interviewConfirmed: number;
      interviewDeclined: number;
    };
    tests: Array<{ id: string; name: string; email: string; whatsapp: string; stage: string; label: string }>;
    interviews: Array<{ id: string; name: string; email: string; whatsapp: string; stage: string; label: string }>;
    examSlots: Array<{
      id: string;
      examTitle: string;
      startsAt: string;
      capacity: number;
      people: Array<{ id: string; name: string; email: string; whatsapp: string; submitted: boolean }>;
    }>;
    interviewSlots: Array<{
      id: string;
      startsAt: string;
      room: string;
      capacity: number;
      people: Array<{ id: string; name: string; email: string; whatsapp: string }>;
    }>;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const res = await fetch('/api/admin/admission/pipeline');
    const json = await res.json();
    if (!res.ok || !json.stats) {
      setError(json.error || (fr ? 'Impossible de charger le suivi.' : 'Could not load status.'));
      return;
    }
    setError(null);
    setData(json);
  }
  useEffect(() => {
    void reload();
  }, []);

  async function nudge(applicationId: string, kind: 'test' | 'interview') {
    setBusyId(applicationId);
    await fetch('/api/admin/admission/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, kind }),
    });
    setBusyId(null);
    await reload();
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!data) return <p className="text-sm text-secondary">{fr ? 'Chargement…' : 'Loading…'}</p>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label={fr ? 'Test · attente' : 'Test waiting'} value={data.stats.testWaiting} />
        <StatCard label={fr ? 'Test · confirmé' : 'Test confirmed'} value={data.stats.testConfirmed} />
        <StatCard label={fr ? 'Test · décliné' : 'Test declined'} value={data.stats.testDeclined} />
        <StatCard label={fr ? 'Entretien · attente' : 'Interview waiting'} value={data.stats.interviewWaiting} />
        <StatCard label={fr ? 'Entretien · confirmé' : 'Interview confirmed'} value={data.stats.interviewConfirmed} />
        <StatCard label={fr ? 'Entretien · décliné' : 'Interview declined'} value={data.stats.interviewDeclined} />
      </div>

      <Panel title={fr ? 'Tests : qui a confirmé' : 'Tests: who confirmed'} description={fr ? 'En attente = mail envoyé, pas encore de créneau. Relance si besoin.' : 'Waiting = emailed, no slot yet.'}>
        <div className="space-y-2">
          {data.tests.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-default px-3 py-2">
              <div>
                <p className="text-sm font-medium text-primary">{row.name}</p>
                <p className="text-xs text-secondary">{row.email} · {row.whatsapp}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${toneClass(row.stage)}`}>
                  {admissionStatusLabel(row.stage, fr ? 'fr' : 'en')}
                </span>
                {row.stage === 'test_invited' ? (
                  <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => void nudge(row.id, 'test')}>
                    {fr ? 'Relancer' : 'Nudge'}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          {data.tests.length === 0 ? <p className="text-sm text-secondary">{fr ? 'Personne n’est encore convoqué au test.' : 'No test invites yet.'}</p> : null}
        </div>
      </Panel>

      <Panel title={fr ? 'Inscrits par créneau de test' : 'Registered per test slot'}>
        <div className="space-y-4">
          {data.examSlots.map((slot) => (
            <div key={slot.id} className="rounded-xl border border-default p-3">
              <p className="text-sm font-medium text-primary">
                {slot.examTitle} - {new Date(slot.startsAt).toLocaleString(fr ? 'fr-FR' : 'en-GB')} · {slot.people.length}/{slot.capacity}
              </p>
              {slot.people.length === 0 ? (
                <p className="mt-2 text-xs text-muted">{fr ? 'Personne inscrit pour l’instant.' : 'Nobody registered yet.'}</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-secondary">
                  {slot.people.map((p) => (
                    <li key={p.id}>
                      {p.name} · {p.email} · {p.whatsapp}
                      {p.submitted ? ` · ${fr ? 'copie envoyée' : 'submitted'}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {data.examSlots.length === 0 ? <p className="text-sm text-secondary">{fr ? 'Aucun créneau de test.' : 'No test slots.'}</p> : null}
        </div>
      </Panel>

      <Panel title={fr ? 'Entretiens : qui a confirmé' : 'Interviews: who confirmed'}>
        <div className="space-y-2">
          {data.interviews.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-default px-3 py-2">
              <div>
                <p className="text-sm font-medium text-primary">{row.name}</p>
                <p className="text-xs text-secondary">{row.email} · {row.whatsapp}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${toneClass(row.stage)}`}>
                  {admissionStatusLabel(row.stage, fr ? 'fr' : 'en')}
                </span>
                {row.stage === 'interview_invited' ? (
                  <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => void nudge(row.id, 'interview')}>
                    {fr ? 'Relancer' : 'Nudge'}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          {data.interviews.length === 0 ? <p className="text-sm text-secondary">{fr ? 'Aucun entretien en cours.' : 'No interviews yet.'}</p> : null}
        </div>
      </Panel>

      <Panel title={fr ? 'Inscrits par créneau d’entretien' : 'Registered per interview slot'}>
        <div className="space-y-4">
          {data.interviewSlots.map((slot) => (
            <div key={slot.id} className="rounded-xl border border-default p-3">
              <p className="text-sm font-medium text-primary">
                {new Date(slot.startsAt).toLocaleString(fr ? 'fr-FR' : 'en-GB')}
                {slot.room ? ` · ${slot.room}` : ''} · {slot.people.length}/{slot.capacity}
              </p>
              {slot.people.length === 0 ? (
                <p className="mt-2 text-xs text-muted">{fr ? 'Personne inscrit pour l’instant.' : 'Nobody registered yet.'}</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-secondary">
                  {slot.people.map((p) => (
                    <li key={p.id}>{p.name} · {p.email} · {p.whatsapp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {data.interviewSlots.length === 0 ? <p className="text-sm text-secondary">{fr ? 'Aucun créneau d’entretien.' : 'No interview slots.'}</p> : null}
        </div>
      </Panel>
    </div>
  );
}

function TestsPanel({ fr }: { fr: boolean }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [title, setTitle] = useState('Test d’entrée Epi’AI');
  const [duration, setDuration] = useState(60);
  const [examId, setExamId] = useState('');
  const [startsAt, setStartsAt] = useState(datetimeLocalValue());
  const [capacity, setCapacity] = useState(40);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [questionsText, setQuestionsText] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  async function reload() {
    const [e, s] = await Promise.all([
      fetch('/api/admin/admission/exams').then((r) => r.json()),
      fetch('/api/admin/admission/slots?kind=exam').then((r) => r.json()),
    ]);
    setExams(e.exams || []);
    setSlots(s.slots || []);
    if (!examId && e.exams?.[0]) setExamId(e.exams[0].id);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function createExam(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData(ev.currentTarget);
    form.set('title', title);
    form.set('durationMinutes', String(duration));
    const res = await fetch('/api/admin/admission/exams', { method: 'POST', body: form });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || 'Erreur');
      return;
    }
    setMessage(
      data.parseError
        ? `${data.parsed || 0} questions. ${data.parseError}`
        : `${data.parsed || 0} question(s) extraite(s) du PDF.`,
    );
    await reload();
  }

  async function publish(id: string, published: boolean) {
    await fetch(`/api/admin/admission/exams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published }),
    });
    await reload();
  }

  async function openQuestions(id: string) {
    const res = await fetch(`/api/admin/admission/exams/${id}`);
    const data = await res.json();
    setEditId(id);
    setQuestionsText(
      JSON.stringify(
        (data.exam?.questions || []).map((q: { prompt: string; type: string; points: number; officialAnswer: string }) => ({
          prompt: q.prompt,
          type: q.type,
          points: q.points,
          officialAnswer: q.officialAnswer,
        })),
        null,
        2,
      ),
    );
  }

  async function saveQuestions() {
    if (!editId) return;
    setBusy(true);
    try {
      const questions = JSON.parse(questionsText);
      const res = await fetch(`/api/admin/admission/exams/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(fr ? 'Questions enregistrées.' : 'Questions saved.');
      setEditId(null);
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'JSON invalide');
    } finally {
      setBusy(false);
    }
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!examId) return;
    setBusy(true);
    const res = await fetch('/api/admin/admission/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'exam', examId, startsAt: new Date(startsAt).toISOString(), capacity }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) setMessage(data.error);
    else await reload();
  }

  return (
    <div className="space-y-5">
      <Panel title={fr ? 'Créer un test' : 'Create a test'} description={fr ? 'Le candidat voit le PDF original en entier (cartes, schémas, consignes). Les questions extraites servent uniquement de zones de réponse. Max 6 Mo.' : 'Candidates see the original PDF in full (maps, figures, instructions). Extracted items are answer boxes only. Max 6 MB.'}>
        <form onSubmit={createExam} className="grid gap-3 sm:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`sm:col-span-2 ${fieldClass}`} placeholder="Titre" />
          <label className="text-xs text-secondary">
            {fr ? 'Durée (min)' : 'Duration (min)'}
            <input type="number" min={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={`mt-1 w-full ${fieldClass}`} />
          </label>
          <label className="text-xs text-secondary">
            {fr ? 'PDF sujet' : 'Exam PDF'}
            <input name="examPdf" type="file" accept="application/pdf" className={`mt-1 w-full ${fileClass}`} />
          </label>
          <label className="text-xs text-secondary sm:col-span-2">
            {fr ? 'PDF corrigé type (jamais visible par le candidat)' : 'Answer-key PDF (never shown to candidates)'}
            <input name="keyPdf" type="file" accept="application/pdf" className={`mt-1 w-full ${fileClass}`} />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {fr ? 'Créer et transformer le PDF' : 'Create and convert PDF'}</Button>
          </div>
        </form>
        {message ? <p className="mt-3 text-sm text-secondary">{message}</p> : null}
      </Panel>

      <Panel title={fr ? 'Tests' : 'Exams'}>
        <div className="space-y-2">
          {exams.map((exam) => (
            <div key={exam.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-default p-3 transition-colors hover:border-brand-400/40">
              <div>
                <p className="text-sm font-medium text-primary">{exam.title}</p>
                <p className="text-xs text-secondary">
                  {exam.durationMinutes} min · {exam.questionCount} q. · {exam.published ? (fr ? 'publié' : 'published') : (fr ? 'brouillon' : 'draft')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {exam.examPdfName ? (
                  <Button size="sm" variant="secondary" onClick={() => setPreviewSrc(`/api/admin/admission/exams/${exam.id}/file`)}>
                    {fr ? 'Voir le PDF' : 'View PDF'}
                  </Button>
                ) : null}
                {exam.keyPdfName ? (
                  <Button size="sm" variant="secondary" onClick={() => setPreviewSrc(`/api/admin/admission/exams/${exam.id}/file?kind=key`)}>
                    {fr ? 'Corrigé' : 'Key'}
                  </Button>
                ) : null}
                <Button size="sm" variant="secondary" onClick={() => void openQuestions(exam.id)}>{fr ? 'Zones de réponse' : 'Answer boxes'}</Button>
                <Button size="sm" variant={exam.published ? 'secondary' : 'primary'} onClick={() => void publish(exam.id, !exam.published)}>
                  {exam.published ? (fr ? 'Dépublier' : 'Unpublish') : (fr ? 'Publier' : 'Publish')}
                </Button>
              </div>
            </div>
          ))}
          {exams.length === 0 ? <p className="text-sm text-secondary">{fr ? 'Aucun test pour l’instant.' : 'No exam yet.'}</p> : null}
        </div>
        {previewSrc ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-secondary">{fr ? 'Document original, toutes les pages.' : 'Original document, every page.'}</p>
              <Button size="sm" variant="secondary" onClick={() => setPreviewSrc(null)}>{fr ? 'Fermer' : 'Close'}</Button>
            </div>
            <PdfPages src={previewSrc} />
          </div>
        ) : null}
        {editId ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-secondary">{fr ? 'Édite le JSON des questions (prompt, type, points, officialAnswer).' : 'Edit question JSON.'}</p>
            <textarea value={questionsText} onChange={(e) => setQuestionsText(e.target.value)} rows={14} className={`w-full font-mono text-xs ${fieldClass} min-h-48`} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void saveQuestions()} disabled={busy}>{fr ? 'Enregistrer' : 'Save'}</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditId(null)}>{fr ? 'Fermer' : 'Close'}</Button>
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel title={fr ? 'Créneaux de test' : 'Test slots'}>
        <form onSubmit={addSlot} className="mb-4 flex flex-wrap items-end gap-2">
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className={`cursor-pointer ${fieldClass}`}>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={`cursor-pointer ${fieldClass}`} />
          <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className={`w-24 ${fieldClass}`} />
          <Button type="submit" size="sm" disabled={busy || !examId}>{fr ? 'Ajouter' : 'Add'}</Button>
        </form>
        <ul className="space-y-2">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-lg border border-default px-3 py-2 text-sm transition-colors hover:border-brand-400/40">
              <span>{s.examTitle} - {new Date(s.startsAt).toLocaleString(fr ? 'fr-FR' : 'en-GB')} · {s.booked}/{s.capacity}</span>
              <button type="button" className={iconDangerClass} onClick={async () => { await fetch(`/api/admin/admission/slots?id=${s.id}&kind=exam`, { method: 'DELETE' }); await reload(); }}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function CopiesPanel({ fr }: { fr: boolean }) {
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [open, setOpen] = useState<null | {
    id: string;
    examId?: string;
    hasSubjectPdf?: boolean;
    candidate: { name: string; email: string };
    autoScore: number | null;
    adminScore: number | null;
    maxScore: number;
    adminNotes: string;
    integrityFlag: boolean;
    answers: Array<{ id: string; prompt: string; officialAnswer: string; response: string; autoScore: number | null; adminScore: number | null; points: number }>;
    events: Array<{ id: string; type: string; detail: string; createdAt: string }>;
  }>(null);
  const [notes, setNotes] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  async function reload() {
    const res = await fetch('/api/admin/admission/attempts');
    const data = await res.json();
    setRows(data.attempts || []);
  }
  useEffect(() => { void reload(); }, []);

  async function openAttempt(id: string) {
    const res = await fetch(`/api/admin/admission/attempts/${id}`);
    const data = await res.json();
    setOpen(data.attempt);
    setNotes(data.attempt.adminNotes || '');
    const next: Record<string, number> = {};
    for (const a of data.attempt.answers) next[a.id] = a.adminScore ?? a.autoScore ?? 0;
    setScores(next);
  }

  async function decide(decision?: 'validated' | 'rejected') {
    if (!open) return;
    setBusy(true);
    await fetch(`/api/admin/admission/attempts/${open.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminNotes: notes,
        answers: Object.entries(scores).map(([id, adminScore]) => ({ id, adminScore })),
        decision,
      }),
    });
    setBusy(false);
    setOpen(null);
    await reload();
  }

  return (
    <Panel title={fr ? 'Copies et anti-triche' : 'Papers and integrity'}>
      <div className="space-y-2">
        {rows.map((row) => (
          <button key={row.id} type="button" onClick={() => void openAttempt(row.id)} className={`${clickRowClass} items-start`}>
            <div>
              <p className="text-sm font-medium text-primary">{row.candidate.name}</p>
              <p className="text-xs text-secondary">{row.examTitle} · {row.gradeStatus} · {row.adminScore ?? row.autoScore ?? '-'} / {row.maxScore}</p>
            </div>
            {row.integrityFlag ? <span className="inline-flex items-center gap-1 text-xs text-amber-400"><ShieldAlert className="h-3.5 w-3.5" /> {row.eventCount}</span> : null}
          </button>
        ))}
        {rows.length === 0 ? <p className="text-sm text-secondary">{fr ? 'Aucune copie pour l’instant.' : 'No papers yet.'}</p> : null}
      </div>

      {open ? (
        <div className="mt-6 space-y-4 border-t border-default pt-4">
          <h3 className="text-base font-semibold text-primary">{open.candidate.name}</h3>
          <p className="text-xs text-secondary">{open.candidate.email} · auto {open.autoScore ?? '-'} / {open.maxScore}</p>
          {open.hasSubjectPdf && open.examId ? (
            <div className="space-y-2">
              <p className="text-xs text-secondary">{fr ? 'Sujet original (toutes les pages)' : 'Original paper (every page)'}</p>
              <PdfPages src={`/api/admin/admission/exams/${open.examId}/file`} />
            </div>
          ) : null}
          {open.answers.map((a) => (
            <div key={a.id} className="rounded-xl border border-default p-3 text-sm">
              <p className="font-medium text-primary">{a.prompt}</p>
              <p className="mt-2 text-secondary"><span className="text-muted">{fr ? 'Réponse' : 'Answer'}:</span> {a.response || '-'}</p>
              <p className="mt-1 text-xs text-brand-400">{fr ? 'Corrigé' : 'Key'}: {a.officialAnswer || '-'}</p>
              <label className="mt-2 block text-xs">
                {fr ? 'Note' : 'Score'} / {a.points}
                <input type="number" step="0.5" className={`ml-2 w-20 ${fieldClass}`} value={scores[a.id] ?? 0} onChange={(e) => setScores((p) => ({ ...p, [a.id]: Number(e.target.value) }))} />
              </label>
            </div>
          ))}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={fieldClass} placeholder={fr ? 'Remarques jury' : 'Board notes'} />
          {open.events.length > 0 ? (
            <div className="rounded-xl border border-amber-500/30 p-3">
              <p className="mb-2 text-xs font-medium text-amber-400">{fr ? 'Journal anti-triche' : 'Integrity log'}</p>
              <ul className="max-h-40 space-y-1 overflow-auto text-xs text-secondary">
                {open.events.map((e) => (
                  <li key={e.id}>{new Date(e.createdAt).toLocaleString()} - {e.type} {e.detail}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => void decide()}>{fr ? 'Sauver la note' : 'Save score'}</Button>
            <Button size="sm" disabled={busy} onClick={() => void decide('validated')}>{fr ? 'Valider → entretien' : 'Pass → interview'}</Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={() => void decide('rejected')}>{fr ? 'Recaler' : 'Fail'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(null)}>{fr ? 'Fermer' : 'Close'}</Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function InterviewsPanel({ fr }: { fr: boolean }) {
  const [data, setData] = useState<{
    template: { id: string; title: string; hasPdf?: boolean; questions: Array<{ id: string; prompt: string; kind: string; maxPoints: number }> } | null;
    bookings: Array<{ id: string; status: string; totalScore: number | null; maxScore: number; notes: string; startsAt: string; room: string; candidate: { name: string; email: string }; scores: Array<{ questionId: string; points: number; remark: string }> }>;
    waiting: Array<{ id: string; name: string; email: string }>;
  } | null>(null);
  const [startsAt, setStartsAt] = useState(datetimeLocalValue());
  const [room, setRoom] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [points, setPoints] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function reload() {
    const res = await fetch('/api/admin/admission/interviews');
    setData(await res.json());
  }
  useEffect(() => { void reload(); }, []);

  const open = data?.bookings.find((b) => b.id === openId) || null;

  useEffect(() => {
    if (!open || !data?.template) return;
    const nextP: Record<string, number> = {};
    const nextR: Record<string, string> = {};
    for (const q of data.template.questions) {
      const s = open.scores.find((x) => x.questionId === q.id);
      nextP[q.id] = s?.points ?? 0;
      nextR[q.id] = s?.remark ?? '';
    }
    setPoints(nextP);
    setRemarks(nextR);
    setNotes(open.notes);
  }, [openId, data, open]);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/admin/admission/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'interview', startsAt: new Date(startsAt).toISOString(), room, capacity: 1 }),
    });
    setRoom('');
    await reload();
  }

  async function uploadPdf(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/admin/admission/interviews', { method: 'POST', body: new FormData(e.currentTarget) });
    const json = await res.json();
    setBusy(false);
    setMessage(json.parseError || `${json.parsed || 0} questions`);
    await reload();
  }

  async function decide(decision?: 'validated' | 'rejected') {
    if (!open || !data?.template) return;
    setBusy(true);
    const res = await fetch('/api/admin/admission/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'score',
        bookingId: open.id,
        notes,
        decision,
        scores: data.template.questions.map((q) => ({
          questionId: q.id,
          points: points[q.id] || 0,
          remark: remarks[q.id] || '',
        })),
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) setMessage(json.error);
    else {
      setMessage(json.admitted ? (fr ? 'Membre créé, identifiants envoyés.' : 'Member created, credentials sent.') : fr ? 'Enregistré.' : 'Saved.');
      setOpenId(null);
      await reload();
    }
  }

  const [slots, setSlots] = useState<Slot[]>([]);
  useEffect(() => {
    fetch('/api/admin/admission/slots?kind=interview').then((r) => r.json()).then((d) => setSlots(d.slots || []));
  }, [data]);

  return (
    <div className="space-y-5">
      <Panel title={fr ? 'Grille d’entretien' : 'Interview grid'} description={fr ? 'Le PDF original s’affiche en entier. La grille extraite sert seulement à noter.' : 'The original PDF is shown in full. The extracted grid is for scoring only.'}>
        <form onSubmit={uploadPdf} className="flex flex-wrap items-end gap-2">
          <input name="title" defaultValue="Entretien de motivation" className={fieldClass} />
          <input name="pdf" type="file" accept="application/pdf" className={fileClass} />
          <Button type="submit" size="sm" disabled={busy}>{fr ? 'Enregistrer le PDF' : 'Save PDF'}</Button>
        </form>
        {data?.template?.hasPdf ? (
          <div className="mt-4">
            <p className="mb-2 text-xs text-secondary">{fr ? 'Document original, toutes les pages.' : 'Original document, every page.'}</p>
            <PdfPages src={`/api/admin/admission/interviews/file?t=${data.template.id}`} />
          </div>
        ) : null}
        {data?.template ? (
          <ul className="mt-3 list-decimal space-y-1 pl-5 text-sm text-secondary">
            {data.template.questions.map((q) => (
              <li key={q.id}>{q.prompt} ({q.maxPoints} pts)</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-secondary">{fr ? 'Pas encore de grille. Tu peux aussi attendre le PDF.' : 'No grid yet.'}</p>
        )}
        {message ? <p className="mt-2 text-sm text-secondary">{message}</p> : null}
      </Panel>

      <Panel title={fr ? 'Créneaux d’entretien' : 'Interview slots'}>
        <form onSubmit={addSlot} className="mb-3 flex flex-wrap items-end gap-2">
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={`cursor-pointer ${fieldClass}`} />
          <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder={fr ? 'Salle' : 'Room'} className={fieldClass} />
          <Button type="submit" size="sm">{fr ? 'Ajouter' : 'Add'}</Button>
        </form>
        <ul className="space-y-1 text-sm text-secondary">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-lg border border-default px-3 py-2 transition-colors hover:border-brand-400/40">
              <span>{new Date(s.startsAt).toLocaleString(fr ? 'fr-FR' : 'en-GB')} {s.room ? `· ${s.room}` : ''} · {s.booked}/{s.capacity}</span>
              <button type="button" className={iconDangerClass} onClick={async () => { await fetch(`/api/admin/admission/slots?id=${s.id}&kind=interview`, { method: 'DELETE' }); const d = await fetch('/api/admin/admission/slots?kind=interview').then((r) => r.json()); setSlots(d.slots || []); }}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={fr ? 'Candidats' : 'Candidates'}>
        <div className="space-y-2">
          {(data?.bookings || []).map((b) => (
            <button key={b.id} type="button" onClick={() => setOpenId(b.id)} className={`${clickRowClass} items-center`}>
              <span className="text-sm text-primary">{b.candidate.name}</span>
              <span className="text-xs text-secondary">{b.status} · {new Date(b.startsAt).toLocaleString(fr ? 'fr-FR' : 'en-GB')} {b.room}</span>
            </button>
          ))}
        </div>
        {open && data?.template ? (
          <div className="mt-4 space-y-3 border-t border-default pt-4">
            <h3 className="font-medium text-primary">{open.candidate.name}</h3>
            {data.template.questions.map((q) => (
              <div key={q.id} className="rounded-xl border border-default p-3">
                <p className="text-sm text-primary">{q.prompt}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.kind === 'pass_fail' ? (
                    <>
                      <Button size="sm" variant={points[q.id] > 0 ? 'primary' : 'secondary'} onClick={() => setPoints((p) => ({ ...p, [q.id]: q.maxPoints }))}>OK</Button>
                      <Button size="sm" variant={points[q.id] === 0 ? 'danger' : 'secondary'} onClick={() => setPoints((p) => ({ ...p, [q.id]: 0 }))}>{fr ? 'Non' : 'No'}</Button>
                    </>
                  ) : (
                    <input type="number" min={0} max={q.maxPoints} step="0.5" value={points[q.id] ?? 0} onChange={(e) => setPoints((p) => ({ ...p, [q.id]: Number(e.target.value) }))} className={`w-24 ${fieldClass}`} />
                  )}
                </div>
                <input value={remarks[q.id] || ''} onChange={(e) => setRemarks((p) => ({ ...p, [q.id]: e.target.value }))} placeholder={fr ? 'Remarque' : 'Note'} className={`mt-2 w-full ${fieldClass}`} />
              </div>
            ))}
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={fieldClass} placeholder={fr ? 'Synthèse' : 'Summary'} />
            <p className="text-sm text-secondary">
              {fr ? 'Total' : 'Total'} : {Object.values(points).reduce((a, b) => a + b, 0)} / {data.template.questions.reduce((a, q) => a + q.maxPoints, 0)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => void decide()}>{fr ? 'Enregistrer' : 'Save'}</Button>
              <Button size="sm" disabled={busy} onClick={() => void decide('validated')}>{fr ? 'Valider → membre' : 'Admit as member'}</Button>
              <Button size="sm" variant="danger" disabled={busy} onClick={() => void decide('rejected')}>{fr ? 'Recaler' : 'Reject'}</Button>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

export function InviteTestButton({
  applicationId,
  locale,
  onDone,
}: {
  applicationId: string;
  locale: string;
  onDone: () => void;
}) {
  const fr = locale === 'fr';
  const [open, setOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examId, setExamId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch('/api/admin/admission/exams')
      .then((r) => r.json())
      .then((d) => {
        const published = (d.exams || []).filter((e: Exam) => e.published && e.questionCount > 0);
        setExams(published);
        if (published[0]) setExamId(published[0].id);
      });
  }, [open]);

  async function send() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/membership/${applicationId}/invite-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Erreur');
      return;
    }
    setOpen(false);
    onDone();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 font-medium text-amber-300 transition-colors hover:bg-amber-500/35 hover:text-amber-200"
      >
        <ClipboardCheck className="h-4 w-4" />
        {fr ? 'Faire passer un test' : 'Invite to test'}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-default bg-card p-5">
            <h3 className="text-lg font-semibold text-primary">{fr ? 'Convoquer au test' : 'Invite to the test'}</h3>
            <p className="mt-2 text-sm text-secondary">
              {fr
                ? 'Un e-mail lui demandera de choisir un créneau. Les identifiants de composition partiront 10 min avant.'
                : 'They will pick a slot by email. Exam credentials go out 10 minutes before.'}
            </p>
            {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
            <select value={examId} onChange={(e) => setExamId(e.target.value)} className={`mt-4 w-full cursor-pointer ${fieldClass}`}>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            {exams.length === 0 ? (
              <p className="mt-2 text-xs text-amber-400">{fr ? 'Publie d’abord un test avec des questions.' : 'Publish a test with questions first.'}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>{fr ? 'Annuler' : 'Cancel'}</Button>
              <Button onClick={() => void send()} disabled={busy || !examId}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {fr ? 'Envoyer' : 'Send'}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
