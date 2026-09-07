import { describe, it, expect } from 'vitest';
import { normalizePlate } from './plate';

describe('normalizePlate', () => {
  it.each([
    ['abc 1234', 'ABC 1234'], // new 2014+ format, lowercase
    ['ABC 123', 'ABC 123'], // legacy 3+3
    ['abc-1234', 'ABC 1234'], // dash separator
    ['  nbc   1234 ', 'NBC 1234'], // stray whitespace
    ['ABC1234', 'ABC1234'], // no separator is left as typed
    ['123 ABC', '123 ABC'], // motorcycle-style
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizePlate(input)).toBe(expected);
  });

  it.each([
    '', // empty
    '   ', // whitespace only
    'AB', // too short to be a plate
    'ABCDEFGHIJKL', // too long
    'ABC 1234!', // punctuation other than separators
    'ABCDEF', // letters only
    '123456', // digits only
  ])('rejects %j', (input) => {
    expect(normalizePlate(input)).toBeNull();
  });
});
