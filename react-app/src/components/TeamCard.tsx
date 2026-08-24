import type { TeamMember } from '@/types';

interface TeamCardProps {
  member: TeamMember;
}

/** First letters of first + last name (or first two words). */
function initials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_COLORS = [
  'from-cyan/25 to-cyan/5 text-cyan',
  'from-indigo-400/25 to-indigo-400/5 text-indigo-500',
  'from-emerald-400/25 to-emerald-400/5 text-emerald-600',
  'from-amber-400/25 to-amber-400/5 text-amber-600',
  'from-rose-400/25 to-rose-400/5 text-rose-500',
  'from-sky-400/25 to-sky-400/5 text-sky-600',
];

export default function TeamCard({ member }: TeamCardProps) {
  // Deterministic color by name for consistency
  const hash = (member.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];

  return (
    <div className="group bg-white border border-gray-100 rounded-xl p-6
                    hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
      {/* Initials avatar */}
      <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center
                       font-bold text-xl ${color}`}>
        {initials(member.name)}
      </div>

      {/* Info */}
      <div className="mt-4">
        <h3 className="font-semibold text-navy text-[15px] leading-snug">{member.name}</h3>
        <p className="mt-0.5 text-cyan text-xs font-medium">{member.role}</p>
        {member.expertise && (
          <p className="text-gray-400 text-xs mt-1.5">{member.expertise}</p>
        )}

        {/* Links */}
        <div className="flex items-center justify-center gap-1.5 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {member.email && (
            <a href={`mailto:${member.email}`} className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center
                       text-gray-400 hover:text-cyan transition-colors text-[11px]"
               aria-label="E-posta">
              <i className="fa fa-envelope" />
            </a>
          )}
          {member.scholar_url && (
            <a href={member.scholar_url} target="_blank" rel="noopener"
               className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center
                          text-gray-400 hover:text-cyan transition-colors text-[10px] font-bold"
               aria-label="Google Scholar">G</a>
          )}
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener"
               className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center
                          text-gray-400 hover:text-cyan transition-colors text-[11px]"
               aria-label="LinkedIn">
              <i className="fab fa-linkedin" />
            </a>
          )}
          {member.github_url && (
            <a href={member.github_url} target="_blank" rel="noopener"
               className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center
                          text-gray-400 hover:text-cyan transition-colors text-[11px]"
               aria-label="GitHub">
              <i className="fab fa-github" />
            </a>
          )}
          {member.website_url && (
            <a href={member.website_url} target="_blank" rel="noopener"
               className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center
                          text-gray-400 hover:bg-cyan hover:text-navy transition-all text-xs"
               aria-label="Web">
              <i className="fa fa-globe" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
