import { usePartners } from '@/hooks/useSupabase';
import PartnerLogo from './PartnerLogo';

export default function PartnersMarquee() {
  const { data: partners } = usePartners();
  if (!partners || partners.length === 0) return null;

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-6">
          İş Ortaklarımız
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-16 gap-y-8 px-4">
        {partners.map((partner) => (
          <a
            key={partner.id}
            href={partner.url || '#'}
            target={partner.url ? '_blank' : undefined}
            rel="noopener"
            className="group flex items-center shrink-0"
          >
            <PartnerLogo partner={partner} />
          </a>
        ))}
      </div>
    </section>
  );
}
