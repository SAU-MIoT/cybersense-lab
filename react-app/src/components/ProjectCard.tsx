import type { Project } from '@/types';
import { STATUS_MAP } from '@/lib/utils';
import LabIcon from './LabIcon';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = STATUS_MAP[project.status] || { cls: 'bg-gray-100 text-gray-600', label: project.status };
  const progress = project.progress_pct ?? 0;

  return (
    <article
      onClick={onClick}
      className={`group bg-white border border-gray-100 rounded-xl overflow-hidden
                  hover:border-gray-200 hover:shadow-lg transition-all duration-300
                  ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
        {(project.images?.[0]?.image_url || project.image_url) ? (
          <img
            src={project.images?.[0]?.image_url || project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <LabIcon name="fa-diagram-project" className="w-8 h-8 text-gray-300" />
        )}
        {/* Status badge */}
        <span className={`absolute top-3 right-3 text-[11px] font-medium px-2.5 py-0.5 rounded-md ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-navy text-[15px] leading-snug mb-2">
          {project.title}
        </h3>
        <p className="text-gray-400 text-[13px] leading-relaxed line-clamp-2 mb-3">
          {project.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mb-3">
          {project.funder && <span><i className="fa fa-building-columns mr-1" /> {project.funder}</span>}
          {project.date_range && <span><i className="fa fa-calendar mr-1" /> {project.date_range}</span>}
        </div>

        {/* Progress bar */}
        {project.status === 'active' && (
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}

        {/* Links */}
        {(project.github_url || project.demo_url) && (
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener"
                 onClick={e => e.stopPropagation()}
                 className="text-xs text-gray-400 hover:text-cyan transition-colors inline-flex items-center gap-1">
                <i className="fab fa-github" /> GitHub
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener"
                 onClick={e => e.stopPropagation()}
                 className="text-xs text-gray-400 hover:text-cyan transition-colors inline-flex items-center gap-1">
                <i className="fa fa-globe" /> Demo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
