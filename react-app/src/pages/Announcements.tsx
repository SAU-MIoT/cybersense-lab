import { useAnnouncements } from '@/hooks/useSupabase';
import NewsCard from '@/components/NewsCard';
import Reveal from '@/components/Reveal';
import { SkeletonCard } from '@/components/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/UIStates';
import { formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { Announcement } from '@/types';

export default function Announcements() {
  const { data: announcements, isLoading, error } = useAnnouncements();
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const openAnnouncement = (announcement: Announcement) => {
    setImageIndex(0);
    setSelected(announcement);
  };

  const closeAnnouncement = () => setSelected(null);
  const imageCount = selected?.images?.length || 0;

  const showPreviousImage = () => {
    if (imageCount > 0) setImageIndex(current => (current - 1 + imageCount) % imageCount);
  };

  const showNextImage = () => {
    if (imageCount > 0) setImageIndex(current => (current + 1) % imageCount);
  };

  useEffect(() => {
    if (!selected) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAnnouncement();
      if (event.key === 'ArrowLeft') showPreviousImage();
      if (event.key === 'ArrowRight') showNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected, imageCount]);

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
                <NewsCard announcement={a} onClick={() => openAnnouncement(a)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm"
             onClick={closeAnnouncement}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <div className="max-h-[90vh] overflow-y-auto scrollbar-hidden">
              <div className="sticky top-0 z-10 bg-navy text-white p-5 flex items-center justify-between gap-4 border-b border-cyan/30">
                <h3 className="font-bold text-lg sm:text-xl leading-snug">{selected.title}</h3>
                <button onClick={closeAnnouncement}
                        className="w-9 h-9 shrink-0 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        aria-label="Duyuruyu kapat">
                  <i className="fa fa-times" />
                </button>
              </div>
              <div className="p-6">
              {/* Image carousel */}
              {selected.images && selected.images.length > 0 && (
                <div className="relative mb-6 rounded-2xl overflow-hidden bg-navy/5 border border-gray-100">
                  <img
                    key={selected.images[imageIndex].image_url}
                    src={selected.images[imageIndex].image_url}
                    alt={selected.images[imageIndex].alt_text || `${selected.title} - görsel ${imageIndex + 1}`}
                    className="w-full h-[clamp(16rem,55vh,34rem)] object-contain"
                  />

                  {imageCount > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-navy/80 text-white
                                   hover:bg-cyan hover:text-navy shadow-lg flex items-center justify-center transition-colors"
                        aria-label="Önceki görsel"
                      >
                        <i className="fa fa-chevron-left" />
                      </button>
                      <button
                        type="button"
                        onClick={showNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-navy/80 text-white
                                   hover:bg-cyan hover:text-navy shadow-lg flex items-center justify-center transition-colors"
                        aria-label="Sonraki görsel"
                      >
                        <i className="fa fa-chevron-right" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-navy/75 px-3 py-2">
                        {selected.images.map((image, index) => (
                          <button
                            key={image.id || image.image_url}
                            type="button"
                            onClick={() => setImageIndex(index)}
                            className={`h-2 rounded-full transition-all ${index === imageIndex ? 'w-6 bg-cyan' : 'w-2 bg-white/70 hover:bg-white'}`}
                            aria-label={`${index + 1}. görsele git`}
                            aria-current={index === imageIndex ? 'true' : undefined}
                          />
                        ))}
                      </div>

                      <span className="absolute top-3 right-3 rounded-full bg-navy/75 px-3 py-1.5 text-xs font-semibold text-white">
                        {imageIndex + 1} / {imageCount}
                      </span>
                    </>
                  )}
                </div>
              )}

                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-4">
                  {selected.content}
                </div>

                <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                  <i className="fa fa-clock mr-1.5" /> {formatDate(selected.publish_date || selected.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
