import { useTranslations } from 'next-intl';

export default function Projects() {
  const t = useTranslations('Header');
  const tHome = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-paper text-primary overflow-x-hidden">
      <main className="pt-24 sm:pt-32 px-4 max-w-3xl mx-auto">
        <h1 className="section-title mb-4">{t('projects')}</h1>
        <p className="text-[17px] text-secondary">{tHome('coming_soon')}</p>
      </main>
    </div>
  );
}
