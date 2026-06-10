# Wedding Invitation

A print-ready 5×7in invitation generated from the website's own design system —
the palette, type (Cormorant Garamond / DM Sans / Newsreader), the `.jn`
monogram, and the watercolor/stationery assets in `frontend/public/decorations`.

## Files

- `jave-and-nianne-wedding-invitation.pdf` — true 5×7in page, print-ready
- `jave-and-nianne-wedding-invitation.jpg` — 1440×2016 px (≈288 DPI)
- `invitation.html` — the layout (single source of truth for the design)
- `generate.mjs` — renders the HTML to both formats with headless Chromium

## Regenerating

```sh
npm i playwright && npx playwright install chromium   # one-time
node generate.mjs
```

If Chromium lives somewhere non-standard, point at the binary:
`PLAYWRIGHT_CHROMIUM=/path/to/chrome node generate.mjs`.
