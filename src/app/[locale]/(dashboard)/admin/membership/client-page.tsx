'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApplicationCard } from '@/components/membership/ApplicationCard';
import { InviteUserForm } from '@/components/admin/InviteUserForm';
import { BulkInviteForm } from '@/components/admin/BulkInviteForm';
import { formatDistanceToNow } from '@/lib/utils/date';
import { Users, Clock, CheckCircle, XCircle, FileSpreadsheet, ClipboardCheck } from 'lucide-react';
import { AdmissionWorkspace } from '@/components/admin/admission/AdmissionWorkspace';
import type { PaginatedResponse } from '@/lib/membership/types';
import { PageHeader, StatCard, Button, EmptyState, Panel, Pagination } from '@/components/ui';

interface Application {
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
}

interface Stats {
  pending: number;
  testing?: number;
  interviewing?: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function MembershipAdminClient() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('MembershipAdmin');

  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, testing: 0, interviewing: 0, approved: 0, rejected: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [section, setSection] = useState<'applications' | 'pipeline'>('applications');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/membership?stats=true');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  // Fetch applications
  useEffect(() => {
    async function fetchApplications() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/membership?status=${filter}&page=${page}&limit=10`);
        const data: PaginatedResponse<Application> = await response.json();
        setApplications(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, [filter, page]);

  const handleApplicationUpdate = () => {
    // Refresh data
    fetch(`/api/membership?stats=true`)
      .then(res => res.json())
      .then(data => setStats(data));

    fetch(`/api/membership?status=${filter}&page=${page}&limit=10`)
      .then(res => res.json())
      .then((data: PaginatedResponse<Application>) => {
        setApplications(data.data ?? []);
        setTotalPages(data.totalPages ?? 1);
      });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('title')}
        description={locale === 'fr'
          ? 'Candidatures, tests d’entrée, copies, entretiens — l’accès membre n’est donné qu’à la fin.'
          : 'Applications, entrance tests, papers, interviews — member access only at the end.'}
        actions={<InviteUserForm />}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant={section === 'applications' ? 'primary' : 'secondary'} size="sm" onClick={() => setSection('applications')}>
          {locale === 'fr' ? 'Candidatures' : 'Applications'}
        </Button>
        <Button variant={section === 'pipeline' ? 'primary' : 'secondary'} size="sm" onClick={() => setSection('pipeline')}>
          <ClipboardCheck className="h-4 w-4" />
          <span className="sm:hidden">{locale === 'fr' ? 'Suivi & tests' : 'Status & tests'}</span>
          <span className="hidden sm:inline">{locale === 'fr' ? 'Suivi, tests & entretiens' : 'Status, tests & interviews'}</span>
        </Button>
      </div>

      {section === 'pipeline' ? <AdmissionWorkspace locale={locale} /> : null}

      {section === 'applications' ? (
      <>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t('total')} value={stats.total} icon={Users} />
        <StatCard
          label={t('pending')}
          value={stats.pending}
          icon={Clock}
          iconClassName="text-amber-600"
          iconBgClassName="bg-amber-500/10"
        />
        <StatCard label={locale === 'fr' ? 'Tests' : 'Tests'} value={stats.testing || 0} icon={ClipboardCheck} />
        <StatCard label={locale === 'fr' ? 'Entretiens' : 'Interviews'} value={stats.interviewing || 0} icon={Clock} />
        <StatCard label={t('approved')} value={stats.approved} icon={CheckCircle} />
        <StatCard
          label={t('rejected')}
          value={stats.rejected}
          icon={XCircle}
          iconClassName="text-red-600"
          iconBgClassName="bg-red-500/10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {['pending', 'testing', 'interviewing', 'approved', 'rejected', 'all'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setFilter(status); setPage(1); }}
          >
            {status === 'all'
              ? t('all')
              : status === 'testing'
                ? locale === 'fr' ? 'Tests' : 'Tests'
                : status === 'interviewing'
                  ? locale === 'fr' ? 'Entretiens' : 'Interviews'
                  : t(status as 'pending' | 'approved' | 'rejected')}
          </Button>
        ))}
      </div>

      <Panel
        title={
          filter === 'all'
            ? t('all')
            : filter === 'testing'
              ? locale === 'fr' ? 'Tests' : 'Tests'
              : filter === 'interviewing'
                ? locale === 'fr' ? 'Entretiens' : 'Interviews'
                : t(filter as 'pending' | 'approved' | 'rejected')
        }
      >
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-default animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-card-muted" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-1/3 bg-card-muted rounded" />
                    <div className="h-4 w-1/2 bg-card-muted rounded" />
                    <div className="h-20 w-full bg-card-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState icon={<Users className="w-12 h-12" />} title={t('noApplicationsDescription')} />
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                locale={locale as 'en' | 'fr'}
                onUpdate={handleApplicationUpdate}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Panel>

      <Panel
        title={t('bulkInvite')}
        description={t('bulkInviteDescription')}
        actions={<FileSpreadsheet className="w-4 h-4 text-brand-600" />}
      >
        <BulkInviteForm />
      </Panel>
      </>
      ) : null}
    </div>
  );
}
