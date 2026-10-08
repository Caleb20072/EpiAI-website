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
        'flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-card border border-default shadow-card',
        className
      )}
    >
      <div className="min-w-0">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-card-muted rounded w-20" />
            <div className="h-7 bg-card-muted rounded w-12" />
          </div>
        ) : (
          <>
            <p className="text-[13px] font-medium text-muted truncate">
              {label}
            </p>
            <p className="text-[26px] font-semibold text-primary tabular-nums leading-none mt-1.5 tracking-[-0.02em]">
              {value}
            </p>
            {trend ? <p className="text-xs text-muted mt-0.5">{trend}</p> : null}
          </>
        )}
      </div>
      {Icon && !loading ? (
        <div className={cn('p-2.5 rounded-lg shrink-0', iconBgClassName)}>
          <Icon className={cn('w-4 h-4', iconClassName)} />
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
