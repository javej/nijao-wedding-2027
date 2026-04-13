/**
 * HeroSection — Server Component
 *
 * First content chapter after the arrival overlay.
 * Renders the couple's names, tagline, and wedding date
 * using display typography with generous negative space.
 */
export function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-background px-(--chapter-padding-x) py-(--chapter-padding-y)">
      {/* Visual headline — tagline is the emotional centrepiece */}
      <p className="font-display font-light text-display-xl text-text-on-light leading-display">
        Ten years.
        <br />
        <em className="text-raspberry">One more day.</em>
      </p>

      {/* Semantic h1 styled as secondary tagline — screen readers still find the title */}
      <h1 className="font-display font-normal text-display-sm text-text-on-light/70 tracking-widest mt-8">
        Jave &amp; Nianne &middot; January 8, 2027 &middot; Lipa, Batangas
      </h1>
    </div>
  );
}
