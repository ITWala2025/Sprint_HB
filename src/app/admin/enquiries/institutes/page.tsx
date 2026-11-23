import EnquiriesCategoryView from "@/components/admin/EnquiriesCategoryView";
import { getEnquiries } from "@/app/admin/enquiries/actions";

export default async function InstituteEnquiriesPage() {
    const enquiries = await getEnquiries("institute");

    return (
        <div className="mx-auto w-full max-w-[1500px] min-w-0 space-y-6">
            <header className="border-b border-slate-200 pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-red">Admissions & enquiries</p>
                <h1 className="mt-2 font-display text-3xl font-bold text-brand-navy">Partner Institute Enquiries</h1>
                <p className="mt-2 text-sm text-brand-text-secondary">Review institute partnership needs and requested services.</p>
            </header>
            <section className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <EnquiriesCategoryView enquiries={enquiries} category="institute" />
            </section>
        </div>
    );
}
