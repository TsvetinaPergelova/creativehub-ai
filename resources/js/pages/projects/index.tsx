import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { create, index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
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
                <ProjectSection className="relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] px-4 py-4 sm:px-5 sm:py-5">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:items-center">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                                    Library
                                </p>
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Projects
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Keep the whole library visible, find the
                                    right project faster, and see which
                                    collections still need one more pass before
                                    they are ready to share.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <Button className="rounded-full px-4" size="sm" asChild>
                                    <Link href={create()} prefetch>
                                        <Plus className="mr-2 size-4" />
                                        New project
                                    </Link>
                                </Button>

                                <PublicProfileActions portfolioUrl={portfolioUrl} />
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            <ProjectInsetPanel className="rounded-[1.1rem] bg-black/[0.16] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Total
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {totalProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="rounded-[1.1rem] bg-black/[0.16] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Needs attention
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {attentionProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="rounded-[1.1rem] bg-black/[0.16] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Published
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {publishedProjects}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="rounded-[1.1rem] bg-black/[0.16] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Client
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {clientProjects}
                                </p>
                            </ProjectInsetPanel>
                        </div>
                    </div>
                </ProjectSection>

                <ProjectSection className="space-y-4 rounded-[1.75rem]">
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

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,0.7fr))]">
                        <div className="relative xl:col-span-1">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by project name, category, or description..."
                                className="h-11 rounded-full border-white/10 bg-background/60 pr-4 pl-11"
                            />
                        </div>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) =>
                                setStatusFilter(value as StatusFilter)
                            }
                        >
                            <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/60">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="draft">Drafts</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={visibilityFilter}
                            onValueChange={(value) =>
                                setVisibilityFilter(value as VisibilityFilter)
                            }
                        >
                            <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/60">
                                <SelectValue placeholder="Visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All visibility</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={modeFilter}
                            onValueChange={(value) =>
                                setModeFilter(value as ModeFilter)
                            }
                        >
                            <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/60">
                                <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All modes</SelectItem>
                                <SelectItem value="photography">
                                    Photography
                                </SelectItem>
                                <SelectItem value="design_case_study">
                                    Design / Case Study
                                </SelectItem>
                                <SelectItem value="art_series">Art Series</SelectItem>
                                <SelectItem value="mixed_experimental">
                                    Mixed / Experimental
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={sort}
                            onValueChange={(value) => setSort(value as SortOption)}
                        >
                            <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/60">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                                    <SelectValue placeholder="Sort" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">Latest first</SelectItem>
                                <SelectItem value="oldest">Oldest first</SelectItem>
                                <SelectItem value="name">Name A-Z</SelectItem>
                                <SelectItem value="assets">Most assets</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            Showing {filteredProjects.length} of {totalProjects}{' '}
                            project{totalProjects === 1 ? '' : 's'}.
                        </p>
                        {hasActiveFilters ? (
                            <p>Filters are shaping the library view.</p>
                        ) : (
                            <p>The full workspace library is visible.</p>
                        )}
                    </div>
                </ProjectSection>

                {projects.length === 0 ? (
                    <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
                        <h2 className="text-lg font-semibold">
                            No projects yet
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Create your first collection to start organizing
                            portfolio work and client galleries.
                        </p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
                        <h2 className="text-lg font-semibold">
                            No matching projects
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
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
                    <ProjectSection className="space-y-4 rounded-[1.75rem]">
                        <ProjectSectionHeader
                            title="Library grid"
                            description={libraryDescription}
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </ProjectSection>
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
