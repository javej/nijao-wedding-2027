import { describe, it, expect } from 'vitest';
import { isValidEmail, normalizeEmail, normalizePhMobile } from './contact';

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Jave@Example.COM ')).toBe('jave@example.com');
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.co', 'jave.jao@example.ph', 'x+tag@sub.domain.io'])(
    'accepts %s',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(['', 'no-at-sign', 'missing@domain', '@example.com', 'a b@c.com'])(
    'rejects %s',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );

  it('ignores surrounding whitespace', () => {
    expect(isValidEmail('  a@b.co  ')).toBe(true);
  });
});

describe('normalizePhMobile', () => {
  it.each([
    ['09171234567', '+639171234567'], // local 11-digit
    ['+639171234567', '+639171234567'], // E.164
    ['639171234567', '+639171234567'], // international no plus
    ['9171234567', '+639171234567'], // bare 10-digit national
    ['0917 123 4567', '+639171234567'], // spaces
    ['0917-123-4567', '+639171234567'], // dashes
    ['(0917) 123.4567', '+639171234567'], // parens + dot
  ])('normalizes %s to E.164', (input, expected) => {
    expect(normalizePhMobile(input)).toBe(expected);
  });

  it.each([
    '02 8123 4567', // landline (area code 2)
    '0823 456 789', // 10-digit national not starting with 9
    '0917123456', // too short
    '091712345678', // too long
    'not a number',
    '',
  ])('rejects %s', (input) => {
    expect(normalizePhMobile(input)).toBeNull();
  });

  it('rejects an E.164-shaped number whose national part does not start with 9', () => {
    // +63 followed by 10 digits starting with 8 -> a landline shape, not mobile
    expect(normalizePhMobile('+638123456789')).toBeNull();
  });
});
