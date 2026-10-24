import type { Metadata, Viewport } from "next";
import { Oxygen } from "next/font/google";
import CookieConsent from "@/components/consent/CookieConsent";
import "./globals.css";

// Oxygen is what the Teuteuf daily games (GeoGrid, Worldle) set their interface in.
const ui = Oxygen({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const description =
  "A daily guessing game for Path of Exile 2 skill gems. Use the clues from each guess to find today's skill.";

export const metadata: Metadata = {
  title: {
    default: "PoE2dle — Daily Path of Exile 2 Skill Gem Guessing Game",
    template: "%s · PoE2dle",
  },
  description,
  openGraph: {
    title: "PoE2dle — Daily Path of Exile 2 Skill Gem Guessing Game",
    description,
    type: "website",
    siteName: "PoE2dle",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ui.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
