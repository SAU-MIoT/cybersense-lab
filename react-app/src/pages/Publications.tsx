import { usePublications } from '@/hooks/useSupabase';
import PublicationCard from '@/components/PublicationCard';
import Reveal from '@/components/Reveal';
import { SkeletonRow } from '@/components/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/UIStates';
import { useState } from 'react';

export default function Publications() {
  const { data: publications, isLoading, error } = usePublications();
  const [filter, setFilter] = useState<string>('all');

  const filtered = (publications || []).filter(p =>
    filter === 'all' || p.pub_type === filter
  );

  return (
    <>
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa fa-book-open text-cyan" /> Yayınlar
          </h1>
          <p className="text-white/50 mt-2">Akademik yayınlar ve araştırma çıktıları</p>
        </div>
      </div>

      <section className="py-12 bg-gray-50/50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4">
          {/* Filters */}
          <div className="flex gap-2 mb-8">
            {[
              { value: 'all', label: 'Tümü' },
              { value: 'journal', label: 'Dergi' },
              { value: 'conference', label: 'Konferans' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${filter === f.value
                    ? 'bg-cyan text-navy shadow-md'
                    : 'bg-white text-gray-500 hover:text-navy border border-gray-200 hover:border-cyan/30'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="space-y-3">
              <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          )}
          {error && <ErrorMessage message="Yayınlar yüklenirken hata oluştu." />}
          {filtered.length === 0 && !isLoading && <EmptyState message="Bu kategoride yayın bulunmuyor." />}

          <div className="space-y-3">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <PublicationCard publication={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
