import { unstable_cache } from "next/cache";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import CampusNewsTickerClient, { type CampusUpdate } from "./CampusNewsTickerClient";

type CampusUpdateRow = {
	id: string;
	type: string;
	message: string;
	link_url: string | null;
	priority: number;
};

const getCachedCampusUpdates = unstable_cache(
	async (): Promise<CampusUpdateRow[]> => {
		const supabase = createPublicServerClient();
		if (!supabase) {
			throw new Error("Supabase public server configuration is missing.");
		}

		const { data, error } = await supabase
			.from("announcements")
			.select("id, type, message, link_url, priority")
			.eq("is_active", true)
			.order("priority", { ascending: false });

		if (error) {
			throw new Error(`Supabase announcements query failed: ${error.message}`);
		}

		return (data ?? []) as CampusUpdateRow[];
	},
	["campus-news-ticker"],
	{ revalidate: 3600, tags: ["announcements"] },
);

export default async function CampusNewsTicker() {
	let initialUpdates: CampusUpdate[] = [];

	try {
		const rows = await getCachedCampusUpdates();
		initialUpdates = rows.map(({ id, type, message, link_url }) => ({
			id,
			category: getCategory(type),
			message,
			link_url,
		}));
	} catch (error) {
		console.error("[SPRINT CampusNewsTicker] Failed to fetch announcements:", error);
	}

	return <CampusNewsTickerClient initialUpdates={initialUpdates} />;
}

function getCategory(type: string): CampusUpdate["category"] {
	switch (type.toUpperCase()) {
		case "MAINTENANCE":
			return "MAINTENANCE";
		case "DEADLINE":
			return "DEADLINE";
		case "TIP/ALERT":
			return "TIP/ALERT";
		case "ANNOUNCEMENT":
		case "UPDATES":
		case "HIRING":
		default:
			return "ANNOUNCEMENT";
	}
}
