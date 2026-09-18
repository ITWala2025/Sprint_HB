import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

/**
 * Type system (Section 9.2):
 * - Space Grotesk for display/headline text — a geometric, slightly
 *   technical sans that suits an engineering/upskilling brand and gives
 *   headlines their own character instead of reusing the body face.
 * - Inter for body copy — neutral, highly legible at small sizes across
 *   devices, which the requirements call out explicitly (Section 9.2/10).
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

// Section 14 — SEO Requirements: unique title + meta description.
export const metadata = {
  title: "SPRINT — Skill Up, Get Ahead | Mentor-Led Training Platform",
  description:
    "SPRINT is a mentor-led training platform for students and professionals — learn from MNC instructors, build real projects, and get placement support.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
