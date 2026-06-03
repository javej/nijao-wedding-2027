import { useEffect, type RefObject } from 'react';

/**
 * Lifts an element above the on-screen virtual keyboard on mobile.
 *
 * The keyboard is the gap between the layout viewport and the visual viewport.
 * We measure the layout viewport with `documentElement.clientHeight` (the
 * 100dvh root box), NOT `window.innerHeight`: on mobile, innerHeight stays at
 * the large-viewport height while the address bar is showing, so an innerHeight
 * formula treats the address bar as keyboard inset and shoves the element up
 * during normal scrolling. clientHeight tracks the dynamic viewport, so it
 * differs from the visual viewport only when the keyboard is actually open.
 *
 * Writes `transform: translateY(-Npx)` directly to the node (no React state) so
 * keyboard show/hide doesn't re-render the subtree.
 */
export function useVisualViewportOffset(
  ref: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current;
    if (!vv || !el) return;

    function handleResize() {
      if (!el) return;
      const keyboardInset =
        document.documentElement.clientHeight - vv!.height - vv!.offsetTop;
      // > 1 (not > 0) absorbs sub-pixel viewport rounding so we don't apply a
      // translateY(-0.x px) when no keyboard is present.
      if (keyboardInset > 1) {
        el.style.transform = `translateY(-${keyboardInset}px)`;
      } else {
        el.style.transform = '';
      }
    }

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, [ref]);
}
