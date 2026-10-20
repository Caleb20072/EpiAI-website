import { getLocale } from 'next-intl/server';
import Footer from '@/components/Footer';
import PartnersSection from '@/components/PartnersSection';
import { getActivePartners } from '@/lib/partners/repository';

export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
  const locale = await getLocale();
  const partners = await getActivePartners().catch(() => []);

  return (
    <div className="paper-page min-h-screen overflow-x-hidden">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 text-center">
          {locale === 'fr' ? 'Partenaires & Alumni' : 'Partners & Alumni'}
        </h1>
        <p className="text-muted text-center mb-16 max-w-2xl mx-auto">
          {locale === 'fr'
            ? 'Ils soutiennent EPI\'AI et accompagnent nos membres.'
            : 'They support EPI\'AI and mentor our members.'}
        </p>
        {partners.length === 0 ? (
          <p className="text-center text-muted">{locale === 'fr' ? 'Bientôt disponible.' : 'Coming soon.'}</p>
        ) : (
          <PartnersSection
            partners={partners.map((partner) => ({
              id: partner.id,
              name: partner.name,
              description: partner.description,
              logoUrl: partner.logoUrl,
              websiteUrl: partner.websiteUrl,
              type: partner.type,
            }))}
            locale={locale}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
