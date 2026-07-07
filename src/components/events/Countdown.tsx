'use client';

import { useState, useEffect } from 'react';
import { getCountdown } from '@/lib/events/utils';
import { cn } from '@/lib/utils/cn';

interface CountdownProps {
  targetDate: string;
  className?: string;
}

export function Countdown({ targetDate, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <div className={cn('text-center', className)}>
        <p className="text-secondary">Event has started!</p>
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <div className={cn('flex justify-center gap-4', className)}>
      {timeUnits.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-card-muted border border-default flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-bold text-primary">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-muted mt-2 uppercase tracking-wide">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
