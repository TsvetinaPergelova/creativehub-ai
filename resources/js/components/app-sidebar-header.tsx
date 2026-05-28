import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Plus } from 'lucide-react';
import { create, edit, index as projects, show } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { WorkspaceQuickSwitcher } from '@/components/workspace-quick-switcher';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as explore } from '@/routes/explore';
import type { BreadcrumbItem as BreadcrumbItemType, WorkspaceSharedData } from '@/types';

type PageProject = {
    id: number;
    name: string;
    status?: string;
    visibility?: string;
};

type PageProcessing = {
    is_reviewing?: boolean;
};

type ContextAction =
    | {
          label: string;
          kind: 'link';
          href: Parameters<typeof Link>[0]['href'];
      }
    | {
          label: string;
          kind: 'anchor';
          href: string;
      };

type WorkspaceContext = {
    eyebrow: string;
    title: string;
    description: string;
    badges?: string[];
    actions: ContextAction[];
};

function ContextActionLink({ action }: { action: ContextAction }) {
    const sharedClassName = cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'rounded-full border-white/10 bg-background/60 hover:border-primary/25 hover:bg-background/80',
    );

    if (action.kind === 'anchor') {
        return (
            <a href={action.href} className={sharedClassName}>
                {action.label}
            </a>
        );
    }

    return (
        <Link href={action.href} className={sharedClassName} prefetch>
            {action.label}
        </Link>
    );
}

function resolveWorkspaceContext(
    component: string,
    project: PageProject | undefined,
    processing: PageProcessing | undefined,
): WorkspaceContext | null {
    switch (component) {
        case 'dashboard':
            return {
                eyebrow: 'Workspace',
                title: 'Command center',
                description:
                    'Keep momentum with the next best action, your strongest drafts, and Curator guidance.',
                actions: [{ label: 'Open projects', kind: 'link', href: projects() }],
            };
        case 'projects/index':
            return {
                eyebrow: 'Library',
                title: 'Project overview',
                description:
                    'Browse every collection, create a new one quickly, and keep your portfolio workspace tidy.',
                actions: [],
            };
        case 'projects/create':
            return {
                eyebrow: project ? 'Editing' : 'New setup',
                title: project ? 'Refine this project setup' : 'Shape a new project',
                description:
                    'Set the category, workflow mode, and framing before you start curating the visual set.',
                actions: project
                    ? [
                          { label: 'Open project', kind: 'link', href: show(project.id) },
                          { label: 'View projects', kind: 'link', href: projects() },
                      ]
                    : [
                          { label: 'View projects', kind: 'link', href: projects() },
                          { label: 'Open dashboard', kind: 'link', href: dashboard() },
                      ],
            };
        case 'projects/show':
            if (!project) {
                return null;
            }

            return {
                eyebrow: 'Project workspace',
                title: project.name,
                description:
                    'Upload, review, share, and refine this project from one focused workspace.',
                badges: [
                    project.status ?? 'draft',
                    project.visibility ?? 'private',
                    processing?.is_reviewing ? 'Curator reviewing' : 'Ready for the next step',
                ],
                actions: [
                    { label: 'Upload images', kind: 'anchor', href: '#project-upload' },
                    { label: 'Share project', kind: 'anchor', href: '#share-project' },
                    { label: 'Edit project', kind: 'link', href: edit(project.id) },
                ],
            };
        default:
            return null;
    }
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage<{
        project?: PageProject;
        processing?: PageProcessing;
        workspace: WorkspaceSharedData | null;
    }>();
    const workspaceContext = resolveWorkspaceContext(
        page.component,
        page.props.project,
        page.props.processing,
    );
    const workspace = page.props.workspace;
    const currentProjectId = page.props.project?.id;

    return (
        <header className="sticky top-0 z-20 border-b border-sidebar-border/60 bg-background/92 backdrop-blur-xl">
            <div className="px-4 py-3 md:px-5">
                <div className="flex items-center justify-between gap-3 lg:hidden">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 h-8 w-8 rounded-full border border-white/10 bg-background/60" />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Link
                            href={create()}
                            className={cn(
                                buttonVariants({ size: 'sm' }),
                                'rounded-full px-4',
                            )}
                            prefetch
                        >
                            <Plus className="size-4" />
                            New project
                        </Link>
                        <Link
                            href={dashboard()}
                            className={cn(
                                buttonVariants({ variant: 'outline', size: 'sm' }),
                                'rounded-full border-white/10 bg-background/60 hover:border-primary/25 hover:bg-background/80',
                            )}
                            prefetch
                        >
                            <LayoutGrid className="size-4" />
                            Workspace
                        </Link>
                    </div>
                </div>

                <div className="hidden items-center gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,38rem)_minmax(0,1fr)]">
                    <div className="min-w-0 overflow-hidden">
                        <div className="flex min-w-0 items-center gap-2">
                            <SidebarTrigger className="-ml-1 h-8 w-8 rounded-full border border-white/10 bg-background/60" />
                            <div className="min-w-0 overflow-hidden">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full justify-self-center">
                        {workspace ? (
                            <WorkspaceQuickSwitcher
                                projects={workspace.project_search}
                                currentProjectId={currentProjectId}
                            />
                        ) : null}
                    </div>

                    <div className="flex items-center justify-self-end gap-2">
                        <Link
                            href={create()}
                            className={cn(
                                buttonVariants({ size: 'sm' }),
                                'rounded-full px-4',
                            )}
                            prefetch
                        >
                            <Plus className="size-4" />
                            New project
                        </Link>
                        <Link
                            href={dashboard()}
                            className={cn(
                                buttonVariants({ variant: 'outline', size: 'sm' }),
                                'rounded-full border-white/10 bg-background/60 hover:border-primary/25 hover:bg-background/80',
                            )}
                            prefetch
                        >
                            <LayoutGrid className="size-4" />
                            Workspace
                        </Link>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/6 px-4 py-2 lg:hidden">
                <div className="flex flex-col gap-2">
                    {workspace ? (
                        <WorkspaceQuickSwitcher
                            projects={workspace.project_search}
                            currentProjectId={currentProjectId}
                        />
                    ) : null}
                </div>
            </div>

            {workspaceContext ? (
                <div className="border-t border-white/6 px-4 py-3 md:px-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                                    {workspaceContext.eyebrow}
                                </p>
                                {workspaceContext.badges?.map((badge) => (
                                    <Badge
                                        key={badge}
                                        variant="outline"
                                        className="border-white/10 bg-background/60 capitalize"
                                    >
                                        {badge}
                                    </Badge>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold tracking-tight">
                                    {workspaceContext.title}
                                </p>
                                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                    {workspaceContext.description}
                                </p>
                            </div>
                        </div>

                        {workspaceContext.actions.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                                {workspaceContext.actions.map((action) => (
                                    <ContextActionLink
                                        key={`${action.kind}:${action.label}`}
                                        action={action}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </header>
    );
}
