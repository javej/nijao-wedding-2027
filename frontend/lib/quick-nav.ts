import { BookHeart, Calendar, Palette, Heart, HelpCircle, House, type LucideIcon } from 'lucide-react';

/** A jump-navigation destination shared by the Hero nav and the floating FAB. */
export interface QuickNavAnchor {
  /** Target section's HTML id */
  id: string;
  /**
   * Full accessible label (announced to screen readers). Must contain
   * `shortLabel` verbatim so voice-control users can say what they see
   * (WCAG 2.5.3 Label in Name).
   */
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
  { id: 'wedding-details', label: 'Jump to Details', shortLabel: 'Details', Icon: Calendar },
  { id: 'dress-code', label: 'Jump to Dress Code', shortLabel: 'Dress Code', Icon: Palette },
  { id: 'rsvp', label: 'Jump to RSVP', shortLabel: 'RSVP', Icon: Heart },
  { id: 'faq', label: 'Jump to FAQ', shortLabel: 'FAQ', Icon: HelpCircle },
] as const;

/**
 * The love story opens at the Act One card. The Hero leads with it as its
 * main action and the FAB offers it too, because guests were tapping
 * straight into the logistics shortcuts and never seeing the story.
 */
export const storyAnchor: QuickNavAnchor = {
  id: 'story-prologue',
  label: 'Jump to Our Story',
  shortLabel: 'Our Story',
  Icon: BookHeart,
};

/**
 * Back to the Hero. The page scrolls inside <main>, not the document, so a
 * phone's tap-the-status-bar shortcut can't take guests to the top.
 */
export const homeAnchor: QuickNavAnchor = {
  id: 'hero',
  label: 'Back to Home',
  shortLabel: 'Home',
  Icon: House,
};

/** FAB menu, top to bottom: the way back first, then the logistics. */
export const fabAnchors: readonly QuickNavAnchor[] = [homeAnchor, storyAnchor, ...quickNavAnchors];

/** Scroll a section into view, honoring the guest's reduced-motion preference. */
export function scrollToAnchor(id: string, prefersReducedMotion: boolean) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth' });
}
