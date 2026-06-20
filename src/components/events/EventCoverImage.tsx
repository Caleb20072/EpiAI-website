'use client';

import { useState } from 'react';
import { normalizeImageUrl } from '@/lib/utils/image-url';
import { cn } from '@/lib/utils/cn';
import { Calendar } from 'lucide-react';

interface EventCoverImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  showGradient?: boolean;
  fallback?: React.ReactNode;
}

export function EventCoverImage({
  src,
  alt,
  className,
  imgClassName,
  showGradient = true,
  fallback,
}: EventCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const normalized = normalizeImageUrl(src);

  if (!normalized || failed) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-zinc-900',
          className
        )}
      >
        {fallback ?? <Calendar className="w-12 h-12 text-white/20" aria-hidden />}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={normalized}
        alt={alt}
        className={cn('w-full h-full object-cover', imgClassName)}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
