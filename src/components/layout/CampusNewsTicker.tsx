"use client";

import { AlertTriangle, Bell, Clock3, Lightbulb, Wrench } from "lucide-react";

/**
 * A single announcement in the ticker.
 *
 * This local array is intentionally easy to replace with a CMS, API route,
 * or database query later. The component only needs the same three fields.
 */
type CampusUpdate = {
	id: string;
	category: "ANNOUNCEMENT" | "MAINTENANCE" | "DEADLINE" | "TIP/ALERT";
	message: string;
};

const campusUpdates: CampusUpdate[] = [
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

function UpdateItem({ update }: { update: CampusUpdate }) {
	const { icon: Icon, className } = categoryStyles[update.category];

	return (
		<article
			className="flex max-w-104 shrink-0 items-center gap-3 border-r border-white/10 px-5 first:pl-0 last:border-r-0"
			title={`${update.category}: ${update.message}`}
		>
			<span
				className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] ring-1 ${className}`}
			>
				<Icon className="size-3" aria-hidden="true" />
				{update.category}
			</span>
			<p className="max-w-76 text-xs leading-relaxed text-slate-200">
				{update.message}
			</p>
		</article>
	);
}

function UpdateSet({ hidden = false }: { hidden?: boolean }) {
	return (
		<div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
			{campusUpdates.map((update) => (
				<UpdateItem key={update.id} update={update} />
			))}
		</div>
	);
}

export default function CampusNewsTicker() {
  return (
    <section
      className="relative z-10 overflow-hidden border-b border-brand-navy-light bg-brand-navy-dark shadow-[0_8px_20px_-18px_rgba(1,31,62,0.8)] covers-watermark"
      aria-label="SPRINT campus news and updates"
    >
			<div className="mx-auto flex min-h-12 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
				<div className="hidden shrink-0 items-center gap-2 border-r border-white/10 pr-5 sm:flex">
					<span className="grid size-8 place-items-center rounded-full bg-brand-red text-white">
						<AlertTriangle className="size-4" aria-hidden="true" />
					</span>
					<div>
						<p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-red-200">
							Campus updates
						</p>
						<p className="whitespace-nowrap text-xs text-slate-400">
							Stay in the loop
						</p>
					</div>
				</div>

				<div className="marquee-track min-w-0 flex-1 overflow-hidden py-1">
					<div className="flex w-max animate-marquee">
						<UpdateSet />
						<UpdateSet hidden />
					</div>
				</div>
			</div>
		</section>
	);
}
