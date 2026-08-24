import { motion } from 'framer-motion';
import { usePartners } from '@/hooks/useSupabase';
import PartnerLogo from './PartnerLogo';

export default function PartnersMarquee() {
  const { data: partners } = usePartners();
  if (!partners || partners.length === 0) return null;

  // Duplicate list for seamless infinite scroll
  const items = [...partners, ...partners];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-6">
          İş Ortaklarımız
        </p>
      </div>

      <div className="relative overflow-hidden">
        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center gap-16 px-7 w-max"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
        >
          {items.map((partner, i) => (
            <a
              key={`${partner.id}-${i}`}
              href={partner.url || '#'}
              target={partner.url ? '_blank' : undefined}
              rel="noopener"
              className="group flex items-center shrink-0"
            >
              <PartnerLogo partner={partner} />
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
