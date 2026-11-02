import { FAQAccordion } from "@/components/sections/faq/FAQAccordion";
import type { FaqResult } from "@/sanity/queries/faqs";

interface FAQSectionProps {
  faqs: FaqResult[];
}

/**
 * FAQ scroll chapter — sits between RSVP and Countdown. Mirrors the centered
 * composition of the other functional sections: one visible h2 display
 * heading and a width-constrained body. The questions render as a
 * multiple-open accordion (all collapsed on load) whose h3 question headers
 * nest under that h2. Falls back to the same faded placeholder as Entourage
 * when no FAQs are published, so the section, its nav anchor, and the scroll
 * order stay intact.
 */
export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <div className="flex flex-col items-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      {faqs.length > 0 ? (
        <div className="w-full max-w-3xl">
          <h2 className="font-body font-normal text-display-md text-text-on-light tracking-wide text-center mb-10 md:mb-12">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={faqs} />
        </div>
      ) : (
        <h2 className="font-body text-display-md text-text-on-light/40">FAQ</h2>
      )}
    </div>
  );
}
