"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import DesktopNavigation from "./DesktopNavigation";
import HeaderActions from "@/components/header/HeaderActions";
import HeaderLogo from "./HeaderLogo";
import MobileNavigation from "@/components/header/MobileNavigation";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentInitials, setStudentInitials] = useState<string | null>(null);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ) {
      return;
    }

    const supabase = createClient();
    let isMounted = true;

    async function updateAdminStatus(userId?: string) {
      if (!userId) {
        if (isMounted) {
          setIsAdmin(false);
          setStudentInitials(null);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[SPRINT Header] Failed to resolve user role:", error);
      }

      if (isMounted) {
        setIsAdmin(profile?.role === "admin");
        if (profile?.role === "student" && profile?.full_name) {
          const parts = profile.full_name.trim().split(/\s+/);
          const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
          setStudentInitials(initials.toUpperCase() || null);
        } else {
          setStudentInitials(null);
        }
      }
    }

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => updateAdminStatus(user?.id));
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateAdminStatus(session?.user.id);
      },
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 20);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <>
      <header
        className={`sprint-site-header sticky top-0 z-50 w-full ${isScrolled ? "is-scrolled" : ""}`}
      >
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <HeaderLogo />
          <DesktopNavigation pathname={pathname} />
          <HeaderActions
            isAdmin={isAdmin}
            studentInitials={studentInitials}
            accessibleBrandRed={pathname === "/home"}
          />
          <MobileNavigation
            pathname={pathname}
            isOpen={isMobileMenuOpen}
            setIsOpen={setIsMobileMenuOpen}
            isAdmin={isAdmin}
            accessibleBrandRed={pathname === "/home"}
          />
        </div>
      </header>
    </>
  );
}
