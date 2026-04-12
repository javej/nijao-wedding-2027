'use client';

import { cn } from '@/lib/utils';

interface ChapterScrollContainerProps {
  children: React.ReactNode;
}

export function ChapterScrollContainer({
  children,
}: ChapterScrollContainerProps) {
  return (
    <div
      className={cn(
        'h-dvh overflow-y-scroll overflow-x-hidden snap-y snap-mandatory',
        'scrollbar-none',
      )}
    >
      {children}
    </div>
  );
}
