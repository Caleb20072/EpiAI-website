import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500 border-0',
  secondary: 'bg-card text-primary border border-default hover:bg-card-muted',
  ghost: 'bg-transparent text-brand-600 hover:underline border border-transparent',
  danger: 'bg-transparent text-red-600 border border-red-600/30 hover:bg-red-500/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3.5 min-h-9 text-[14px] rounded-full gap-1.5',
  md: 'px-[22px] min-h-11 text-[17px] rounded-full gap-2',
  lg: 'px-7 min-h-12 text-[18px] font-light rounded-full gap-2',
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
        'inline-flex items-center justify-center font-normal tracking-normal transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
