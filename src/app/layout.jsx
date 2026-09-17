import "@/css/global.css";
import "@/css/header.css";
import "@/css/footer.css";
import "@/css/about.css";
import { Space_Grotesk, Inter } from "next/font/google";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

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
export const metadata = {
  metadataBase: new URL("https://sprint.institute"),
  title: {
    default: "SPRINT | Institutional Training Hub",
    template: "%s | SPRINT",
  },
  description:
    "SPRINT is a job-ready training hub in Hazaribagh, Jharkhand, bridging the academic-industry gap with hands-on programs in AI/ML, Cloud and DevOps.",
  openGraph: {
    siteName: "SPRINT",
    locale: "en_IN",
    type: "website",
  },
};

/**
 * Root layout (App Router). Renders the global <Header/> and <Footer/>
 * on every route so the About page and all future pages stay consistent.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} bg-white text-brand-text antialiased`}>
        {/* Skip link — first item in tab order (GL-08, GL-09) */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-brand-navy focus:px-5 focus:py-2.5 focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}