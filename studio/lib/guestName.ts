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

// Adds the nickname in parentheses when it differs from the first name, e.g.
// "Jane Doe (Janey)". Used where Jave needs to match a person to how the family
// actually calls them (guest-link generator, RSVP dashboard).
export function nameWithNickname(guest: {
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
}): string {
  const name = fullName(guest);
  const nickname = guest.nickname?.trim();
  if (!nickname || nickname.toLowerCase() === guest.firstName?.trim().toLowerCase()) {
    return name;
  }
  return `${name} (${nickname})`;
}
