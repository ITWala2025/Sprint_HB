import "@/css/global.css";
import "@/css/header.css";
import "@/css/footer.css";
import { Space_Grotesk, Inter } from "next/font/google";
import Header from "@/components/header/Header";
import ConditionalCampusNewsTicker from "@/components/layout/ConditionalCampusNewsTicker";
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
    default: "SPRINT",
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
        <ConditionalCampusNewsTicker />
        <main id="main">{children}</main>
        <Footer />

        <a
          href="https://wa.me/918521283184?text=Hello%20SPRINT%2C%20I%20would%20like%20to%20know%20more%20about%20your%20programs."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="whatsapp-float"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20.52 3.48A11.82 11.82 0 0 0 12.03 0C5.5 0 .14 5.36.14 11.9c0 2.1.55 4.15 1.6 5.96L.02 24l6.3-1.65a11.92 11.92 0 0 0 5.72 1.74h.01c6.53 0 11.9-5.36 11.9-11.9 0-3.18-1.24-6.17-3.43-8.71ZM12.04 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.82 9.82 0 0 1-1.5-5.27c0-5.46 4.44-9.9 9.9-9.9a9.78 9.78 0 0 1 6.97 2.9 9.8 9.8 0 0 1 2.9 6.98c0 5.46-4.44 9.9-9.9 9.9Zm5.44-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.66.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.51-1.8-1.68-2.1-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.52-.07-.15-.66-1.58-.9-2.17-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.79.38-.27.3-1.03 1-1.03 2.44 0 1.44 1.06 2.82 1.2 3.02.15.2 2.06 3.14 4.98 4.44.7.3 1.25.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z" fill="currentColor"/>
          </svg>
        </a>
      </body>
    </html>
  );
}