import { useAnnouncements } from '@/hooks/useSupabase';
import NewsCard from '@/components/NewsCard';
import Reveal from '@/components/Reveal';
import { SkeletonCard } from '@/components/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/UIStates';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import type { Announcement } from '@/types';

export default function Announcements() {
  const { data: announcements, isLoading, error } = useAnnouncements();
  const [selected, setSelected] = useState<Announcement | null>(null);

  return (
    <>
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa fa-newspaper text-cyan" /> Haberler
          </h1>
          <p className="text-white/50 mt-2">
            Laboratuvardan son gelişmeler, başarılar ve önemli duyurular
          </p>
        </div>
      </div>

      <section className="py-12 bg-gray-50/50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}
          {error && <ErrorMessage message="Haberler yüklenirken hata oluştu." />}
          {announcements && announcements.length === 0 && <EmptyState message="Henüz haber eklenmemiş." />}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements?.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.07}>
                <NewsCard announcement={a} onClick={() => setSelected(a)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-navy text-white p-5 rounded-t-2xl flex items-center justify-between border-b border-cyan/30">
              <h3 className="font-bold text-lg">{selected.title}</h3>
              <button onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <i className="fa fa-times" />
              </button>
            </div>
            <div className="p-6">
              {/* Images */}
              {selected.images && selected.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {selected.images.map((img, i) => (
                    <img key={i} src={img.image_url} alt={img.alt_text || selected.title}
                         className="rounded-xl w-full h-40 object-cover" loading="lazy" />
                  ))}
                </div>
              )}

              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-4">
                {selected.content}
              </div>

              <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                <i className="fa fa-clock mr-1.5" /> {formatDate(selected.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
