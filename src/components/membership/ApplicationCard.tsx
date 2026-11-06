'use client';

import { useState } from 'react';
import { formatDistanceToNow } from '@/lib/utils/date';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Check,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Modal } from '@/components/shared/Modal';
import { InviteTestButton } from '@/components/admin/admission/AdmissionWorkspace';
import { admissionStatusLabel, admissionStatusTone } from '@/lib/admission/status';

interface ApplicationCardProps {
  application: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    whatsapp: string;
    motivations: string;
    status: string;
    pipelineStage?: string;
    createdAt: string;
  };
  locale: 'en' | 'fr';
  onUpdate: () => void;
}

export function ApplicationCard({ application, locale, onUpdate }: ApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{
    email: string;
    password: string;
    emailSent: boolean;
    note?: string;
  } | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/membership/${application.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve application');
      }

      if (data.credentials?.password) {
        setCredentialsModal({
          email: data.credentials.email || application.email,
          password: data.credentials.password,
          emailSent: Boolean(data.emailSent),
          note:
            data.credentials.note ||
            data.emailError ||
            (data.emailSent
              ? 'Email envoyé. Tu peux aussi copier les identifiants ci-dessous.'
              : "L'email n'a pas pu être envoyé. Copie les identifiants ci-dessous."),
        });
      } else if (data.emailSent === false) {
        setCredentialsModal({
          email: application.email,
          password: '',
          emailSent: false,
          note: data.emailError || "L'email n'a pas pu être envoyé. Utilise « Renvoyer identifiants ».",
        });
      } else if (data.emailSent) {
        setCredentialsModal({
          email: application.email,
          password: '',
          emailSent: true,
          note: 'Email envoyé. Si le candidat ne le reçoit pas, utilise « Renvoyer identifiants » pour afficher un mot de passe à copier.',
        });
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/membership/${application.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectionReason: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject application');
      }

      setShowRejectModal(false);
      setRejectReason('');
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCredentials = async () => {
    setIsResending(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/resend-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: application.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Échec du renvoi');

      if (data.credentials?.password) {
        setCredentialsModal({
          email: data.credentials.email || application.email,
          password: data.credentials.password,
          emailSent: Boolean(data.emailSent),
          note:
            data.credentials.note ||
            (data.emailSent
              ? 'Email renvoyé. Tu peux aussi copier les identifiants pour WhatsApp.'
              : 'Email non parti - copie les identifiants ci-dessous.'),
        });
      } else {
        setCredentialsModal({
          email: application.email,
          password: '',
          emailSent: Boolean(data.emailSent),
          note: data.emailSent
            ? 'Email renvoyé. Si rien n’arrive, réessaie dans un instant.'
            : data.error || 'Impossible d’obtenir les identifiants.',
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusBadge = () => {
    const stage = application.pipelineStage;
    if (stage && stage !== 'received') {
      const tone = admissionStatusTone(stage);
      const cls =
        tone === 'wait'
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          : tone === 'ok'
            ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
            : tone === 'run'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              : tone === 'no'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cls}`}>
          {tone === 'no' ? <AlertCircle className="w-3.5 h-3.5" /> : tone === 'done' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          {admissionStatusLabel(stage, locale)}
        </span>
      );
    }
    switch (application.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-medium border border-brand-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'testing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Test
          </span>
        );
      case 'interviewing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium border border-violet-500/30">
            <Clock className="w-3.5 h-3.5" />
            Entretien
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className={cn(
      'p-4 sm:p-6 rounded-xl bg-card border transition-all contain-x',
      application.status === 'approved' || application.status === 'rejected'
        ? 'border-subtle opacity-75'
        : 'border-default hover:border-default'
    )}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-default bg-gradient-to-br from-blue-500/20 to-purple-500/20 sm:h-12 sm:w-12">
            <User className="h-5 w-5 text-brand-400 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-primary sm:text-lg break-words">
              {application.firstName} {application.lastName}
            </h3>
            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-secondary">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{application.email}</span>
              </span>
              <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-secondary">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="truncate">{application.whatsapp}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end sm:gap-3">
          {getStatusBadge()}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-card cursor-pointer hover:bg-card-muted transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-secondary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-default animate-fade-in">
          {/* Motivations */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-secondary mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {locale === 'fr' ? 'Motivations' : 'Motivations'}
            </h4>
            <div className="p-4 rounded-lg bg-card text-secondary text-sm leading-relaxed">
              {application.motivations}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted mb-6">
            <span>
              {locale === 'fr' ? 'Envoyée' : 'Submitted'}{' '}
              {formatDistanceToNow(application.createdAt, locale)}
            </span>
          </div>

          {(application.status === 'pending' || application.status === 'testing' || application.status === 'interviewing') && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-default">
              {error && (
                <div className="w-full p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {application.status === 'pending' ? (
                <InviteTestButton applicationId={application.id} locale={locale} onDone={onUpdate} />
              ) : null}

              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 font-medium cursor-pointer hover:bg-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {locale === 'fr' ? 'Admettre sans parcours' : 'Admit without pipeline'}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium cursor-pointer hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                {locale === 'fr' ? 'Rejeter' : 'Reject'}
              </button>
            </div>
          )}
          {application.status === 'approved' && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-default">
              {error && (
                <div className="w-full p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleResendCredentials}
                disabled={isResending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/15 text-brand-400 font-medium cursor-pointer hover:bg-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Renvoyer identifiants
              </button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!credentialsModal}
        onClose={() => setCredentialsModal(null)}
        title={
          credentialsModal?.emailSent
            ? 'Email envoyé - identifiants'
            : 'Identifiants de connexion'
        }
        borderClassName="border-amber-500/30"
      >
        {credentialsModal?.note ? (
          <p className="mb-4 text-sm text-amber-400/90">{credentialsModal.note}</p>
        ) : null}
        {credentialsModal?.password ? (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl bg-card p-4 font-mono text-sm">
              <p className="text-secondary">
                <span className="text-muted">Email :</span> {credentialsModal.email}
              </p>
              <p className="text-secondary">
                <span className="text-muted">Mot de passe :</span> {credentialsModal.password}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-10 cursor-pointer items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-500"
                onClick={() => {
                  const text = `Epi'AI - connexion\nEmail : ${credentialsModal.email}\nMot de passe : ${credentialsModal.password}\nLien : https://epiai.eu/fr/sign-in\n(Change ton mot de passe à la 1re connexion.)`;
                  void navigator.clipboard.writeText(text);
                }}
              >
                Copier pour WhatsApp
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-default bg-card px-4 text-sm font-medium text-primary hover:bg-card-muted"
                onClick={() => {
                  void navigator.clipboard.writeText(credentialsModal.password);
                }}
              >
                Copier le mot de passe
              </button>
            </div>
          </div>
        ) : credentialsModal?.emailSent ? (
          <p className="text-sm text-secondary">
            Le membre devrait recevoir un email sous peu. Vérifie aussi les spams. Utilise « Renvoyer
            identifiants » pour afficher un mot de passe à copier.
          </p>
        ) : null}
        <p className="mt-4 text-xs text-muted">
          Le membre devra changer son mot de passe à la première connexion.
        </p>
        <button
          type="button"
          onClick={() => setCredentialsModal(null)}
          className="mt-4 w-full cursor-pointer rounded-xl bg-card-muted px-4 py-2 font-medium text-primary transition-colors hover:bg-white/15"
        >
          Fermer
        </button>
      </Modal>

      <Modal
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Application"
      >
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Reason for rejection (will be sent to the applicant)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-card border border-default text-primary placeholder:text-muted focus:outline-none focus:border-brand-500/40"
              placeholder="Please provide a reason..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-card text-primary font-medium cursor-pointer hover:bg-card-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isLoading || !rejectReason.trim()}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium cursor-pointer hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
