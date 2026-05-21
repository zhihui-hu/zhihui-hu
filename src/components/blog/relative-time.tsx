'use client';

import { formatAbsoluteDateTime, formatReadableDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

type RelativeTimeProps = {
  dateTime: string;
  fallback: string;
  className?: string;
};

export function RelativeTime({
  className,
  dateTime,
  fallback,
}: RelativeTimeProps) {
  const [label, setLabel] = useState(fallback);
  const title = useMemo(() => formatAbsoluteDateTime(dateTime), [dateTime]);

  useEffect(() => {
    setLabel(formatReadableDate(dateTime));
  }, [dateTime]);

  return (
    <time
      className={cn('tabular-nums', className)}
      dateTime={dateTime}
      suppressHydrationWarning
      title={title}
    >
      {label}
    </time>
  );
}
