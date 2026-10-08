import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/** Same asset as favicon (`/favicon.png`, `/assets/epiai-logo.png`). */
export const BRAND_LOGO_SRC = '/assets/epiai-logo.png';
/** Same logo cropped to the wordmark on its blue field (682×276). */
export const BRAND_WORDMARK_SRC = '/assets/epiai-wordmark.png';

const SIZE_CLASS = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12 sm:w-14 sm:h-14',
} as const;

const WORDMARK_HEIGHT = {
  sm: 'h-8',
  md: 'h-9',
  lg: 'h-12',
} as const;

interface BrandLogoProps {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  priority?: boolean;
}

/** The logo's wordmark on its own blue field, sized for navigation bars. */
export function BrandWordmark({
  priority = false,
  size = 'md',
  className,
}: {
  priority?: boolean;
  size?: keyof typeof WORDMARK_HEIGHT;
  className?: string;
}) {
  return (
    <Image
      src={BRAND_WORDMARK_SRC}
      alt="Epi'AI"
      width={682}
      height={276}
      priority={priority}
      className={cn('w-auto rounded-md', WORDMARK_HEIGHT[size], className)}
    />
  );
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
