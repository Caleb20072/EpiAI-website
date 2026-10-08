import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  muted?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className, padding = 'md', muted }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[18px] border border-default',
        muted ? 'bg-card-muted' : 'bg-card',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
