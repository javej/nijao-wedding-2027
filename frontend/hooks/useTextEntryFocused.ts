'use client';

import { useEffect, useState } from 'react';

/** Input types that summon the on-screen keyboard. */
const TEXT_INPUT_TYPES = new Set([
  'text',
  'email',
  'tel',
  'search',
  'url',
  'password',
  'number',
]);

/** True for anything the guest types into: text-like inputs, textareas, contenteditable. */
export function isTextEntryElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) return TEXT_INPUT_TYPES.has(target.type);
  return target.isContentEditable === true;
}

/**
 * Whether a text-entry element currently has focus — i.e. the on-screen
 * keyboard is (very likely) open on mobile.
 *
 * Why this exists: on Chrome Android the keyboard shrinks the layout viewport,
 * so `position: fixed; bottom: …` controls (the quick-nav FAB, the mute toggle)
 * ride up and sit directly on top of whatever the browser has scrolled into
 * view above the keyboard — typically the very input row the guest is typing
 * into. Fixed chrome should get out of the way while the guest types.
 *
 * The flip back to `false` is delayed by `releaseDelayMs`. Tapping a button
 * next to the input blurs the input on mousedown, *before* mouseup/click. If
 * the fixed control reappeared synchronously it could land under the finger
 * mid-gesture and steal the tap — the exact bug this hook is meant to prevent.
 * A focus that returns within the delay (e.g. the chat refocusing its input
 * for the next question) cancels the release.
 */
export function useTextEntryFocused(releaseDelayMs = 300): boolean {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;

    const cancelRelease = () => {
      if (releaseTimer !== undefined) {
        clearTimeout(releaseTimer);
        releaseTimer = undefined;
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isTextEntryElement(event.target)) return;
      cancelRelease();
      setFocused(true);
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (!isTextEntryElement(event.target)) return;
      cancelRelease();
      releaseTimer = setTimeout(() => {
        releaseTimer = undefined;
        // Re-check rather than blindly clearing: focus may have moved to
        // another text field (email → mobile) inside the delay window.
        setFocused(isTextEntryElement(document.activeElement));
      }, releaseDelayMs);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      cancelRelease();
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [releaseDelayMs]);

  return focused;
}
