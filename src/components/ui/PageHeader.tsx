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
          <p className="text-[14px] font-normal text-brand-600 mb-1">{eyebrow}</p>
        ) : null}
        <h1 className="text-[28px] sm:text-[34px] font-semibold text-primary leading-[1.15]">{title}</h1>
        {description ? (
          <p className="mt-2 text-[17px] text-secondary max-w-2xl leading-[1.47]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
