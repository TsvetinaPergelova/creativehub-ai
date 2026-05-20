export type ProjectAsset = {
    id: number;
    filename: string;
    title: string | null;
    path: string;
    url: string;
    mime_type: string;
    size: number;
    width: number | null;
    height: number | null;
    sort_order: number;
    is_cover?: boolean;
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
    mode?: string;
    description: string | null;
    status: string;
    visibility: string;
    creator_id?: number | null;
    cover_asset_id?: number | null;
    has_explicit_cover?: boolean;
    assets?: ProjectAsset[];
    asset_count?: number | null;
    cover_image_url?: string | null;
    public_url?: string | null;
    creator_name?: string | null;
    creator_profile_url?: string | null;
    is_saved_by_auth_user?: boolean;
    created_at?: string | null;
    published_at?: string | null;
};

export type ProjectSharePanel = {
    visibility: string;
    public_url: string | null;
    client_url: string | null;
    client_review?: {
        reviewer_name: string | null;
        reviewer_comment: string | null;
        approved_at: string | null;
        favorites_count: number;
    } | null;
};

export type ProjectProcessing = {
    is_reviewing: boolean;
    headline: string;
    description: string;
    expectation: string;
    current_asset_label: string | null;
    pending_asset_labels: string[];
    reviewed_count: number;
    pending_count: number;
    total_count: number;
    coverage_percent: number;
};
