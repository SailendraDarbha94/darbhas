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

export const metadata: Metadata = {
  title: {
    default: "Darbha — a family of writers",
    template: "%s · darbha.info",
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
