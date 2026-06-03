import { test, expect } from '@playwright/test';

// A guest slug present in the connected Sanity dataset. Override per-environment.
const GUEST_SLUG = process.env.E2E_GUEST_SLUG ?? 'uxzjzmio';

test.describe('wedding experience smoke', () => {
  test('guest page loads with the couple in the title', async ({ page }) => {
    await page.goto(`/${GUEST_SLUG}`);
    await expect(page).toHaveTitle(/Jave & Nianne/);
  });

  test('RSVP chat renders with the attendance question and chips', async ({
    page,
  }) => {
    await page.goto(`/${GUEST_SLUG}`);

    const log = page.getByRole('log', { name: 'RSVP conversation' });
    await expect(log).toBeVisible();
    await expect(
      log.getByText('Will you be joining us on January 8?'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: "Yes, I'll be there" }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: "Sorry, I can't make it" }),
    ).toBeVisible();
  });

  test('proposal stack drives photo transforms as you scroll', async ({
    page,
  }) => {
    await page.goto(`/${GUEST_SLUG}`);

    // Wait for the client tree to hydrate (the RSVP chat is interactive) so the
    // ProposalStack scroll handler has attached before we probe.
    await expect(
      page.getByRole('log', { name: 'RSVP conversation' }),
    ).toBeVisible();

    // Each probe is self-contained: reset to the proposal start, scroll a delta,
    // and report whether the photo transforms moved. Poll so a not-yet-attached
    // handler retries instead of flaking.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const scroller = document.getElementById('main-content');
            const heading = [...document.querySelectorAll('h2, p')].find((el) =>
              /The Proposal/i.test(el.textContent || ''),
            );
            const stack = heading?.closest<HTMLElement>(
              'div[style*="min-height"]',
            );
            if (!scroller || !stack) return false;

            const sample = () =>
              [...stack.querySelectorAll<HTMLElement>('div[style*="transform"]')]
                .filter((d) => /translate/.test(d.style.transform))
                .slice(0, 3)
                .map((d) => `${d.style.transform}|${d.style.opacity}`)
                .join(',');

            stack.scrollIntoView();
            const before = sample();
            scroller.scrollBy(0, Math.round(scroller.clientHeight * 1.2));

            return new Promise<boolean>((resolve) => {
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve(sample() !== before)),
              );
            });
          }),
        { timeout: 6000 },
      )
      .toBe(true);
  });
});
