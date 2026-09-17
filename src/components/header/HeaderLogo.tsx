import Image from "next/image";
import Link from "next/link";

export default function HeaderLogo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-3"
      aria-label="SPRINT Institutional Hub Home"
    >
      <Image
        src="/images/header&footer/sprintlogo.png"
        alt="SPRINT Institutional Hub Logo"
        width={56}
        height={56}
        priority
        className="h-14 w-auto object-contain"
        style={{ width: "auto" }}
      />
      <p className="text-lg font-bold uppercase tracking-[0.2em] text-brand-red">
        SPRINT 
      </p>
    </Link>
  );
}
