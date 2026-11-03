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
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[13px] font-medium text-brand-700 mb-1">{eyebrow}</p>
        ) : null}
        <h1 className="text-[20px] sm:text-[26px] font-semibold text-primary leading-[1.2] tracking-[-0.015em] break-words">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-[14px] sm:text-[15px] text-secondary max-w-2xl leading-[1.5] break-words">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex max-w-full flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
