"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import DesktopNavigation from "./DesktopNavigation";
import HeaderActions from "@/components/header/HeaderActions";
import HeaderLogo from "./HeaderLogo";
import MobileNavigation from "@/components/header/MobileNavigation";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 20);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className={`sprint-site-header sticky top-0 z-50 w-full covers-watermark ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <HeaderLogo />
        <DesktopNavigation pathname={pathname} />
        <HeaderActions />
        <MobileNavigation
          pathname={pathname}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
        />
      </div>
    </header>
  );
}
