"use client";

type TablePaginationProps = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
};

type PageItem = number | "ellipsis";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages]);
    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
        pages.add(page);
    }
    if (currentPage <= 2) pages.add(3);
    if (currentPage >= totalPages - 1) pages.add(totalPages - 2);

    const orderedPages = [...pages].sort((left, right) => left - right);
    const items: PageItem[] = [];

    orderedPages.forEach((page, index) => {
        if (index > 0) {
            const gap = page - orderedPages[index - 1];
            if (gap === 2) items.push(orderedPages[index - 1] + 1);
            if (gap > 2) items.push("ellipsis");
        }
        items.push(page);
    });

    return items;
}

export default function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize = 15,
    onPageChange,
}: TablePaginationProps) {
    const pageCount = Math.max(1, totalPages);
    const page = Math.min(Math.max(currentPage, 1), pageCount);
    const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="min-w-0 max-w-full px-4 py-4 sm:px-6">
            <p className="mb-3 text-xs text-brand-text-muted" aria-live="polite">
                Showing {firstItem}–{lastItem} of {totalItems} results
            </p>
            {totalItems > pageSize && (
                <nav
                    className="flex min-w-0 max-w-full flex-wrap items-center justify-between gap-x-2 border-t-2 border-slate-900"
                    aria-label="Table pagination"
                >
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="sprint-focus order-1 shrink-0 py-3 text-[11px] font-bold tracking-wide text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ← PREVIOUS
                    </button>
                    <div className="order-3 flex w-full min-w-0 items-center justify-center sm:order-none sm:w-auto">
                        {getPageItems(page, pageCount).map((item, index) =>
                            item === "ellipsis" ? (
                                <span key={`ellipsis-${index}`} className="px-1 text-sm text-brand-text-muted" aria-hidden="true">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    aria-current={page === item ? "page" : undefined}
                                    aria-label={`Page ${item}`}
                                    onClick={() => onPageChange(item)}
                                    className={`sprint-focus relative min-w-9 px-2 py-3 text-sm font-semibold ${
                                        page === item ? "text-brand-navy" : "text-brand-text-muted hover:text-brand-navy"
                                    }`}
                                >
                                    {page === item && (
                                        <span className="absolute inset-x-0 -top-[2px] h-[3px] bg-emerald-600" aria-hidden="true" />
                                    )}
                                    {item}
                                </button>
                            ),
                        )}
                    </div>
                    <button
                        type="button"
                        disabled={page === pageCount}
                        onClick={() => onPageChange(page + 1)}
                        className="sprint-focus order-2 shrink-0 py-3 text-[11px] font-bold tracking-wide text-brand-navy disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        NEXT →
                    </button>
                </nav>
            )}
        </div>
    );
}
