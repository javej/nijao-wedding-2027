import { BookHeart, Calendar, Palette, Heart, HelpCircle, House, Users, type LucideIcon } from 'lucide-react';

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

// Each destination is defined once, so a label or target change lands in
// both the Hero pills and the compass menu.
const detailsAnchor: QuickNavAnchor = { id: 'wedding-details', label: 'Jump to Details', shortLabel: 'Details', Icon: Calendar };
const dressCodeAnchor: QuickNavAnchor = { id: 'dress-code', label: 'Jump to Dress Code', shortLabel: 'Dress Code', Icon: Palette };
const rsvpAnchor: QuickNavAnchor = { id: 'rsvp', label: 'Jump to RSVP', shortLabel: 'RSVP', Icon: Heart };
const entourageAnchor: QuickNavAnchor = { id: 'entourage', label: 'Jump to Entourage', shortLabel: 'Entourage', Icon: Users };
const faqAnchor: QuickNavAnchor = { id: 'faq', label: 'Jump to FAQ', shortLabel: 'FAQ', Icon: HelpCircle };

/**
 * The Hero's logistics pills. Kept to four: on phones they sit in a 2×2
 * grid, and a fifth would wrap alone onto its own row. Entourage is in the
 * compass menu only.
 */
export const quickNavAnchors: readonly QuickNavAnchor[] = [
  detailsAnchor,
  dressCodeAnchor,
  rsvpAnchor,
  faqAnchor,
];

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

/** FAB menu, top to bottom: the way back first, then every section in page order. */
export const fabAnchors: readonly QuickNavAnchor[] = [
  homeAnchor,
  storyAnchor,
  detailsAnchor,
  dressCodeAnchor,
  rsvpAnchor,
  entourageAnchor,
  faqAnchor,
];

/** Scroll a section into view, honoring the guest's reduced-motion preference. */
export function scrollToAnchor(id: string, prefersReducedMotion: boolean) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth' });
}
