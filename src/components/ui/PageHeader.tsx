import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[13px] font-medium text-brand-700 mb-1">{eyebrow}</p>
        ) : null}
        <h1 className="text-[22px] sm:text-[26px] font-semibold text-primary leading-[1.2] tracking-[-0.015em]">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-[15px] text-secondary max-w-2xl leading-[1.5]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
