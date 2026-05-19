export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    specialization?: string | null;
    location?: string | null;
    bio?: string | null;
    website_url?: string | null;
    instagram_url?: string | null;
    contact_email?: string | null;
    profile_cover_style?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
