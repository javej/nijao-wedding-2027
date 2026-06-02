import type { Metadata } from "next";
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
    title: "Spoiler Alert: We're getting married! 💍",
    description:
      "We'd love to tell you exactly when and where, but we spent way too much time coding this custom website for you not to look at it. Click to find out!",
    url: "/",
    type: "website",
    locale: "en_PH",
    siteName: "Jave & Nianne Wedding",
    images: [
      {
        url: "/decorations/proposal-og.jpg",
        width: 1418,
        height: 945,
        alt: "Jave & Nianne — January 8, 2027",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spoiler Alert: We're getting married! 💍",
    description:
      "We'd love to tell you exactly when and where, but we spent way too much time coding this custom website for you not to look at it. Click to find out!",
    images: ["/decorations/proposal-og.jpg"],
  },
  robots: { index: false, follow: false },
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
