import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  loading?: boolean;
  className?: string;
  trend?: string;
}

/** Compact horizontal metric — dense analytics style */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'text-brand-600',
  iconBgClassName = 'bg-brand-50',
  loading,
  className,
  trend,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center justify-between gap-2 rounded-xl border border-default bg-card px-3 py-3 shadow-card sm:gap-3 sm:px-5 sm:py-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-20 rounded bg-card-muted" />
            <div className="h-7 w-12 rounded bg-card-muted" />
          </div>
        ) : (
          <>
            <p className="text-[11px] font-medium leading-snug text-muted sm:text-[13px] line-clamp-2">
              {label}
            </p>
            <p className="mt-1 text-[22px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-primary sm:mt-1.5 sm:text-[26px]">
              {value}
            </p>
            {trend ? <p className="mt-0.5 text-xs text-muted">{trend}</p> : null}
          </>
        )}
      </div>
      {Icon && !loading ? (
        <div className={cn('hidden shrink-0 rounded-lg p-2 sm:block sm:p-2.5', iconBgClassName)}>
          <Icon className={cn('h-4 w-4', iconClassName)} />
        </div>
      ) : null}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'amber' | 'success' | 'danger' | 'muted';
  className?: string;
}

const badgeVariants = {
  default: 'bg-card-muted text-secondary border-default',
  brand: 'bg-brand-50 text-brand-800 border-brand-200',
  amber: 'bg-amber-500/10 text-amber-800 border-amber-500/25 dark:text-amber-300',
  success: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:text-emerald-300',
  danger: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
  muted: 'bg-card-muted text-muted border-subtle',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-medium border',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  className?: string;
}

export function ActionCard({ href, icon: Icon, label, iconClassName, className }: ActionCardProps) {
  return (
    <a
      href={href}
      className={cn(
        'block p-5 rounded-xl border border-default bg-card shadow-card',
        'hover:border-brand-300 transition-[border-color,transform] duration-[180ms] text-left active:scale-[0.98]',
        className
      )}
    >
      <Icon className={cn('w-4 h-4 text-brand-700 mb-2', iconClassName)} />
      <p className="text-primary font-medium text-sm">{label}</p>
    </a>
  );
}
