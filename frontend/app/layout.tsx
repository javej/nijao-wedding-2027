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
    title: "Jave & Nianne — January 8, 2027",
    description:
      "Ten years. One more day. Join us as we celebrate our wedding at Casa 10 22, Lipa, Batangas.",
    type: "website",
    locale: "en_PH",
    siteName: "Jave & Nianne Wedding",
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
      <link rel="icon" href="/favicon.ico" />
      <body
        className="min-h-screen bg-background font-body antialiased overscroll-none"
      >
          {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
