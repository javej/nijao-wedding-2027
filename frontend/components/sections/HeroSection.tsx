import { HeroJumpNav } from '@/components/ui/HeroJumpNav';

/**
 * HeroSection — Server Component
 *
 * First content chapter after the arrival overlay.
 * Renders the couple's names, tagline, and wedding date
 * using display typography with generous negative space.
 */
export function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-(--chapter-padding-x) py-(--chapter-padding-y)">
      {/* Visual headline — tagline is the emotional centrepiece */}
      <p className="font-display font-light text-display-xl text-text-on-light leading-display">
        Ten years.
        <br />
        <em className="text-raspberry">One more day.</em>
      </p>

      {/* Semantic h1 styled as secondary tagline — screen readers still find the title.
          Stacks as three centered lines on mobile (so the date and place never split
          mid-line) and collapses to one dot-separated line at md+ where it fits. */}
      <h1 className="mt-8 flex flex-col items-center gap-1 font-display font-normal text-display-sm text-text-on-light/70 tracking-widest md:flex-row md:gap-3">
        <span>Jave &amp; Nianne</span>
        <span aria-hidden="true" className="hidden md:inline">&middot;</span>
        <span className="whitespace-nowrap">Friday, January 8, 2027</span>
        <span aria-hidden="true" className="hidden md:inline">&middot;</span>
        <span className="whitespace-nowrap">Lipa, Batangas</span>
      </h1>

      {/* Returning-guest jump-nav — hidden on first visit, surfaces under the names
          once the guest has been all the way through. */}
      <HeroJumpNav />
    </div>
  );
}
