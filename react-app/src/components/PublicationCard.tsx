import type { Publication } from '@/types';

interface PublicationCardProps {
  publication: Publication;
}

export default function PublicationCard({ publication }: PublicationCardProps) {
  const typeLabel = publication.pub_type === 'journal' ? 'Dergi Makalesi' : 'Konferans Bildirisi';

  return (
    <div className="flex gap-5 p-5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-300">
      {/* Year */}
      <div className="shrink-0 w-14 pt-1">
        <div className="text-xl font-bold text-navy leading-none">{publication.pub_year}</div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 border-l border-gray-100 pl-5">
        <h3 className="font-semibold text-navy text-[15px] leading-snug">
          {publication.title}
        </h3>
        <p className="text-gray-400 text-[13px] mt-1">{publication.authors}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-400">
          <span>{typeLabel} · {publication.venue}</span>
          {publication.doi_url && (
            <a href={publication.doi_url} target="_blank" rel="noopener"
               className="text-cyan hover:text-cyan-dim font-medium transition-colors">
              DOI
            </a>
          )}
          {publication.pdf_url && (
            <a href={publication.pdf_url} target="_blank" rel="noopener"
               className="text-cyan hover:text-cyan-dim font-medium transition-colors">
              PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
