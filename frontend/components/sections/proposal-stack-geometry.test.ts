import { describe, it, expect } from 'vitest';
import {
  computeCaptionOpacity,
  computePhotoStyle,
  STACK_SLOTS,
} from './proposal-stack-geometry';

describe('computePhotoStyle', () => {
  it('starts the first photo below the stack, fully transparent (progress 0)', () => {
    const s = computePhotoStyle(0, 3, 0);
    expect(s.transform).toBe('translate(0px, 240px) rotate(0deg)');
    expect(s.opacity).toBe(0);
    expect(s.zIndex).toBe(STACK_SLOTS[0]!.z);
  });

  it('lands the first photo on its slot by full progress', () => {
    const s = computePhotoStyle(0, 3, 1);
    const slot = STACK_SLOTS[0]!;
    expect(s.transform).toBe(
      `translate(${slot.offsetX}px, ${slot.offsetY}px) rotate(${slot.rotate}deg)`,
    );
    expect(s.opacity).toBe(1);
  });

  it('keeps a later photo pre-stack while an earlier one has landed (staggered drop)', () => {
    // At progress 0.2, photo 0's slot is done but photo 2 hasn't started.
    const first = computePhotoStyle(0, 3, 0.2);
    const third = computePhotoStyle(2, 3, 0.2);
    expect(first.opacity).toBe(1);
    expect(third.opacity).toBe(0);
    expect(third.transform).toContain('240px');
  });

  it('cycles slot geometry past the slot-table length', () => {
    const sixth = computePhotoStyle(5, 6, 1);
    const first = computePhotoStyle(0, 6, 1);
    // index 5 % 5 === 0 -> same slot tilt/offset as index 0
    expect(sixth.transform).toBe(first.transform);
  });
});

describe('computeCaptionOpacity', () => {
  it('is hidden during the accumulation phase', () => {
    expect(computeCaptionOpacity(0)).toBe(0);
    expect(computeCaptionOpacity(0.5)).toBe(0);
    expect(computeCaptionOpacity(0.8)).toBe(0);
  });

  it('fades in over the caption tail and is fully shown at the end', () => {
    expect(computeCaptionOpacity(0.9)).toBeCloseTo(0.5, 5);
    // ~1.0 (float arithmetic lands at 0.9999999999999998; clamped, never > 1).
    expect(computeCaptionOpacity(1)).toBeCloseTo(1, 5);
    expect(computeCaptionOpacity(1)).toBeLessThanOrEqual(1);
  });
});
