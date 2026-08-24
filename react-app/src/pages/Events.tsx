import { useEvents } from '@/hooks/useSupabase';
import SectionHeader from '@/components/SectionHeader';
import EventCard from '@/components/EventCard';
import Reveal from '@/components/Reveal';
import { SkeletonRow } from '@/components/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/UIStates';

export default function Events() {
  const { data: events, isLoading, error } = useEvents();

  const upcoming = (events || []).filter(e => new Date(e.event_date) >= new Date());
  const past = (events || []).filter(e => new Date(e.event_date) < new Date());

  return (
    <>
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa fa-calendar-days text-cyan" /> Etkinlikler
          </h1>
          <p className="text-white/50 mt-2">Laboratuvar etkinlikleri ve organizasyonlar</p>
        </div>
      </div>

      <section className="py-12 bg-gray-50/50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4">
          {isLoading && (
            <div className="space-y-3">
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          )}
          {error && <ErrorMessage message="Etkinlikler yüklenirken hata oluştu." />}
          {events && events.length === 0 && <EmptyState message="Henüz etkinlik eklenmemiş." />}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-10">
              <Reveal>
                <SectionHeader tag="Yaklaşan" title="Yaklaşan Etkinlikler" />
              </Reveal>
              <div className="space-y-3">
                {upcoming.map((e, i) => (
                  <Reveal key={e.id} delay={i * 0.06}>
                    <EventCard event={e} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <Reveal>
                <SectionHeader tag="Geçmiş" title="Geçmiş Etkinlikler" />
              </Reveal>
              <div className="space-y-3">
                {past.map((e, i) => (
                  <Reveal key={e.id} delay={i * 0.05}>
                    <EventCard event={e} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
