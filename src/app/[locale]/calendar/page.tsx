import { getLocale } from 'next-intl/server';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { normalizeImageUrl } from '@/lib/utils/image-url';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const locale = await getLocale();
  const fr = locale === 'fr';
  const events = await prisma.event
    .findMany({
      where: { isPublished: true },
      orderBy: { date: 'desc' },
      take: 50,
    })
    .catch(() => []);

  const now = new Date();
  const upcoming = events.filter((e) => e.date >= now).sort((a, b) => a.date.getTime() - b.date.getTime());
  const past = events.filter((e) => e.date < now);

  const list = [...upcoming, ...past];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] overflow-x-hidden">
      <main className="max-w-4xl mx-auto px-6 py-24 sm:py-28">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-[40px] font-semibold mb-2">
              {fr ? 'Événements Epi’AI' : 'Epi’AI Events'}
            </h1>
            <p className="text-[17px] text-[#333]">
              {fr
                ? 'Talks, workshops et conférences ouverts au public.'
                : 'Talks, workshops and conferences open to the public.'}
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="text-[#7a7a7a] text-center py-12">
            {fr ? 'Aucun événement public pour le moment.' : 'No public events yet.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {list.map((e) => {
              const isPast = e.date < now;
              const cover = normalizeImageUrl(e.imageUrl);
              return (
                <li key={e.id}>
                  <Link
                    href={`/calendar/${e.id}`}
                    className="p-5 rounded-[18px] bg-white border border-[#e0e0e0] flex flex-col sm:flex-row sm:items-center gap-4 block"
                  >
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="w-full sm:w-28 h-36 sm:h-20 object-cover rounded-xl shrink-0"
                      />
                    ) : (
                      <div className="text-center sm:w-20 shrink-0">
                        <p className="text-[28px] font-semibold text-[#0066cc]">{e.date.getDate()}</p>
                        <p className="text-[12px] text-[#7a7a7a]">
                          {e.date.toLocaleDateString(locale, { month: 'short' })}
                        </p>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{e.title}</h2>
                        {isPast ? (
                          <span className="text-[12px] text-[#7a7a7a] border border-[#e0e0e0] px-2 py-0.5 rounded-full">
                            {fr ? 'Passé' : 'Past'}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[#333] text-[14px] mt-1">{e.location}</p>
                      <p className="text-[#7a7a7a] text-[12px] mt-1">
                        {e.date.toLocaleString(locale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <span className="text-[17px] text-[#0066cc] shrink-0">
                      {fr ? 'Voir →' : 'View →'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
