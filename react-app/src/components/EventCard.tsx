import type { Event } from '@/types';
import { formatDate } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const isPast = new Date(event.event_date) < new Date();

  return (
    <div className={`flex gap-5 p-5 bg-white border rounded-xl transition-all duration-300
                     ${isPast ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}`}>
      {/* Date */}
      <div className="shrink-0 w-14 pt-0.5 text-center border-r border-gray-100 pr-4">
        <div className={`text-2xl font-bold leading-none ${isPast ? 'text-gray-300' : 'text-navy'}`}>
          {new Date(event.event_date).getDate()}
        </div>
        <div className="text-[11px] font-semibold text-gray-400 uppercase mt-1">
          {new Date(event.event_date).toLocaleString('tr-TR', { month: 'short' })}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className={`font-semibold text-[15px] leading-snug mb-1 ${isPast ? 'text-gray-400' : 'text-navy'}`}>
          {event.title}
        </h3>
        {event.description && (
          <p className="text-gray-400 text-[13px] leading-relaxed line-clamp-2 mb-2">{event.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1">
            <i className="fa fa-clock text-[10px]" /> {formatDate(event.event_date)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <i className="fa fa-location-dot text-[10px]" /> {event.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
