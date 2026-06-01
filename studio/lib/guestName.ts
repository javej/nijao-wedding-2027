// Single source of truth for how a guest's name is rendered across the Studio
// (document preview, RSVP dashboard, guest-link generator, CSV export). Change
// the format here — e.g. to "Last, First" for the caterer — and it updates
// everywhere at once.
export function fullName(guest: {
  firstName?: string | null;
  lastName?: string | null;
}): string {
  return [guest.firstName, guest.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}
