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
        // No scroll-snap. A snap container re-runs snap selection on ANY
        // layout change — and on mobile that fires constantly: the URL
        // bar sliding in/out resizes `h-dvh`/`min-h-dvh`, and lazy images
        // reflow as they load. Each re-snap yanked the viewport mid-read
        // (auto-scroll-to-top bug). The hero's stable landing is already
        // guaranteed by `main.scrollTop = 0` in ExperienceShell, so snap
        // bought nothing while breaking continuous scroll. See ADR-0003.
        'h-dvh overflow-y-scroll overflow-x-hidden',
        'scrollbar-none outline-none',
      )}
    >
      {children}
    </main>
  );
}
