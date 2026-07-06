import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
