import Link from "next/link";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";

type InvitationPageProps = {
    params: Promise<{ token: string }>;
};

export default async function StaffInvitationPage({ params }: InvitationPageProps) {
    const { token } = await params;
    const serviceClient = createServiceClient();

    if (!serviceClient) {
        return <InvitationMessage message="Staff invitations are temporarily unavailable. Please contact your administrator." />;
    }

    const { data: invitation, error } = await serviceClient
        .from("staff_invitations")
        .select("email, status, expires_at")
        .eq("token", token)
        .maybeSingle();

    if (error) {
        return <InvitationMessage message="We could not verify this invitation link. Please contact your administrator." />;
    }
    if (!invitation) {
        return <InvitationMessage message="Invalid invitation link. Please contact your administrator." />;
    }
    if (invitation.status === "used") {
        return (
            <InvitationMessage message="This invitation link has already been used. Please sign in via the Staff Portal login page.">
                <Link className="mt-5 inline-flex rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-bold text-white" href="/staff/login">
                    Staff Portal Login
                </Link>
            </InvitationMessage>
        );
    }
    if (invitation.status === "expired" || new Date(invitation.expires_at).getTime() < Date.now()) {
        return <InvitationMessage message="This invitation link has expired (1-hour validity window). Please contact your administrator to request a new invitation." />;
    }
    if (invitation.status !== "pending") {
        return <InvitationMessage message="Invalid invitation link. Please contact your administrator." />;
    }

    redirect(`/staff/login?invitation=${encodeURIComponent(token)}&email=${encodeURIComponent(invitation.email)}`);
}

function InvitationMessage({
    message,
    children,
}: {
    message: string;
    children?: React.ReactNode;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-brand-off-white px-4 py-12">
            <section className="w-full max-w-lg rounded-2xl border border-brand-border bg-white p-8 text-center shadow-xl" aria-labelledby="invitation-message-title">
                <h1 id="invitation-message-title" className="font-display text-2xl font-bold text-brand-navy">Staff Invitation</h1>
                <p className="mt-3 text-sm leading-6 text-brand-text-secondary" role="status">{message}</p>
                {children}
            </section>
        </main>
    );
}
