import { useProjects } from '@/hooks/useSupabase';
import ProjectCard from '@/components/ProjectCard';
import Reveal from '@/components/Reveal';
import { SkeletonCard } from '@/components/Skeleton';
import { ErrorMessage, EmptyState } from '@/components/UIStates';
import { useState } from 'react';
import type { Project } from '@/types';

export default function Projects() {
  const { data: projects, isLoading, error } = useProjects();
  const [selected, setSelected] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = (projects || []).filter(p => filter === 'all' || p.status === filter);

  return (
    <>
      <div className="bg-navy py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa fa-folder-open text-cyan" /> Projeler
          </h1>
          <p className="text-white/50 mt-2">Aktif ve tamamlanmış araştırma projeleri</p>
        </div>
      </div>

      <section className="py-12 bg-gray-50/50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {[
              { value: 'all', label: 'Tümü' },
              { value: 'active', label: 'Aktif' },
              { value: 'done', label: 'Tamamlanan' },
              { value: 'plan', label: 'Planlanan' },
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}
          {error && <ErrorMessage message="Projeler yüklenirken hata oluştu." />}
          {filtered.length === 0 && !isLoading && <EmptyState message="Bu kategoride proje bulunmuyor." />}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.07}>
                <ProjectCard project={p} onClick={() => setSelected(p)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
             onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-navy text-white p-5 rounded-t-2xl flex items-center justify-between border-b border-cyan/30">
              <h3 className="font-bold text-lg">{selected.title}</h3>
              <button onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <i className="fa fa-times" />
              </button>
            </div>
            <div className="p-6">
              {selected.image_url && (
                <img src={selected.image_url} alt={selected.title}
                     className="block rounded-xl w-full h-auto max-h-[70vh] object-contain bg-gray-50 mb-5" />
              )}
              {/* Images */}
              {selected.images && selected.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {selected.images.map((img, i) => (
                    <img key={i} src={img.image_url} alt={img.alt_text || selected.title}
                         className="rounded-xl w-full h-40 object-cover" loading="lazy" />
                  ))}
                </div>
              )}
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{selected.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                {selected.status && (
                  <div><strong className="text-navy">Durum:</strong>{' '}
                    <span className={
                      selected.status === 'active' ? 'text-green-600' :
                      selected.status === 'done' ? 'text-gray-500' : 'text-amber-600'
                    }>
                      {selected.status === 'active' ? '● Aktif' :
                       selected.status === 'done' ? '✓ Tamamlandı' : '○ Planlama'}
                    </span>
                  </div>
                )}
                {selected.funder && <div><strong className="text-navy">Fon:</strong> {selected.funder}</div>}
                {selected.date_range && <div><strong className="text-navy">Tarih:</strong> {selected.date_range}</div>}
                {selected.progress_pct != null && (
                  <div><strong className="text-navy">İlerleme:</strong> {selected.progress_pct}%</div>
                )}
              </div>

              {/* Progress */}
              {selected.status === 'active' && selected.progress_pct != null && (
                <div className="w-full h-2 bg-gray-100 rounded-full mb-5">
                  <div className="h-full bg-gradient-to-r from-cyan to-cyan-dim rounded-full"
                       style={{ width: `${Math.min(100, Math.max(0, selected.progress_pct))}%` }} />
                </div>
              )}

              <div className="flex gap-3">
                {selected.github_url && (
                  <a href={selected.github_url} target="_blank" rel="noopener" className="btn-outline text-sm">
                    <i className="fab fa-github" /> GitHub
                  </a>
                )}
                {selected.demo_url && (
                  <a href={selected.demo_url} target="_blank" rel="noopener" className="btn-cyber text-sm">
                    <i className="fa fa-globe" /> Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
