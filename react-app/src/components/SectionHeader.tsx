interface SectionHeaderProps {
  tag?: string;
  title: string;
  center?: boolean;
}

export default function SectionHeader({ tag, title, center }: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${center ? 'text-center' : ''}`}>
      {tag && (
        <p className={`text-cyan text-[11px] font-semibold uppercase tracking-[0.2em] mb-2 ${center ? '' : ''}`}>
          {tag}
        </p>
      )}
      <h2 className="text-2xl md:text-[28px] font-bold text-navy tracking-tight">{title}</h2>
      <div className={`mt-3 w-12 h-0.5 bg-cyan ${center ? 'mx-auto' : ''}`} />
    </div>
  );
}
