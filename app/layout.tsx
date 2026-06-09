import type { Metadata } from "next";
import { Merriweather, Lato } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "KSDC Webinar Series 2026 - Medico-Legal Challenges in Dentistry",
  description: "Register for the KSDC webinar series on medico-legal challenges in modern dentistry. Expert speakers Dr. Kedarnath N.S. and Dr. Usha Murali.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-lato">{children}</body>
    </html>
  );
}
