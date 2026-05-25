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
        // `snap-proximity` (not `snap-mandatory`) — functional sections
        // still snap when the user is close, but story chapters (which
        // intentionally do NOT declare `snap-start`) remain free-scroll
        // zones. With mandatory snap, any scroll position inside a
        // non-snap section is immediately re-snapped to the nearest
        // target, which makes continuous flow impossible to dwell in.
        'h-dvh overflow-y-scroll overflow-x-hidden snap-y snap-proximity',
        'scrollbar-none outline-none',
      )}
    >
      {children}
    </main>
  );
}
