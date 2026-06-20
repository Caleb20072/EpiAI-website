import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/** Same asset as favicon (`/favicon.png`, `/assets/epiai-logo.png`). */
export const BRAND_LOGO_SRC = '/assets/epiai-logo.png';

const SIZE_CLASS = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12 sm:w-14 sm:h-14',
} as const;

interface BrandLogoProps {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ size = 'md', className, priority }: BrandLogoProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-lg',
        SIZE_CLASS[size],
        className
      )}
    >
      <Image
        src={BRAND_LOGO_SRC}
        alt="EPI'AI"
        fill
        className="object-contain"
        sizes={size === 'lg' ? '56px' : size === 'md' ? '40px' : '32px'}
        priority={priority}
      />
    </div>
  );
}
