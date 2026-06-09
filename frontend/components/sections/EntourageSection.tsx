import { cn } from "@/lib/utils";
import type { PadrinoResult, WeddingPartyResult, EntourageMemberResult } from "@/sanity/queries/entourage";

interface EntourageSectionProps {
  padrinos: PadrinoResult[];
  weddingParty: WeddingPartyResult[];
}

/* ──────────────────────────────────────────────────────────
 * Role grouping config.
 *
 * Names are displayed grouped under their role. The order of
 * each list below is the cultural display order; the role
 * `value` matches the exact string stored on the Sanity
 * document, and `heading` is the hand-tuned label (singular
 * for solo roles, plural for group roles).
 *
 * Padrino roles also define the section split — anything not
 * listed here as a padrino role falls into the Wedding Party.
 * ────────────────────────────────────────────────────────── */

interface RoleGroupConfig {
  role: string;
  heading: string;
}

const PADRINO_ROLE_ORDER: readonly RoleGroupConfig[] = [
  { role: "Ninong", heading: "Ninongs" },
  { role: "Ninang", heading: "Ninangs" },
];

const WEDDING_PARTY_ROLE_ORDER: readonly RoleGroupConfig[] = [
  { role: "Best Man", heading: "Best Man" },
  { role: "Maid of Honor", heading: "Maid of Honor" },
  { role: "Groomsman", heading: "Groomsmen" },
  { role: "Bridesmaid", heading: "Bridesmaids" },
  { role: "Candle Sponsor", heading: "To Light Our Path" },
  { role: "Veil Sponsor", heading: "To Bind Us As One" },
  { role: "Cord Sponsor", heading: "To Clothe Us As One" },
  { role: "Ring Bearer", heading: "Ring Bearer" },
  { role: "Bible & Coin Bearer", heading: "Bible & Coin Bearer" },
  { role: "Flower Girl", heading: "Flower Girls" },
];

/**
 * Heading tint by role. Men's roles read green (deep-matcha), women's
 * roles read wine (raspberry), and the couple sponsor roles read rose
 * (strawberry-jam). Only these three palette colors are used because,
 * on the paper-white chapter bg (#faf9f6), they are the ones that clear
 * WCAG AA as text (deep-matcha ~5.5:1, raspberry ~6.1:1, strawberry-jam
 * ~4.8:1). The lighter palette shades fail contrast and are excluded.
 */
const MEN_TINT = "text-deep-matcha";
const WOMEN_TINT = "text-raspberry";
const COUPLE_TINT = "text-strawberry-jam";

const ROLE_TINT: Record<string, string> = {
  Ninong: MEN_TINT,
  Ninang: WOMEN_TINT,
  "Best Man": MEN_TINT,
  "Maid of Honor": WOMEN_TINT,
  Groomsman: MEN_TINT,
  Bridesmaid: WOMEN_TINT,
  "Candle Sponsor": COUPLE_TINT,
  "Veil Sponsor": COUPLE_TINT,
  "Cord Sponsor": COUPLE_TINT,
  "Ring Bearer": MEN_TINT,
  "Bible & Coin Bearer": MEN_TINT,
  "Flower Girl": WOMEN_TINT,
};

interface RoleGroup {
  role: string;
  heading: string;
  members: EntourageMemberResult[];
}

/**
 * Bucket members (already name-sorted by the query) into role groups in
 * canonical order. Any role not in the config — e.g. a legacy free-text
 * value not yet migrated to the enum — is appended alphabetically using
 * the raw role string as its heading, so no one silently disappears.
 */
function groupByRole(members: EntourageMemberResult[], order: readonly RoleGroupConfig[]): RoleGroup[] {
  const buckets = new Map<string, EntourageMemberResult[]>();
  for (const member of members) {
    const key = member.role.trim();
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(member);
    } else {
      buckets.set(key, [member]);
    }
  }

  const groups: RoleGroup[] = [];
  for (const config of order) {
    const members = buckets.get(config.role);
    if (members && members.length > 0) {
      groups.push({ role: config.role, heading: config.heading, members });
      buckets.delete(config.role);
    }
  }

  const leftover = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [role, members] of leftover) {
    groups.push({ role, heading: role, members });
  }

  return groups;
}

/* ──────────────────────────────────────────────────────────
 * RoleGroupBlock — a centered role heading over a list of
 * names. Names use the chapter's on-light text token; only
 * the heading carries the role's gender-based palette tint.
 * ────────────────────────────────────────────────────────── */

/**
 * `flow` controls how names lay out beneath the heading:
 *  - "wrap"   — centered wrapping row; sparse groups (e.g. two Flower
 *               Girls) stay balanced at every breakpoint instead of
 *               left-shifting in a fixed grid.
 *  - "column" — single centered column flowing downward, used inside a
 *               side-by-side paired row (e.g. Ninongs | Ninangs).
 */
function RoleGroupBlock({ group, flow = "wrap" }: { group: RoleGroup; flow?: "wrap" | "column" }) {
  const tintClass = ROLE_TINT[group.role] ?? MEN_TINT;

  const listClass =
    flow === "column"
      ? "flex flex-col items-center gap-y-2 md:gap-y-3"
      : "flex flex-wrap justify-center gap-x-8 sm:gap-x-10 gap-y-2 md:gap-y-3";

  return (
    <div className="w-full">
      <h4
        className={cn(
          "font-body text-body-sm tracking-widest uppercase text-center mb-4 md:mb-5",
          tintClass,
        )}
      >
        {group.heading}
      </h4>
      <ul className={cn("text-text-on-light", listClass)}>
        {group.members.map((member) => (
          <li
            key={member._id}
            className="font-display font-normal text-lg md:text-xl lg:text-2xl leading-snug text-center"
          >
            {member.name.trim()}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Candle/Veil/Cord sponsors — couple roles shown as paired columns. */
const SECONDARY_SPONSOR_ROLES = ["Candle Sponsor", "Veil Sponsor", "Cord Sponsor"] as const;

/* ──────────────────────────────────────────────────────────
 * SponsorPairsBlock — Candle / Veil / Cord stacked, each
 * shown as a left | right couple under its symbolic heading
 * (tinted with the couple color), mirroring the paired layout
 * used across the rest of the entourage.
 * ────────────────────────────────────────────────────────── */

function SponsorPairsBlock({ groups }: { groups: RoleGroup[] }) {
  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {groups.map((group) => (
        <div key={group.role} className="w-full">
          <h4
            className={cn(
              "font-body text-body-sm tracking-widest uppercase text-center mb-4 md:mb-5",
              ROLE_TINT[group.role] ?? COUPLE_TINT,
            )}
          >
            {group.heading}
          </h4>
          <ul className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-y-0 gap-x-6 max-w-xl mx-auto">
            {group.members.map((member) => (
              <li
                key={member._id}
                className="font-display font-normal text-lg md:text-xl lg:text-2xl leading-snug text-text-on-light text-center"
              >
                {member.name.trim()}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * EntourageSection — Server Component.
 *
 * Names only, categorized by role. Two sections derived from
 * role: the Principal Sponsors (Ninongs, Ninangs) and the Wedding
 * Party (everyone else). Within each section, names are
 * grouped under their role heading in cultural order, listed
 * alphabetically. Heading tints follow the role's gender
 * (green for men, wine for women, rose for couple sponsors).
 * ────────────────────────────────────────────────────────── */

export function EntourageSection({ padrinos, weddingParty }: EntourageSectionProps) {
  const padrinoGroups = groupByRole(padrinos, PADRINO_ROLE_ORDER);
  const weddingPartyGroups = groupByRole(weddingParty, WEDDING_PARTY_ROLE_ORDER);

  const hasPadrinos = padrinoGroups.length > 0;
  const hasWeddingParty = weddingPartyGroups.length > 0;

  // Ninongs + Ninangs sit side by side as two downward-flowing columns when
  // both exist; otherwise each falls through to the normal stacked layout.
  const ninongs = padrinoGroups.find((group) => group.role === "Ninong");
  const ninangs = padrinoGroups.find((group) => group.role === "Ninang");
  const pairPadrinos = Boolean(ninongs && ninangs);
  const restPadrinoGroups = pairPadrinos
    ? padrinoGroups.filter((group) => group.role !== "Ninong" && group.role !== "Ninang")
    : padrinoGroups;

  // Counterpart roles render as side-by-side pairs (men left, women right)
  // when both halves exist: Best Man | Maid of Honor as single centered
  // names, Groomsmen | Bridesmaids as downward-flowing columns. Any role
  // whose pair is incomplete falls through to the normal stacked layout.
  const bestMan = weddingPartyGroups.find((group) => group.role === "Best Man");
  const maidOfHonor = weddingPartyGroups.find((group) => group.role === "Maid of Honor");
  const groomsmen = weddingPartyGroups.find((group) => group.role === "Groomsman");
  const bridesmaids = weddingPartyGroups.find((group) => group.role === "Bridesmaid");

  const pairedRoles = new Set<string>();
  if (bestMan && maidOfHonor) {
    pairedRoles.add("Best Man").add("Maid of Honor");
  }
  if (groomsmen && bridesmaids) {
    pairedRoles.add("Groomsman").add("Bridesmaid");
  }
  const hasPairedLeaders = Boolean((bestMan && maidOfHonor) || (groomsmen && bridesmaids));

  // Candle/Veil/Cord collapse into one Secondary Sponsors tier (in config order).
  const secondarySponsorGroups = SECONDARY_SPONSOR_ROLES.map((role) =>
    weddingPartyGroups.find((group) => group.role === role),
  ).filter((group): group is RoleGroup => group !== undefined);

  // Whatever is left after pairs + sponsors (bearers, flower girls, stragglers).
  const excludedRoles = new Set<string>([...pairedRoles, ...SECONDARY_SPONSOR_ROLES]);
  const otherWeddingPartyGroups = weddingPartyGroups.filter((group) => !excludedRoles.has(group.role));

  return (
    <div className="flex flex-col items-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="font-body font-normal text-display-md text-text-on-light tracking-wide text-center mb-12 md:mb-16">
        Entourage
      </h2>

      {hasPadrinos && (
        <div className="w-full max-w-3xl">
          <h3 className="font-display italic font-normal text-display-md text-text-on-light tracking-wide text-center mb-10 md:mb-12">
            Principal Sponsors
          </h3>

          <div className="flex flex-col gap-10 md:gap-12">
            {ninongs && ninangs && (
              <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-y-0 gap-x-4 md:gap-x-6 items-start">
                <RoleGroupBlock group={ninongs} flow="column" />
                <RoleGroupBlock group={ninangs} flow="column" />
              </div>
            )}
            {restPadrinoGroups.map((group) => (
              <RoleGroupBlock key={group.role} group={group} />
            ))}
          </div>
        </div>
      )}

      {hasWeddingParty && (
        <div className={cn("w-full max-w-3xl", hasPadrinos && "mt-12 md:mt-14")}>
          <h3 className="font-display italic font-normal text-display-md text-text-on-light tracking-wide text-center mb-10 md:mb-12">
            Wedding Party
          </h3>

          {/* Larger gaps separate the tiers: principal entourage → secondary
              sponsors → bearers & flower girls. */}
          <div className="flex flex-col gap-12 md:gap-16">
            {hasPairedLeaders && (
              <div className="flex flex-col gap-10 md:gap-12">
                {bestMan && maidOfHonor && (
                  <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-y-0 gap-x-4 md:gap-x-6">
                    <RoleGroupBlock group={bestMan} />
                    <RoleGroupBlock group={maidOfHonor} />
                  </div>
                )}
                {groomsmen && bridesmaids && (
                  <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-y-0 gap-x-4 md:gap-x-6 items-start">
                    <RoleGroupBlock group={groomsmen} flow="column" />
                    <RoleGroupBlock group={bridesmaids} flow="column" />
                  </div>
                )}
              </div>
            )}

            {secondarySponsorGroups.length > 0 && (
              <SponsorPairsBlock groups={secondarySponsorGroups} />
            )}

            {otherWeddingPartyGroups.length > 0 && (
              <div className="flex flex-col gap-10 md:gap-12">
                {otherWeddingPartyGroups.map((group) => (
                  <RoleGroupBlock key={group.role} group={group} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
