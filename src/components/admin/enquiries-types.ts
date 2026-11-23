export const enquiryAudiences = [
    "student",
    "working_professional",
    "institute",
    "company",
] as const;

export type EnquiryAudience = typeof enquiryAudiences[number];
export type EnquiryStatus = "new" | "contacted" | "resolved";

export type Enquiry = {
    id: string;
    audience_type: EnquiryAudience;
    full_name: string;
    email: string;
    phone: string;
    company_name?: string | null;
    current_company?: string | null;
    current_designation?: string | null;
    designation?: string | null;
    role_designation?: string | null;
    domain?: string | null;
    company_domain?: string | null;
    total_experience?: string | null;
    institute_name?: string | null;
    contact_person_name?: string | null;
    website?: string | null;
    website_url?: string | null;
    interested_courses?: string[] | null;
    interested_programs?: string[] | null;
    services?: string[] | null;
    interested_services?: string[] | null;
    purpose_types?: string[] | null;
    purposes?: string[] | null;
    preferred_contact_time?: string | null;
    message?: string | null;
    metadata?: Record<string, unknown> | null;
    status: string;
    created_at: string;
    updated_at?: string | null;
};
