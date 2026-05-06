export type Project = {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string | null;
    status: string;
    visibility: string;
    created_at?: string | null;
    published_at?: string | null;
};
