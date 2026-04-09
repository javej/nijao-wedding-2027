export default function TokenPreviewPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl mb-8">Design Token Preview</h1>

      {/* Palette Colors — using Tailwind utility classes to verify token generation */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Wedding Palette</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorSwatch name="deep-matcha" hex="#676930" className="bg-deep-matcha" />
          <ColorSwatch name="raspberry" hex="#9c4051" className="bg-raspberry" />
          <ColorSwatch name="golden-matcha" hex="#baaf2f" className="bg-golden-matcha" />
          <ColorSwatch name="strawberry-jam" hex="#b55a64" className="bg-strawberry-jam" />
          <ColorSwatch name="matcha-chiffon" hex="#b2bf93" className="bg-matcha-chiffon" />
          <ColorSwatch name="berry-meringue" hex="#c98d8e" className="bg-berry-meringue" />
          <ColorSwatch name="matcha-latte" hex="#9fc768" className="bg-matcha-latte" />
          <ColorSwatch name="strawberry-milk" hex="#e8bcbc" className="bg-strawberry-milk" />
        </div>
      </section>

      {/* Supporting Colors */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Supporting Colors</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorSwatch name="primary-dark" hex="#7a3040" className="bg-primary-dark" />
          <ColorSwatch name="text-on-dark" hex="#ffffff" className="bg-text-on-dark border-2 border-gray-300" />
          <ColorSwatch name="text-on-light" hex="#1a1a1a" className="bg-text-on-light" />
          <ColorSwatch name="background" hex="#faf9f6" className="bg-background" />
        </div>
      </section>

      {/* Typography — using Tailwind utility classes to verify token generation */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-6">Typography</h2>

        <div className="mb-8">
          <h3 className="font-body text-lg font-medium mb-3">
            Cormorant Garamond (Display)
          </h3>
          <div className="space-y-3">
            <p className="font-display font-light text-display-2xl leading-display">
              Display 2XL (300)
            </p>
            <p className="font-display text-display-xl leading-display">
              Display XL (400)
            </p>
            <p className="font-display font-semibold text-display-lg leading-display">
              Display LG (600)
            </p>
            <p className="font-display text-display-md leading-display">
              Display MD (400)
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-body text-lg font-medium mb-3">
            DM Sans (Body)
          </h3>
          <div className="space-y-2">
            <p className="font-body text-body-lg leading-body">
              Body LG — The quick brown fox jumps over the lazy dog (400)
            </p>
            <p className="font-body text-body-md leading-body">
              Body MD — The quick brown fox jumps over the lazy dog (400)
            </p>
            <p className="font-body font-medium text-body-sm leading-body">
              Body SM — The quick brown fox jumps over the lazy dog (500)
            </p>
            <p className="font-body text-ui-md leading-ui">
              UI MD — The quick brown fox jumps over the lazy dog
            </p>
            <p className="font-body text-ui-sm leading-ui">
              UI SM — The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </section>

      {/* Animation Durations */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Animation Durations</h2>
        <div className="grid grid-cols-3 gap-4 font-body text-sm">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">ceremony</p>
            <p className="text-muted-foreground">400ms</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">chapter</p>
            <p className="text-muted-foreground">600ms</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">rsvp</p>
            <p className="text-muted-foreground">300ms</p>
          </div>
        </div>
      </section>

      {/* Shadows — using Tailwind utility classes */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Shadows</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="rounded-lg bg-background p-6 font-body text-sm shadow-card">
            <p className="font-medium">shadow-card</p>
          </div>
          <div className="rounded-lg bg-background p-6 font-body text-sm shadow-overlay">
            <p className="font-medium">shadow-overlay</p>
          </div>
          <div className="rounded-lg bg-background p-6 font-body text-sm shadow-anchor">
            <p className="font-medium">shadow-anchor</p>
          </div>
        </div>
      </section>

      {/* Easing */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Easing Curves</h2>
        <div className="grid grid-cols-3 gap-4 font-body text-sm">
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">ease-enter</p>
            <p className="text-muted-foreground text-xs">
              cubic-bezier(0.0, 0.0, 0.2, 1)
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">ease-exit</p>
            <p className="text-muted-foreground text-xs">
              cubic-bezier(0.4, 0.0, 1, 1)
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="font-medium">ease-standard</p>
            <p className="text-muted-foreground text-xs">
              cubic-bezier(0.4, 0.0, 0.2, 1)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({
  name,
  hex,
  className,
}: {
  name: string;
  hex: string;
  className: string;
}) {
  return (
    <div>
      <div className={`h-24 rounded-lg border border-border ${className}`} />
      <p className="mt-2 font-body text-sm font-medium">{name}</p>
      <p className="font-body text-xs text-muted-foreground">{hex}</p>
    </div>
  );
}
