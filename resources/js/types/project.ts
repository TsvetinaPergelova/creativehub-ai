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
    description: string | null;
    status: string;
    visibility: string;
    cover_asset_id?: number | null;
    assets?: ProjectAsset[];
    asset_count?: number | null;
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
