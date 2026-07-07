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
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'text-brand-600',
  iconBgClassName = 'bg-brand-500/10',
  loading,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 rounded-2xl bg-card border border-default shadow-card',
        'hover:border-brand-500/25 transition-colors',
        className
      )}
    >
      {Icon ? (
        <div className={cn('p-2 rounded-xl w-fit mb-4', iconBgClassName)}>
          <Icon className={cn('w-5 h-5', iconClassName)} />
        </div>
      ) : null}
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-card-muted rounded w-16" />
          <div className="h-4 bg-card-muted rounded w-24" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-primary tabular-nums">{value}</p>
          <p className="text-secondary text-sm mt-1">{label}</p>
        </>
      )}
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
  brand: 'bg-brand-500/10 text-brand-700 border-brand-500/25',
  amber: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
  success: 'bg-brand-500/10 text-brand-700 border-brand-500/25',
  danger: 'bg-red-500/10 text-red-600 border-red-500/20',
  muted: 'bg-card-muted text-muted border-subtle',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border',
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
        'block p-4 rounded-xl border border-default bg-card',
        'hover:bg-card-muted hover:border-brand-500/25 transition-all text-left',
        className
      )}
    >
      <Icon className={cn('w-5 h-5 text-brand-600 mb-2', iconClassName)} />
      <p className="text-primary font-medium text-sm">{label}</p>
    </a>
  );
}
