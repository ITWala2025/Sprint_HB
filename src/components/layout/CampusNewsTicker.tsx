"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, Bell, Clock3, Eye, Lightbulb, Megaphone, Wrench, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * A single announcement in the ticker.
 */
type CampusUpdate = {
	id: string;
	category: "ANNOUNCEMENT" | "MAINTENANCE" | "DEADLINE" | "TIP/ALERT";
	message: string;
	link_url?: string | null;
};

const fallbackUpdates: CampusUpdate[] = [
	{
		id: "cohort-enrollment",
		category: "ANNOUNCEMENT",
		message: "AI/ML and Cloud cohort enrollment closes this Friday at 5 PM.",
	},
	{
		id: "portal-maintenance",
		category: "MAINTENANCE",
		message: "Student portal maintenance is scheduled Sunday from 2 AM to 4 AM IST.",
	},
	{
		id: "project-deadline",
		category: "DEADLINE",
		message: "Midterm project submissions for all modules are due Monday at midnight.",
	},
	{
		id: "library-update",
		category: "TIP/ALERT",
		message: "Library hours are extended to 9 PM during project review week.",
	},
];

const categoryStyles = {
	ANNOUNCEMENT: {
		icon: Bell,
		className: "bg-sky-500/15 text-sky-200 ring-sky-300/25",
	},
	MAINTENANCE: {
		icon: Wrench,
		className: "bg-violet-500/15 text-violet-200 ring-violet-300/25",
	},
	DEADLINE: {
		icon: Clock3,
		className: "bg-brand-red/15 text-red-200 ring-brand-red/30",
	},
	"TIP/ALERT": {
		icon: Lightbulb,
		className: "bg-emerald-500/15 text-emerald-200 ring-emerald-300/25",
	},
} as const;

function getCategory(type: string): CampusUpdate["category"] {
	switch (type) {
		case "MAINTENANCE":
		case "DEADLINE":
		case "TIP/ALERT":
			return type;
		case "ANNOUNCEMENT":
		default:
			return "ANNOUNCEMENT";
	}
}

function getUpdateLink(href: string) {
	const value = href.trim();
	if (!value) return null;

	if (value.startsWith("/") && !value.startsWith("//")) {
		return { href: value, external: false };
	}

	try {
		const parsed = new URL(value);
		if (parsed.protocol === "http:" || parsed.protocol === "https:") {
			return { href: parsed.href, external: true };
		}
	} catch {
		return null;
	}

	return null;
}

function isPosterLink(href: string): boolean {
	if (href.startsWith("/images/")) return true;

	try {
		const pathname = new URL(href, "https://sprint.invalid").pathname;
		return pathname.includes("/storage/v1/object/public/announcement-assets/")
			|| /\.(?:png|jpe?g|webp|svg)$/i.test(pathname);
	} catch {
		return false;
	}
}

function UpdateSet({
	updates,
	onOpenImage,
	hidden = false,
}: {
	updates: CampusUpdate[];
	onOpenImage: (src: string) => void;
	hidden?: boolean;
}) {
	return (
		<div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
			{updates.map((item) => {
				const { icon: Icon, className } = categoryStyles[item.category];
				const link = item.link_url ? getUpdateLink(item.link_url) : null;
				const isPoster = Boolean(link && isPosterLink(link.href));
				const linkedContent = (
					<>
						<span
							className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] ring-1 ${className}`}
						>
							<Icon className="size-3" aria-hidden="true" />
							{item.category}
						</span>
						<span className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-2.5 py-0.5 text-xs font-medium leading-relaxed text-slate-100 transition-all duration-200 hover:border-red-500/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_12px_rgba(239,62,67,0.22)] active:scale-[0.98]">
							{item.message}
							{isPoster ? (
								<Eye className="size-3.5 shrink-0" aria-hidden="true" />
							) : (
								<ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
							)}
						</span>
					</>
				);
				const plainContent = (
					<>
						<span
							className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] ring-1 ${className}`}
						>
							<Icon className="size-3" aria-hidden="true" />
							{item.category}
						</span>
						<span className="whitespace-nowrap text-xs leading-relaxed text-slate-200">{item.message}</span>
					</>
				);
				const duplicateProps = hidden ? { tabIndex: -1 as const } : {};

				return (
					<article
						key={item.id}
						className={`flex shrink-0 items-center gap-3 border-r border-white/10 px-5 first:pl-0 last:border-r-0 ${link ? "cursor-pointer" : "cursor-default"}`}
						title={`${item.category}: ${item.message}`}
					>
						{!item.link_url ? (
							<span className="inline-flex items-center gap-3">{plainContent}</span>
						) : link && isPoster ? (
							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									onOpenImage(item.link_url!);
								}}
								{...duplicateProps}
								aria-label={`View announcement poster: ${item.message}`}
								className="inline-flex items-center gap-1.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
							>
								{linkedContent}
							</button>
						) : link?.external ? (
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								{...duplicateProps}
								className="inline-flex items-center gap-1.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
							>
								{linkedContent}
							</a>
						) : link ? (
							<Link
								href={link.href}
								{...duplicateProps}
								className="inline-flex items-center gap-1.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
							>
								{linkedContent}
							</Link>
						) : (
							<span className="inline-flex items-center gap-3 cursor-default">{plainContent}</span>
						)}
					</article>
				);
			})}
		</div>
	);
}

export default function CampusNewsTicker() {
	const [updates, setUpdates] = useState(fallbackUpdates);
	const [activeImageModal, setActiveImageModal] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!activeImageModal) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setActiveImageModal(null);
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", closeOnEscape);
		};
	}, [activeImageModal]);

	useEffect(() => {
		let isMounted = true;

		async function fetchAnnouncements() {
			try {
				const supabase = createClient();
				const { data, error } = await supabase
					.from("announcements")
					.select("id, type, message, link_url")
					.eq("is_active", true)
					.order("priority", { ascending: false });

				if (error) {
					console.error(
						"[SPRINT CampusNewsTicker] Failed to fetch announcements:",
						error,
					);
					if (isMounted) setUpdates(fallbackUpdates);
					return;
				}

				if (isMounted) {
					setUpdates(
						data?.length
							? data.map(({ id, type, message, link_url }) => ({
									id,
									category: getCategory(type),
									message,
									link_url,
								}))
							: fallbackUpdates,
					);
				}
			} catch (error) {
				console.error(
					"[SPRINT CampusNewsTicker] Failed to fetch announcements:",
					error,
				);
				if (isMounted) setUpdates(fallbackUpdates);
			}
		}

		void fetchAnnouncements();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<section
			className="group relative z-10 overflow-hidden border-b border-brand-navy-light bg-[linear-gradient(90deg,#163f68_0%,var(--color-brand-navy-dark)_50%,#163f68_100%)] shadow-[0_8px_20px_-18px_rgba(1,31,62,0.8)]"
			aria-label="SPRINT campus news and updates"
		>
			<div className="mx-auto flex min-h-12 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
				<div className="hidden shrink-0 items-center gap-2 border-r border-white/10 pr-5 sm:flex">
					<span className="grid size-8 place-items-center rounded-full bg-brand-blue/15 text-brand-blue-light ring-1 ring-brand-blue/30">
						<Megaphone className="size-4" aria-hidden="true" />
					</span>
					<div>
						<p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-red-200">
							Updates
						</p>
						{/*<p className="whitespace-nowrap text-xs text-slate-400">
							Stay in the loop
						</p> */}
					</div>
				</div>

				<div className="marquee-track min-w-0 flex-1 overflow-hidden py-1">
					<div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] hover:[animation-play-state:paused]">
						<UpdateSet updates={updates} onOpenImage={setActiveImageModal} />
						<UpdateSet updates={updates} onOpenImage={setActiveImageModal} hidden />
					</div>
				</div>
			</div>
			{mounted && activeImageModal && createPortal(
				<div
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200 sm:p-6"
					role="presentation"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) setActiveImageModal(null);
					}}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-label="Announcement Poster"
						className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-2xl"
					>
						<button
							type="button"
							onClick={() => setActiveImageModal(null)}
							aria-label="Close poster preview"
							className="absolute right-4 top-4 z-10 rounded-full border border-slate-700/60 bg-slate-800/80 p-2 text-white backdrop-blur transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
						>
							<X className="size-5" aria-hidden="true" />
						</button>
						<img
							src={activeImageModal}
							alt="Announcement Poster"
							className="h-auto max-h-[82vh] w-full select-none rounded-xl object-contain"
						/>
					</div>
				</div>,
				document.body,
			)}
		</section>
	);
}
