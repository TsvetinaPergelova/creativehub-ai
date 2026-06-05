import { Head, usePage } from '@inertiajs/react';
import {
    CircleDot,
    Eye,
    LayoutGrid,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import ProjectCard from '@/components/projects/project-card';
import {
    ProjectInsetPanel,
    ProjectSection,
    ProjectSectionHeader,
} from '@/components/projects/project-ui';
import PublicProfileActions from '@/components/public/public-profile-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    normalizeProjectMode,
    type ProjectModeValue,
} from '@/lib/project-mode';
import type { Project } from '@/types';

type SortOption = 'latest' | 'oldest' | 'name' | 'assets';
type StatusFilter = 'all' | 'draft' | 'published';
type VisibilityFilter = 'all' | 'private' | 'client' | 'public';
type ModeFilter = 'all' | ProjectModeValue;

function isNeedsAttention(project: Project): boolean {
    const assetCount = project.asset_count ?? project.assets?.length ?? 0;

    return (
        project.status === 'draft' &&
        (assetCount === 0 || !project.cover_image_url || !project.description)
    );
}

function projectCreatedAt(project: Project): number {
    return project.created_at ? new Date(project.created_at).getTime() : 0;
}

function compareProjects(a: Project, b: Project, sort: SortOption): number {
    if (sort === 'name') {
        return a.name.localeCompare(b.name);
    }

    if (sort === 'assets') {
        return (b.asset_count ?? 0) - (a.asset_count ?? 0);
    }

    if (sort === 'oldest') {
        return projectCreatedAt(a) - projectCreatedAt(b);
    }

    return projectCreatedAt(b) - projectCreatedAt(a);
}

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    const { workspace } = usePage().props;
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [visibilityFilter, setVisibilityFilter] =
        useState<VisibilityFilter>('all');
    const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
    const [sort, setSort] = useState<SortOption>('latest');

    const totalProjects = projects.length;
    const publishedProjects = projects.filter(
        (project) => project.status === 'published',
    ).length;
    const clientProjects = projects.filter(
        (project) => project.visibility === 'client',
    ).length;
    const attentionProjects = projects.filter((project) =>
        isNeedsAttention(project),
    ).length;

    const filteredProjects = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return projects
            .filter((project) => {
                if (
                    normalizedQuery.length > 0 &&
                    !`${project.name} ${project.category} ${project.description ?? ''}`
                        .toLowerCase()
                        .includes(normalizedQuery)
                ) {
                    return false;
                }

                if (statusFilter !== 'all' && project.status !== statusFilter) {
                    return false;
                }

                if (
                    visibilityFilter !== 'all' &&
                    project.visibility !== visibilityFilter
                ) {
                    return false;
                }

                if (
                    modeFilter !== 'all' &&
                    normalizeProjectMode(project.mode) !== modeFilter
                ) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => compareProjects(a, b, sort));
    }, [modeFilter, projects, query, sort, statusFilter, visibilityFilter]);

    const hasActiveFilters =
        query.trim().length > 0 ||
        statusFilter !== 'all' ||
        visibilityFilter !== 'all' ||
        modeFilter !== 'all' ||
        sort !== 'latest';
    const portfolioUrl =
        typeof workspace?.portfolio_url === 'string'
            ? workspace.portfolio_url
            : null;
    const libraryDescription = hasActiveFilters
        ? 'A focused slice of the workspace based on the current search and filters.'
        : 'A compact grid of the whole workspace, sorted so it is easier to scan and compare projects.';

    const clearControls = (): void => {
        setQuery('');
        setStatusFilter('all');
        setVisibilityFilter('all');
        setModeFilter('all');
        setSort('latest');
    };

    return (
        <>
            <Head title="Projects" />

            <div className="space-y-6 p-4 sm:space-y-7 sm:p-6">
                <ProjectSection className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 shadow-none sm:px-5 sm:py-5 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
                    <div className="space-y-4 sm:hidden">
                        <div className="space-y-1.5">
                            <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase dark:text-muted-foreground">
                                Library
                            </p>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                Projects
                            </h1>
                            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                                Manage your library and reopen work faster.
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            <PublicProfileActions
                                portfolioUrl={portfolioUrl}
                                className="grid grid-cols-2 gap-2 [&>*]:w-full [&>*]:justify-center"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <ProjectInsetPanel className="flex h-[5rem] flex-col justify-between rounded-[1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.18em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Total
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {totalProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex h-[5rem] flex-col justify-between rounded-[1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.18em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Attention
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {attentionProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex h-[5rem] flex-col justify-between rounded-[1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.18em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Published
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {publishedProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex h-[5rem] flex-col justify-between rounded-[1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.18em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Client
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {clientProjects}
                                </p>
                            </ProjectInsetPanel>
                        </div>
                    </div>

                    <div className="hidden gap-4 sm:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:items-center">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Library
                                </p>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-foreground">
                                    Projects
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-muted-foreground">
                                    Keep the whole library visible, find the
                                    right project faster, and see which
                                    collections still need one more pass before
                                    they are ready to share.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <PublicProfileActions
                                    portfolioUrl={portfolioUrl}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            <ProjectInsetPanel className="flex h-[6.35rem] flex-col justify-between rounded-[1.1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-1.5 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Total
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {totalProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex h-[6.35rem] flex-col justify-between rounded-[1.1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-1.5 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Needs attention
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {attentionProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex h-[6.35rem] flex-col justify-between rounded-[1.1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-1.5 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Published
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {publishedProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex h-[6.35rem] flex-col justify-between rounded-[1.1rem] border border-primary/16 bg-[#f5f1ff] px-3 py-1.5 shadow-none dark:border-white/10 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Client
                                </p>
                                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                    {clientProjects}
                                </p>
                            </ProjectInsetPanel>
                        </div>
                    </div>
                </ProjectSection>

                <ProjectSection className="space-y-4 rounded-[1.75rem] border-primary/16 bg-white/88 shadow-[0_18px_54px_rgba(99,102,241,0.05)] dark:border-white/10 dark:bg-card/60 dark:shadow-none">
                    <ProjectSectionHeader
                        title="Library controls"
                        description="Search, filter, and sort the whole workspace without losing the bigger portfolio picture."
                        action={
                            hasActiveFilters ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full"
                                    onClick={clearControls}
                                >
                                    <X className="mr-2 size-4" />
                                    Clear
                                </Button>
                            ) : undefined
                        }
                    />

                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,0.7fr))]">
                        <div className="relative col-span-2 xl:col-span-1">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400 dark:text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search projects..."
                                className="h-11 rounded-full border-primary/20 bg-[#f5f1ff] pr-4 pl-11 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-inherit dark:placeholder:text-muted-foreground dark:focus-visible:border-ring"
                            />
                        </div>

                        <div className="w-full justify-self-stretch">
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(value as StatusFilter)
                                }
                            >
                                <SelectTrigger className="h-11 w-full rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                    <div className="flex items-center gap-2">
                                        <CircleDot className="size-4 text-slate-400 dark:text-muted-foreground" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="draft">
                                        Drafts
                                    </SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full justify-self-stretch">
                            <Select
                                value={visibilityFilter}
                                onValueChange={(value) =>
                                    setVisibilityFilter(
                                        value as VisibilityFilter,
                                    )
                                }
                            >
                                <SelectTrigger className="h-11 w-full rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                    <div className="flex items-center gap-2">
                                        <Eye className="size-4 text-slate-400 dark:text-muted-foreground" />
                                        <SelectValue placeholder="Visibility" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All visibility
                                    </SelectItem>
                                    <SelectItem value="private">
                                        Private
                                    </SelectItem>
                                    <SelectItem value="client">
                                        Client
                                    </SelectItem>
                                    <SelectItem value="public">
                                        Public
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full justify-self-stretch">
                            <Select
                                value={modeFilter}
                                onValueChange={(value) =>
                                    setModeFilter(value as ModeFilter)
                                }
                            >
                                <SelectTrigger className="h-11 w-full rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid className="size-4 text-slate-400 dark:text-muted-foreground" />
                                        <SelectValue placeholder="Mode" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All modes
                                    </SelectItem>
                                    <SelectItem value="photography">
                                        Photography
                                    </SelectItem>
                                    <SelectItem value="design_case_study">
                                        Design / Case Study
                                    </SelectItem>
                                    <SelectItem value="art_series">
                                        Art Series
                                    </SelectItem>
                                    <SelectItem value="mixed_experimental">
                                        Mixed / Experimental
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full justify-self-stretch">
                            <Select
                                value={sort}
                                onValueChange={(value) =>
                                    setSort(value as SortOption)
                                }
                            >
                                <SelectTrigger className="h-11 w-full rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal className="size-4 text-slate-400 dark:text-muted-foreground" />
                                        <SelectValue placeholder="Sort" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">
                                        Latest first
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        Oldest first
                                    </SelectItem>
                                    <SelectItem value="name">
                                        Name A-Z
                                    </SelectItem>
                                    <SelectItem value="assets">
                                        Most assets
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </ProjectSection>

                {projects.length === 0 ? (
                    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center dark:border-white/15 dark:bg-white/[0.03]">
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-foreground">
                            No projects yet
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground">
                            Create your first collection to start organizing
                            portfolio work and client galleries.
                        </p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center dark:border-white/15 dark:bg-white/[0.03]">
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-foreground">
                            No matching projects
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground">
                            Try another keyword or clear the current filters to
                            bring the full library back into view.
                        </p>
                        {hasActiveFilters ? (
                            <Button
                                variant="outline"
                                className="mt-5 rounded-full"
                                onClick={clearControls}
                            >
                                Clear filters
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <ProjectSectionHeader
                            title="Library grid"
                            description={libraryDescription}
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProjects.map((project, index) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    defaultOpen={index === 0}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ProjectsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
    ],
};
