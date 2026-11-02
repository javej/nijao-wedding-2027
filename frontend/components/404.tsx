import Link from "next/link";

interface NotFoundMessageProps {
  /** Context-specific explanation shown under the "Oops" headline. */
  message?: string;
}

/**
 * The one not-found screen for the whole site — the generic 404 and the
 * unknown-guest-slug 404 share this look and differ only in `message`.
 */
export default function NotFoundMessage({
  message = "We couldn't find the page you're looking for.",
}: NotFoundMessageProps) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <div className="text-center max-w-md">
        <h1 className="font-display font-light text-display-xl leading-display text-raspberry">
          Oops
        </h1>
        <p className="font-body text-base text-foreground/80 mt-4">{message}</p>
        <Link
          href="/"
          className="inline-block mt-8 font-body text-sm tracking-wide uppercase text-raspberry underline underline-offset-4 hover:text-strawberry-jam transition-colors duration-(--duration-rsvp)"
        >
          Go to the main invitation
        </Link>
      </div>
    </div>
  );
}
