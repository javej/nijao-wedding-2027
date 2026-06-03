/**
 * Pure geometry for the ProposalStack scroll animation. Kept dependency-free
 * (no React / next/image) so it can be unit-tested directly and shared between
 * the component's initial render and its imperative scroll updates.
 */

/**
 * Scroll budget reserved for the caption reveal at the tail end of the pinned
 * travel. The accumulation phase ends at (1 - CAPTION_TAIL); the last
 * CAPTION_TAIL fades the caption in over the fully-built stack.
 */
export const CAPTION_TAIL = 0.2;

/**
 * Max fraction of total scroll progress dedicated to ONE photo's drop
 * animation. With few photos this prevents the slot from stretching across
 * most of the scroll; with many photos the slot shortens proportionally so all
 * drops still fit within the accumulation phase.
 */
export const MAX_SLOT_FRACTION = 0.25;

/**
 * Pre-stack offset (px) below the stack centre that a photo rises from.
 * Positive = enters from below, matching the downward scroll direction.
 */
export const RISE_FROM_PX = 240;

/**
 * Hand-arranged final stack positions. Each photo lands at a unique tilt +
 * offset relative to the stack centre, with z-order picking which ends up on
 * top. Up to 5 photos supported; past that, the cycle repeats.
 */
export const STACK_SLOTS: ReadonlyArray<{
  rotate: number;
  offsetX: number; // px relative to centre
  offsetY: number;
  z: number;
}> = [
  { rotate: -6, offsetX: -14, offsetY: -10, z: 1 },
  { rotate: 5, offsetX: 12, offsetY: -4, z: 2 },
  { rotate: -3, offsetX: -4, offsetY: 6, z: 3 },
  { rotate: 7, offsetX: 10, offsetY: 14, z: 4 },
  { rotate: -2, offsetX: -10, offsetY: 18, z: 5 },
];

/**
 * Geometry for one photo at a given scroll progress (0..1). Shared by the
 * initial render (p=0) and the imperative scroll updates so both stay in sync.
 *
 * Each photo's drop slot is the SMALLER of MAX_SLOT_FRACTION and an even share
 * of the accumulation phase, so few-photo stacks land quickly and dwell while
 * many-photo stacks still fit before the caption-tail fade-in begins.
 */
export function computePhotoStyle(
  index: number,
  total: number,
  progress: number,
): { transform: string; opacity: number; zIndex: number } {
  const slot = STACK_SLOTS[index % STACK_SLOTS.length]!;

  const accumulationEnd = 1 - CAPTION_TAIL;
  const evenShare = accumulationEnd / total;
  const slotFraction = Math.min(MAX_SLOT_FRACTION, evenShare);
  const slotStart = index * slotFraction;
  const slotEnd = slotStart + slotFraction;
  const slotProgress = Math.min(
    1,
    Math.max(0, (progress - slotStart) / (slotEnd - slotStart)),
  );

  // Interpolate from pre-stack position (below the stack) to final stacked
  // slot. `riseY` starts positive (below centre) and decays toward 0 as
  // slotProgress → 1, so the photo rises into place.
  const riseY = (1 - slotProgress) * RISE_FROM_PX;
  const rotate = slot.rotate * slotProgress;
  const tx = slot.offsetX * slotProgress;
  const ty = riseY + slot.offsetY * slotProgress;
  // Fade-in occupies the first ~30% of the slot so the photo is already visible
  // by the time it's finishing its rotation.
  const opacity = Math.min(1, slotProgress * 3.3);

  return {
    transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`,
    opacity,
    zIndex: slot.z,
  };
}

export function computeCaptionOpacity(progress: number): number {
  const accumulationEnd = 1 - CAPTION_TAIL;
  return progress <= accumulationEnd
    ? 0
    : Math.min(1, (progress - accumulationEnd) / CAPTION_TAIL);
}
