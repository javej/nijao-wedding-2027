import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: {
    template: "%s | Jave & Nianne",
    default: "Jave & Nianne — January 8, 2027",
  },
  description:
    "Ten years. One more day. Join us as we celebrate our wedding at Casa 10 22, Lipa, Batangas.",
  openGraph: {
    title: "Dearest Gentle Reader, ✨",
    description:
      "A decade of courtship leads to a wedding. Tap to uncover the details.",
    url: "/",
    type: "website",
    locale: "en_PH",
    siteName: "Jave & Nianne Wedding",
    images: [
      {
        url: "/decorations/preview-og.jpg",
        width: 1200,
        height: 630,
        alt: "Jave & Nianne — January 8, 2027",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dearest Gentle Reader, ✨",
    description:
      "A decade of courtship leads to a wedding. Tap to uncover the details.",
    images: ["/decorations/preview-og.jpg"],
  },
  robots: { index: false, follow: false },
};

// viewport-fit: cover makes env(safe-area-inset-*) resolve to real values on
// notched / gesture-bar devices, so the fixed FAB, audio toggle, and lightbox
// can pad themselves clear of the home indicator and notch.
export const viewport: Viewport = {
  viewportFit: "cover",
};

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(cormorantGaramond.variable, dmSans.variable)}>
      <link rel="icon" type="image/svg+xml" href="/gem.svg" />
      <body
        className="h-dvh bg-background font-body antialiased overscroll-none"
      >
          {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
