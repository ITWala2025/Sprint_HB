export type TableDateFilter = "all" | "today" | "last7" | "last30" | "custom";

function localDate(value: string): Date | null {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatSearchableDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const localIsoDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
    return `${date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })} ${localIsoDate} ${date.toISOString().slice(0, 10)}`.toLowerCase();
}

export function matchesTableDateFilter(
    value: string,
    filter: TableDateFilter,
    fromDate = "",
    toDate = "",
): boolean {
    if (filter === "all" || (filter === "custom" && !fromDate && !toDate)) return true;

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return false;
    const date = startOfDay(parsedDate);

    if (filter === "today") return date.getTime() === startOfDay(new Date()).getTime();

    if (filter === "last7" || filter === "last30") {
        const start = startOfDay(new Date());
        start.setDate(start.getDate() - (filter === "last7" ? 6 : 29));
        return date >= start && date <= startOfDay(new Date());
    }

    const start = fromDate ? localDate(fromDate) : null;
    const end = toDate ? localDate(toDate) : null;
    return (!start || date >= start) && (!end || date <= end);
}
