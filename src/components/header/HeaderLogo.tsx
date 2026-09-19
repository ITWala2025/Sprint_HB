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
        className="size-14 object-contain"
      />
      <div className="flex flex-col gap-0.5">
        <span
          className="text-xl font-black uppercase text-brand-navy"
          style={{ fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif", letterSpacing: "0.32em" }}
        >
          SPRINT
        </span>
        <span className="text-[9px] uppercase font-medium text-brand-text-muted" style={{ letterSpacing: "0.18em" }}>
          Institutional Hub
        </span>
        <div className="mt-0.5 h-0.5 w-8 rounded-full bg-brand-red" />
      </div>
    </Link>
  );
}
