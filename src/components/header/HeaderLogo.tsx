import Image from "next/image";
import Link from "next/link";

export default function HeaderLogo() {
  return (
    <Link
      href="/home"
      className="flex min-w-0 shrink items-center gap-2 sm:gap-3"
      aria-label="SPRINT Institutional Hub Home"
    >
      <Image
        src="/images/header&footer/sprintlogo.png"
        alt="SPRINT Institutional Hub Logo"
        width={56}
        height={56}
        priority
        className="size-10 shrink-0 object-contain sm:size-14"
      />
      <div className="flex flex-col gap-0.5">
        <span
          className="whitespace-nowrap font-display text-base font-black uppercase text-brand-navy sm:text-xl"
          style={{ letterSpacing: "0.15em", color: "red" }}
        >
          SPRINT
        </span>
        {/* <span className="text-[9px] uppercase font-medium text-brand-text-muted" style={{ letterSpacing: "0.18em" }}>
          Institutional Hub
        </span> */}
        <div className="mt-0.5 h-0.5 w-8 rounded-full bg-brand-red" />
      </div>
    </Link>
  );
}
