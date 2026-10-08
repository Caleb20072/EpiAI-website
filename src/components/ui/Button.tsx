import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 dark:hover:bg-brand-500 border border-transparent',
  secondary: 'bg-card text-primary border border-default shadow-sm hover:bg-card-muted',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50 border border-transparent',
  danger: 'bg-transparent text-red-700 dark:text-red-400 border border-red-600/30 hover:bg-red-500/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 min-h-9 text-[14px] rounded-lg gap-1.5',
  md: 'px-4 min-h-11 text-[15px] rounded-lg gap-2',
  lg: 'px-7 min-h-12 text-[17px] rounded-full gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-[background-color,color,transform] duration-[180ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
