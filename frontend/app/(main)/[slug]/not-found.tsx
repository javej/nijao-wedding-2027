import Link from "next/link";

export default function GuestNotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <div className="text-center max-w-md">
        <p className="font-display font-light text-display-xl leading-display text-raspberry">
          Oops
        </p>
        <p className="font-body text-base text-foreground/80 mt-4">
          We couldn&apos;t find the page you&apos;re looking for. If you
          received a personalized link, please double-check the URL.
        </p>
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
