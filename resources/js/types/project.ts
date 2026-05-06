export type ProjectAsset = {
    id: number;
    filename: string;
    path: string;
    url: string;
    mime_type: string;
    size: number;
    width: number | null;
    height: number | null;
    sort_order: number;
    analysis?: ProjectAssetAnalysis | null;
};

export type ProjectAssetAnalysis = {
    tags: string[];
    alt_text: string | null;
    composition_score: number | null;
    focus_score: number | null;
    lighting_score: number | null;
    critique: string | null;
    mood: string | null;
    is_highlight: boolean;
    is_near_duplicate: boolean;
};

export type Project = {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    status: string;
    visibility: string;
    assets?: ProjectAsset[];
    cover_image_url?: string | null;
    public_url?: string | null;
    creator_name?: string | null;
    creator_profile_url?: string | null;
    created_at?: string | null;
    published_at?: string | null;
};

export type ProjectSharePanel = {
    visibility: string;
    public_url: string | null;
    client_url: string | null;
};
