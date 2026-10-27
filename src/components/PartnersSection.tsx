'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { partnerProfileFor, type PartnerProfile } from '@/lib/partners/catalog';

export interface PartnerCard {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  type: string;
}

interface PartnersSectionProps {
  partners: PartnerCard[];
  locale: string;
}

export default function PartnersSection({ partners, locale }: PartnersSectionProps) {
  const fr = locale === 'fr';
  const [openName, setOpenName] = useState<string | null>(null);
  const openProfile = openName ? partnerProfileFor(openName) : null;

  useEffect(() => {
    if (!openProfile) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenName(null);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [openProfile]);

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => {
          const profile = partnerProfileFor(partner.name);
          const tagline = profile ? (fr ? profile.taglineFr : profile.taglineEn) : partner.description;
          const website = profile?.websiteUrl || partner.websiteUrl;
          const card = (
            <>
              {(profile || partner.logoUrl) && (
                <div className="h-12 sm:h-14 relative mb-4">
                  {profile ? (
                    <>
                      <Image
                        src={profile.logoLight}
                        alt={partner.name}
                        fill
                        className="partner-logo-on-light object-contain object-left"
                      />
                      <Image
                        src={profile.logoDark}
                        alt=""
                        fill
                        className="partner-logo-on-dark object-contain object-left"
                      />
                    </>
                  ) : (
                    <Image src={partner.logoUrl!} alt={partner.name} fill className="object-contain object-left" />
                  )}
                </div>
              )}
              {profile ? (
                <h2 className="sr-only">{partner.name}</h2>
              ) : (
                <h2 className="text-xl font-semibold text-primary mb-2">{partner.name}</h2>
              )}
              {partner.type && partner.type !== 'partner' ? (
                <span className="text-xs text-brand-700">{partner.type}</span>
              ) : null}
              {tagline ? <p className="text-sm text-muted mt-3">{tagline}</p> : null}
              {profile ? (
                <span className="inline-block mt-4 text-sm font-medium text-brand-700">
                  {fr ? 'Lire la présentation →' : 'Read the presentation →'}
                </span>
              ) : website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-brand-700 hover:text-brand-600"
                >
                  {fr ? 'Visiter le site →' : 'Visit website →'}
                </a>
              ) : null}
            </>
          );

          if (profile) {
            return (
              <button
                key={partner.id}
                type="button"
                onClick={() => setOpenName(partner.name)}
                className="p-6 rounded-2xl bg-card border border-default hover:border-brand-500/30 transition-all text-left"
              >
                {card}
              </button>
            );
          }

          return (
            <article key={partner.id} className="p-6 rounded-2xl bg-card border border-default">
              {card}
            </article>
          );
        })}
      </div>
      {openProfile ? <PartnerDialog profile={openProfile} locale={locale} onClose={() => setOpenName(null)} /> : null}
    </>
  );
}

function visitHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function PartnerDialog({
  profile,
  locale,
  onClose,
}: {
  profile: PartnerProfile;
  locale: string;
  onClose: () => void;
}) {
  const fr = locale === 'fr';
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#14171f]/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-dialog-title"
        className="w-full max-w-lg max-h-[85vh] overflow-auto rounded-xl bg-card border border-default shadow-card p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="h-10 relative w-48">
            <Image
              src={profile.logoLight}
              alt={profile.name}
              fill
              className="partner-logo-on-light object-contain object-left"
            />
            <Image
              src={profile.logoDark}
              alt=""
              fill
              className="partner-logo-on-dark object-contain object-left"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-muted hover:text-primary hover:bg-card-muted"
          >
            {fr ? 'Fermer' : 'Close'}
          </button>
        </div>
        <h3 id="partner-dialog-title" className="text-[18px] font-semibold text-primary mt-4">
          {fr ? profile.linesTitleFr : profile.linesTitleEn}
        </h3>
        <p className="text-[14px] leading-relaxed text-secondary mt-3">
          {fr ? profile.introFr : profile.introEn}
        </p>
        <ol className="mt-5 space-y-3">
          {profile.lines.map((line, index) => (
            <li key={line.titleFr} className="text-[14px] leading-relaxed text-secondary">
              <span className="font-semibold text-primary">
                {index + 1}. {fr ? line.titleFr : line.titleEn}
              </span>{' '}
              {fr ? line.textFr : line.textEn}
            </li>
          ))}
        </ol>
        <p className="text-[13px] leading-relaxed text-muted mt-5">{fr ? profile.closingFr : profile.closingEn}</p>
        <a
          href={profile.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm font-medium text-brand-700 hover:text-brand-600"
        >
          {fr ? `Visiter ${visitHost(profile.websiteUrl)} →` : `Visit ${visitHost(profile.websiteUrl)} →`}
        </a>
      </div>
    </div>
  );
}
