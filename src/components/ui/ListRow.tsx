import { cn } from '@/lib/utils/cn';

interface ListRowProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
  muted?: boolean;
}

export function ListRow({ children, actions, leading, className, muted }: ListRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-default transition-colors',
        muted ? 'bg-card-muted opacity-60' : 'bg-card hover:shadow-card',
        className
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="flex-1 min-w-0">{children}</div>
      {actions ? <div className="flex items-center gap-1 shrink-0">{actions}</div> : null}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  count?: number;
  className?: string;
}

export function SectionTitle({ title, count, className }: SectionTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-primary mb-3', className)}>
      {title}
      {typeof count === 'number' ? (
        <span className="text-muted text-sm font-normal ml-2">({count})</span>
      ) : null}
    </h2>
  );
}
