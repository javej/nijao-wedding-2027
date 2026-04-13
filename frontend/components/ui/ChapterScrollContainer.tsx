'use client';

import { cn } from '@/lib/utils';

interface ChapterScrollContainerProps {
  children: React.ReactNode;
}

export function ChapterScrollContainer({
  children,
}: ChapterScrollContainerProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        'h-dvh overflow-y-scroll overflow-x-hidden snap-y snap-mandatory',
        'scrollbar-none outline-none',
      )}
    >
      {children}
    </main>
  );
}
