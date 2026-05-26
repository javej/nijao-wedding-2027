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
        // Snap is opt-in per `ChapterSection` (see the `snap` prop on
        // that component). Today only the hero opts in — every other
        // section free-flows so long content remains reachable on
        // mobile viewports. `snap-proximity` (not `snap-mandatory`) on
        // the container means: when the user scrolls near the hero's
        // top, the browser softly settles there; everywhere else the
        // scroll is unconstrained. Mandatory snap would re-snap any
        // intermediate scroll position into the nearest target, which
        // makes continuous flow impossible to dwell in.
        'h-dvh overflow-y-scroll overflow-x-hidden snap-y snap-proximity',
        'scrollbar-none outline-none',
      )}
    >
      {children}
    </main>
  );
}
