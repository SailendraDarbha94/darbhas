import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Serif_Telugu } from "next/font/google";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz", "SOFT", "WONK"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const telugu = Noto_Serif_Telugu({
  subsets: ["telugu"],
  variable: "--font-telugu",
});

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE_DOMAIN}`),
  title: {
    default: "Darbha — a legacy of writers, travellers & narrators",
    template: `%s · ${SITE_DOMAIN}`,
  },
  description:
    "The Darbha family writes: poetry, plays, travel essays. One surname, many voices, each with their own corner of the internet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${telugu.variable}`}>
      <body>{children}</body>
    </html>
  );
}
