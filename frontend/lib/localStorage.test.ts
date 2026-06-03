import { describe, it, expect, beforeEach } from 'vitest';
import { getLocalItem, setLocalItem, removeLocalItem } from './localStorage';

describe('localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a structured value', () => {
    setLocalItem('k', { a: 1, b: ['x'] });
    expect(getLocalItem('k', null)).toEqual({ a: 1, b: ['x'] });
  });

  it('returns the fallback for a missing key', () => {
    expect(getLocalItem('missing', 'fallback')).toBe('fallback');
  });

  it('returns the fallback (not a throw) for malformed JSON', () => {
    localStorage.setItem('bad', '{ not json');
    expect(getLocalItem('bad', 42)).toBe(42);
  });

  it('removes a key', () => {
    setLocalItem('k', 'v');
    removeLocalItem('k');
    expect(getLocalItem('k', null)).toBeNull();
  });
});
