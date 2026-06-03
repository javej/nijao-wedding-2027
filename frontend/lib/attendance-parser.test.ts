import { describe, it, expect } from 'vitest';
import { classifyResponse } from './attendance-parser';

describe('classifyResponse', () => {
  it.each([
    'yes',
    "Yes, I'll be there",
    'yep count me in',
    'sure',
    'opo',
    'sige',
    "we'll both be there",
    'I will attend',
  ])('classifies %j as yes', (input) => {
    expect(classifyResponse(input)).toBe('yes');
  });

  it.each([
    'no',
    "Sorry, I can't make it",
    'nope',
    'hindi po',
    'we cannot come',
    "won't be able to make it",
    'not coming',
    'I have to decline',
  ])('classifies %j as no', (input) => {
    expect(classifyResponse(input)).toBe('no');
  });

  // Bug #5: keyword phrases must beat weak leading words.
  it('reads "ok I can\'t make it" as no (negative phrase beats the "ok" lead-in)', () => {
    expect(classifyResponse("ok I can't make it")).toBe('no');
  });

  it('reads "no problem, I\'ll be there" as yes (affirmative phrase beats "no")', () => {
    expect(classifyResponse("no problem, I'll be there")).toBe('yes');
  });

  it('treats a bare "ok"/"okay" as yes', () => {
    expect(classifyResponse('ok')).toBe('yes');
    expect(classifyResponse('okay!')).toBe('yes');
  });

  it.each(['maybe', 'hmm', "I don't know yet", ''])(
    'returns null for the ambiguous/empty reply %j',
    (input) => {
      expect(classifyResponse(input)).toBeNull();
    },
  );
});
