import { Calendar, Palette, Heart, HelpCircle, type LucideIcon } from 'lucide-react';

/** A jump-navigation destination shared by the Hero nav and the floating FAB. */
export interface QuickNavAnchor {
  /** Target section's HTML id */
  id: string;
  /** Full accessible label (announced to screen readers) */
  label: string;
  /** Short visible label on the pill */
  shortLabel: string;
  Icon: LucideIcon;
}

/**
 * Single source of truth for both quick-nav widgets. The Hero ghost-pill
 * nav and the floating compass FAB both render from this list, so a label
 * or destination change lands in both places at once.
 */
export const quickNavAnchors: readonly QuickNavAnchor[] = [
  { id: 'wedding-details', label: 'Jump to Location', shortLabel: 'Location', Icon: Calendar },
  { id: 'dress-code', label: 'Jump to Dress Code', shortLabel: 'Attire', Icon: Palette },
  { id: 'rsvp', label: 'Jump to RSVP', shortLabel: 'RSVP', Icon: Heart },
  { id: 'faq', label: 'Jump to FAQ', shortLabel: 'FAQ', Icon: HelpCircle },
] as const;

/** Scroll a section into view, honoring the guest's reduced-motion preference. */
export function scrollToAnchor(id: string, prefersReducedMotion: boolean) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth' });
}
