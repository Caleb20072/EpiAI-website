'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { formatShortDate } from '@/lib/events/utils';
import { Calendar, MapPin, Users, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader, Button, Card, EmptyState } from '@/components/ui';

interface RegistrationItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  status: string;
}

export default function MyRegistrationsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const t = useTranslations('Events');
  const tNav = useTranslations('Navigation');

  const { isSignedIn } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function fetchRegistrations() {
      try {
        const response = await fetch('/api/events/registrations/me');
        if (response.ok) {
          setRegistrations(await response.json());
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegistrations();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title={t('signInToViewRegistrations')}
        action={
          <Link href="/sign-in">
            <Button>{tNav('signIn')}</Button>
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-default animate-pulse">
            <div className="h-6 w-48 bg-card-muted rounded mb-2" />
            <div className="h-4 w-32 bg-card-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('myRegistrations')} description={t('manageRegistrations')} />

      {registrations.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title={t('noRegistrationsHint')}
          action={
            <Link href="/events">
              <Button>{t('browseEvents')}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Link
              key={reg.id}
              href={`/events/${reg.eventId}`}
              className="block p-6 rounded-2xl bg-card border border-default hover:border-brand-500/25 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">{reg.eventTitle}</h3>
                  <div className="flex flex-wrap gap-4 text-secondary text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatShortDate(reg.eventDate, locale as 'en' | 'fr')}
                    </span>
                    {reg.eventLocation && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {reg.eventLocation}
                      </span>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-sm border border-brand-500/30">
                  <Check className="w-3 h-3" />
                  {t('registered')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
