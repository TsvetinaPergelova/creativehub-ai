import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type WorkspaceProjectSearchItem = {
    id: number;
    name: string;
    slug: string;
    category: string;
    status: string;
    updated_at: string | null;
    pending_assets_count: number;
};

export type WorkspaceSharedData = {
    portfolio_url: string;
    project_search: WorkspaceProjectSearchItem[];
    status: {
        draft_count: number;
        in_review_count: number;
    };
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};
