import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import ResearchAreas from '@/components/ResearchAreas';
import SectionHeader from '@/components/SectionHeader';
import TeamCard from '@/components/TeamCard';
import NewsCard from '@/components/NewsCard';
import PublicationCard from '@/components/PublicationCard';
import Reveal from '@/components/Reveal';
import PartnersMarquee from '@/components/PartnersMarquee';
import { SkeletonCard, SkeletonRow } from '@/components/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/UIStates';
import { useAnnouncements, useTeam, usePublications, useAwards } from '@/hooks/useSupabase';

export default function Home() {
  const { data: announcements, isLoading: annLoading } = useAnnouncements(3);
  const { data: team, isLoading: teamLoading } = useTeam(4);
  const { data: publications, isLoading: pubLoading } = usePublications(3);
  const { data: awardsData } = useAwards();
  const awards = awardsData?.items;
  const awardsCount = awardsData?.count ?? 0;
  const hasAwards = awardsCount > 0;

  return (
    <>
      <Hero />
      <StatsBar />

      {/* News & Sidebar */}
      <section id="news" className="py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid gap-8 ${hasAwards ? 'lg:grid-cols-3' : ''}`}>
            {/* Main Content - News Cards */}
            <div className={hasAwards ? 'lg:col-span-2' : ''}>
              <Reveal>
                <SectionHeader title="Haberler & Duyurular" />
              </Reveal>

              {annLoading && (
                <div className={`grid sm:grid-cols-2 gap-5 ${hasAwards ? '' : 'lg:grid-cols-3'}`}>
                  <SkeletonCard /><SkeletonCard />
                </div>
              )}
              {announcements && announcements.length === 0 && <EmptyState message="Henüz haber bulunmuyor." />}
              {announcements && announcements.length > 0 && (
                <div className={`grid sm:grid-cols-2 gap-5 ${hasAwards ? '' : 'lg:grid-cols-3'}`}>
                  {announcements.map((a, i) => (
                    <Reveal key={a.id} delay={i * 0.1}>
                      <Link to="/duyurular" className="block"><NewsCard announcement={a} /></Link>
                    </Reveal>
                  ))}
                </div>
              )}
              {!annLoading && announcements && announcements.length > 0 && (
                <Reveal className="text-center mt-6" delay={0.2}>
                  <Link to="/duyurular" className="btn-outline text-sm">
                    <i className="fa fa-list" /> Tüm Haberler
                  </Link>
                </Reveal>
              )}
            </div>

            {/* Sidebar - Awards */}
            {hasAwards && (
              <div>
                <Reveal delay={0.15}>
                  <SectionHeader title="Ödüller & Öne Çıkanlar" />
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {(awards ?? []).slice(0, 5).map(award => (
                      <div key={award.id} className="py-3.5">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-navy font-bold text-sm shrink-0">{award.year}</span>
                          <span className="text-navy font-medium text-[13px]">{award.title}</span>
                        </div>
                        {award.description && (
                          <p className="text-gray-400 text-xs leading-relaxed mt-1 ml-8">{award.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <ResearchAreas />

      {/* Team */}
      <section id="team" className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <Reveal>
            <SectionHeader tag="Kadromuz" title="Araştırma Ekibi" center />
          </Reveal>

          {teamLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}
          {team && team.length === 0 && <EmptyState message="Henüz ekip üyesi eklenmemiş." />}
          {team && team.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {team.map((m, i) => (
                <Reveal key={m.id} delay={i * 0.08}>
                  <TeamCard member={m} />
                </Reveal>
              ))}
            </div>
          )}
          {!teamLoading && team && team.length > 0 && (
            <Reveal className="text-center mt-8" delay={0.2}>
              <Link to="/ekip" className="btn-outline">
                <i className="fa fa-users" /> Tüm Ekibi Gör
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* Publications */}
      <section id="publications" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="w-full">
            <div>
              <Reveal>
                <SectionHeader tag="Akademik Çıktılar" title="Son Yayınlar" />
              </Reveal>

              {pubLoading && (
                <div className="space-y-3">
                  <SkeletonRow /><SkeletonRow /><SkeletonRow />
                </div>
              )}
              {publications && publications.length === 0 && <EmptyState message="Henüz yayın eklenmemiş." />}
              {publications && publications.length > 0 && (
                <div className="space-y-3">
                  {publications.map((p, i) => (
                    <Reveal key={p.id} delay={i * 0.08}>
                      <PublicationCard publication={p} />
                    </Reveal>
                  ))}
                </div>
              )}
              {!pubLoading && publications && publications.length > 0 && (
                <Reveal className="text-center mt-6" delay={0.2}>
                  <Link to="/yayinlar" className="btn-outline text-sm">
                    <i className="fa fa-list" /> Tüm Yayınları Gör
                  </Link>
                </Reveal>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Partners */}
      <PartnersMarquee />
    </>
  );
}
