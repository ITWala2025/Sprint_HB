import StaffLoginForm from "@/app/staff/login/StaffLoginForm";

type StaffLoginPageProps = {
    searchParams: Promise<{
        email?: string | string[];
        invitation?: string | string[];
    }>;
};

export default async function StaffLoginPage({ searchParams }: StaffLoginPageProps) {
    const query = await searchParams;
    const initialEmail = typeof query.email === "string" ? query.email : "";
    const invitationToken = typeof query.invitation === "string" ? query.invitation : undefined;

    return <StaffLoginForm initialEmail={initialEmail} invitationToken={invitationToken} />;
}
