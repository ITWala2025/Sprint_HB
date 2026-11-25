export type StudentSessionPayload = {
    userId: string;
    email: string | null;
    fullName: string | null;
    registrationNumber: string | null;
    isActive: boolean;
    onboardingCompleted: boolean;
    exp: number; // Unix timestamp (ms)
};