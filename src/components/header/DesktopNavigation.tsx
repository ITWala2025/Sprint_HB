import Link from "next/link";

interface DesktopNavigationProps {
  pathname: string;
}

const navigation = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function DesktopNavigation({ pathname }: DesktopNavigationProps) {
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Main navigation"
         className="hidden shrink-0 items-center gap-2 rounded-full border border-brand-border bg-white px-2 py-1.5 shadow-sm lg:flex"
    >
      {navigation.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`block shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-navy text-white"
                : "text-brand-navy hover:bg-brand-surface"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
