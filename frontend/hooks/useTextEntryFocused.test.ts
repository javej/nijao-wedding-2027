import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { isTextEntryElement, useTextEntryFocused } from './useTextEntryFocused';

function mount(html: string) {
  document.body.innerHTML = html;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('isTextEntryElement', () => {
  it('recognises keyboard-summoning inputs and rejects buttons', () => {
    mount(`
      <input id="email" type="email" />
      <input id="tel" type="tel" />
      <input id="check" type="checkbox" />
      <textarea id="ta"></textarea>
      <button id="btn" type="button">Send</button>
    `);
    expect(isTextEntryElement(document.getElementById('email'))).toBe(true);
    expect(isTextEntryElement(document.getElementById('tel'))).toBe(true);
    expect(isTextEntryElement(document.getElementById('ta'))).toBe(true);
    expect(isTextEntryElement(document.getElementById('check'))).toBe(false);
    expect(isTextEntryElement(document.getElementById('btn'))).toBe(false);
    expect(isTextEntryElement(null)).toBe(false);
  });
});

describe('useTextEntryFocused', () => {
  it('is false until a text field takes focus, then true', () => {
    mount('<input id="email" type="email" />');
    const { result } = renderHook(() => useTextEntryFocused());
    expect(result.current).toBe(false);

    act(() => document.getElementById('email')!.focus());
    expect(result.current).toBe(true);
  });

  it('stays true through the release window after blur, then drops', () => {
    mount('<input id="email" type="email" /><button id="send" type="button">Send</button>');
    const { result } = renderHook(() => useTextEntryFocused(300));

    act(() => document.getElementById('email')!.focus());
    expect(result.current).toBe(true);

    // Tapping Send blurs the input on mousedown — the fixed controls must NOT
    // reappear under the finger before the click lands.
    act(() => document.getElementById('send')!.focus());
    expect(result.current).toBe(true);

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe(true);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it('cancels the release when focus returns to a text field in time', () => {
    mount('<input id="email" type="email" /><input id="tel" type="tel" />');
    const { result } = renderHook(() => useTextEntryFocused(300));

    act(() => document.getElementById('email')!.focus());
    act(() => (document.activeElement as HTMLElement).blur());
    act(() => vi.advanceTimersByTime(100));
    // The chat refocuses its input for the next question (email → mobile).
    act(() => document.getElementById('tel')!.focus());
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe(true);
  });

  it('ignores focus moving between non-text controls', () => {
    mount('<button id="a" type="button">A</button><button id="b" type="button">B</button>');
    const { result } = renderHook(() => useTextEntryFocused());

    act(() => document.getElementById('a')!.focus());
    act(() => document.getElementById('b')!.focus());
    act(() => vi.advanceTimersByTime(1000));

    expect(result.current).toBe(false);
  });
});
