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
      <h1 className="font-semibold text-display-lg text-text-on-light">
        Jave & Nianne
      </h1>

      <p className="font-display font-light text-display-xl text-text-on-light leading-display mt-6 italic">
        Ten years. One more day.
      </p>

      <p className="font-display font-normal text-display-md text-text-on-light leading-display mt-8">
        January 8, 2027
      </p>
    </div>
  );
}
