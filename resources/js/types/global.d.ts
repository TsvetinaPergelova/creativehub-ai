import type { Auth } from '@/types/auth';
import type { WorkspaceSharedData } from '@/types/ui';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            workspace: WorkspaceSharedData | null;
            [key: string]: unknown;
        };
    }
}
