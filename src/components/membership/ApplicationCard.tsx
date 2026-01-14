'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
    createdAt: string;
  };
  locale: 'en' | 'fr';
  onUpdate: () => void;
}

export function ApplicationCard({ application, locale, onUpdate }: ApplicationCardProps) {
  const { hasPermission, isAdmin } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canManage = hasPermission('membership.manage') || isAdmin;

  const handleApprove = async () => {
    if (!canManage) return;

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

      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!canManage || !rejectReason.trim()) return;

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

  const getStatusBadge = () => {
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
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
      'p-6 rounded-xl bg-white/5 border transition-all',
      application.status === 'pending'
        ? 'border-white/10 hover:border-white/20'
        : 'border-white/5 opacity-75'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {application.firstName} {application.lastName}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                <Mail className="w-4 h-4" />
                {application.email}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                <Phone className="w-4 h-4" />
                {application.whatsapp}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
          {/* Motivations */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Motivations
            </h4>
            <div className="p-4 rounded-lg bg-white/5 text-white/80 text-sm leading-relaxed">
              {application.motivations}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-white/40 mb-6">
            <span>Submitted {formatDistanceToNow(application.createdAt, locale as 'en' | 'fr')}</span>
          </div>

          {/* Actions (only for pending) */}
          {application.status === 'pending' && canManage && (
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              {error && (
                <div className="w-full p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Approve
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Reject Application</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Reason for rejection (will be sent to the applicant)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                  placeholder="Please provide a reason..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isLoading || !rejectReason.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
