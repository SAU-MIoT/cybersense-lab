import { useEffect, useRef, useState } from 'react';
import { usePublicCounts } from '@/hooks/useSupabase';

interface StatItemProps {
  value: number;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || animated.current) return;

    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || animated.current) return;
      animated.current = true;
      observer.disconnect();

      const dur = 1200;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / dur, 1);
        setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="flex items-baseline gap-2.5">
      <span ref={ref} className="text-3xl font-bold text-cyan tabular-nums leading-none">
        {display}
      </span>
      <span className="text-white/60 text-sm">{label}</span>
    </div>
  );
}

export default function StatsBar() {
  const { data: counts, isLoading } = usePublicCounts();

  const stats = [
    { value: counts?.team ?? 0, label: 'Araştırmacı' },
    { value: counts?.publications ?? 0, label: 'Yayın' },
    { value: counts?.activeProjects ?? 0, label: 'Aktif Proje' },
    { value: counts?.partners ?? 0, label: 'İş Ortağı' },
  ];

  return (
    <div className="bg-navy-light border-t-2 border-cyan/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 py-6">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex justify-center ${i > 0 ? 'md:border-l md:border-white/10' : ''}`}>
              {isLoading ? (
                <div className="w-16 h-7 rounded bg-white/10 animate-pulse" />
              ) : (
                <StatItem value={s.value} label={s.label} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
