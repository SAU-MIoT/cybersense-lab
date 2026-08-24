import { useTeam } from '@/hooks/useSupabase';
import SectionHeader from '@/components/SectionHeader';
import TeamCard from '@/components/TeamCard';
import Reveal from '@/components/Reveal';
import { SkeletonCard } from '@/components/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/UIStates';
import { PRIORITY_LABELS } from '@/lib/utils';

export default function Team() {
  const { data: members, isLoading, error } = useTeam();

  // Group by priority
  const groups: Record<number, typeof members> = {};
  (members || []).forEach(m => {
    const p = m.priority || 1;
    if (!groups[p]) groups[p] = [];
    groups[p].push(m);
  });

  const sortedPriorities = Object.keys(groups).map(Number).sort((a, b) => b - a);

  return (
    <>
      {/* Page Header */}
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa fa-users text-cyan" /> Araştırma Ekibi
          </h1>
          <p className="text-white/50 mt-2">
            SARGEM CyberSense Laboratuvarı bünyesindeki akademisyen ve araştırmacılar
          </p>
        </div>
      </div>

      <section className="py-12 bg-gray-50/50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}
          {error && <ErrorMessage message="Ekip bilgisi yüklenirken hata oluştu." />}
          {members && members.length === 0 && <EmptyState message="Henüz ekip üyesi eklenmemiş." />}

          {sortedPriorities.map(prio => {
            const meta = PRIORITY_LABELS[prio] || { label: 'Ekip Üyeleri', icon: 'fa-user' };
            return (
              <div key={prio} className="mb-10">
                <Reveal>
                  <div className="flex items-center gap-3 mb-6 border-l-4 border-cyan pl-4">
                    <i className={`fa ${meta.icon} text-cyan text-lg`} />
                    <h3 className="text-lg font-bold text-navy">{meta.label}</h3>
                  </div>
                </Reveal>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {(groups[prio] || []).map((m, i) => (
                    <Reveal key={m.id} delay={i * 0.06}>
                      <TeamCard member={m} />
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
