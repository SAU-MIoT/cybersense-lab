import type { Partner } from '@/types';

/**
 * Renders a real partner logo image when available, otherwise
 * falls back to a clean monogram with the partner's initial.
 */
export default function PartnerLogo({ partner }: { partner: Partner }) {
  const name = (partner.name || '').trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, '');

  // Known downloaded logos
  const known: Record<string, string> = {
    tubitak: '/logos/tubitak.svg',
    tübitak: '/logos/tubitak.svg',
    sargem: '/logos/sargem.svg',
    'sakaryaüniversitesi': '/logos/sakarya-university.svg',
    'sakaryauniversity': '/logos/sakarya-university.svg',
    sau: '/logos/sakarya-university.svg',
  };

  const logo = known[slug];
  const initial = (name.charAt(0) || '?').toUpperCase();

  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className="h-10 w-auto max-w-[120px] object-contain grayscale opacity-60
                   group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
        loading="lazy"
      />
    );
  }

  return (
    <span className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-lg bg-navy/5 border border-gray-100 flex items-center justify-center
                       text-navy font-bold text-base shrink-0">
        {initial}
      </span>
      <span className="text-sm font-semibold whitespace-nowrap text-gray-500 group-hover:text-navy transition-colors">
        {name}
      </span>
    </span>
  );
}
