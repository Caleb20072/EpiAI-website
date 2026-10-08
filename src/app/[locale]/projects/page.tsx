import { useTranslations } from 'next-intl';

export default function Projects() {
  const t = useTranslations('Header');

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] overflow-x-hidden">
      <main className="pt-24 sm:pt-32 px-4 max-w-3xl mx-auto">
        <h1 className="text-[40px] font-semibold mb-4">{t('projects')}</h1>
        <p className="text-[17px] text-[#333]">Content coming soon...</p>
      </main>
    </div>
  );
}
