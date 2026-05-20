import { Head } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import {
    ProjectInsetPanel,
    ProjectSection,
    ProjectSectionHeader,
} from '@/components/projects/project-ui';
import PublicProjectGrid from '@/components/public/public-project-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Project } from '@/types';

type SortOption = 'newest' | 'oldest' | 'title' | 'creator';

function exploreShelfTitle(sort: SortOption, hasActiveFilters: boolean): string {
    if (hasActiveFilters) {
        return 'Top matches';
    }

    if (sort === 'oldest') {
        return 'Earlier published work';
    }

    if (sort === 'title') {
        return 'Selected work';
    }

    if (sort === 'creator') {
        return 'Creators in focus';
    }

    return 'Recently added';
}

export default function ExploreIndex({
    projects,
}: {
    projects: Project[];
}) {
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [creatorFilter, setCreatorFilter] = useState('all');
    const [sort, setSort] = useState<SortOption>('newest');

    const deferredQuery = useDeferredValue(query);
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const categories = Array.from(new Set(projects.map((project) => project.category)))
        .filter((category): category is string => category.length > 0)
        .sort((left, right) => left.localeCompare(right));

    const creators = Array.from(
        new Set(projects.map((project) => project.creator_name)),
    )
        .filter((creator): creator is string => Boolean(creator))
        .sort((left, right) => left.localeCompare(right));

    const filteredProjects = projects
        .filter((project) => {
            if (
                normalizedQuery.length > 0 &&
                ![
                    project.name,
                    project.category,
                    project.description ?? '',
                    project.creator_name ?? '',
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedQuery)
            ) {
                return false;
            }

            if (
                categoryFilter !== 'all' &&
                project.category !== categoryFilter
            ) {
                return false;
            }

            if (
                creatorFilter !== 'all' &&
                project.creator_name !== creatorFilter
            ) {
                return false;
            }

            return true;
        })
        .sort((left, right) => {
            if (sort === 'title') {
                return left.name.localeCompare(right.name);
            }

            if (sort === 'creator') {
                return (left.creator_name ?? '').localeCompare(
                    right.creator_name ?? '',
                );
            }

            const leftPublishedAt = left.published_at
                ? new Date(left.published_at).getTime()
                : 0;
            const rightPublishedAt = right.published_at
                ? new Date(right.published_at).getTime()
                : 0;

            return sort === 'oldest'
                ? leftPublishedAt - rightPublishedAt
                : rightPublishedAt - leftPublishedAt;
        });

    const hasActiveFilters =
        normalizedQuery.length > 0 ||
        categoryFilter !== 'all' ||
        creatorFilter !== 'all' ||
        sort !== 'newest';

    const featuredProjects = filteredProjects.slice(0, 3);
    const remainingProjects = filteredProjects.slice(featuredProjects.length);

    const clearControls = (): void => {
        setQuery('');
        setCategoryFilter('all');
        setCreatorFilter('all');
        setSort('newest');
    };

    return (
        <>
            <Head title="Explore" />

            <div className="space-y-6 p-4 sm:space-y-7 sm:p-6">
                <ProjectSection className="relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] px-4 py-4 sm:px-5 sm:py-5">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] xl:items-center">
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                                    Discovery
                                </p>
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Explore public portfolios
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Browse published work across categories,
                                    find creators worth following, and open the
                                    projects that best match the style or
                                    direction you are looking for.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                            <ProjectInsetPanel className="rounded-[1.1rem] bg-black/[0.16] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Live projects
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {projects.length}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="rounded-[1.1rem] bg-black/[0.16] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Categories
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {categories.length}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="rounded-[1.1rem] bg-black/[0.16] px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Creators
                                </p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">
                                    {creators.length}
                                </p>
                            </ProjectInsetPanel>
                        </div>
                    </div>
                </ProjectSection>

                <ProjectSection className="space-y-4 rounded-[1.75rem]">
                    <ProjectSectionHeader
                        title="Explore controls"
                        description="Narrow the feed by project title, category, or creator without leaving the discovery flow."
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

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.75fr))]">
                        <div className="relative xl:col-span-1">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by project title, category, or creator..."
                                className="h-11 rounded-full border-white/10 bg-background/60 pr-4 pl-11"
                            />
                        </div>

                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/60">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                            <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/60">
                                <SelectValue placeholder="Creator" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All creators</SelectItem>
                                {creators.map((creator) => (
                                    <SelectItem key={creator} value={creator}>
                                        {creator}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={sort}
                            onValueChange={(value) => setSort(value as SortOption)}
                        >
                            <SelectTrigger className="h-11 rounded-full border-white/10 bg-background/60">
                                <SlidersHorizontal className="size-4 text-muted-foreground" />
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest first</SelectItem>
                                <SelectItem value="oldest">Oldest first</SelectItem>
                                <SelectItem value="title">Title A-Z</SelectItem>
                                <SelectItem value="creator">Creator A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{filteredProjects.length} projects visible</span>
                        {hasActiveFilters ? (
                            <>
                                <span className="opacity-40">/</span>
                                <span>Filtered view</span>
                            </>
                        ) : (
                            <>
                                <span className="opacity-40">/</span>
                                <span>Full public feed</span>
                            </>
                        )}
                    </div>
                </ProjectSection>

                {projects.length === 0 ? (
                    <ProjectSection className="rounded-[1.75rem] border-dashed bg-card/60 p-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No public projects are available yet.
                        </p>
                    </ProjectSection>
                ) : filteredProjects.length === 0 ? (
                    <ProjectSection className="space-y-4 rounded-[1.75rem] border-dashed bg-card/60 p-8 text-center">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold tracking-tight">
                                No matching projects
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Try a different search term, broaden the
                                category, or clear the creator filter.
                            </p>
                        </div>

                        <div>
                            <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={clearControls}
                            >
                                Reset explore filters
                            </Button>
                        </div>
                    </ProjectSection>
                ) : (
                    <div className="space-y-6">
                        {featuredProjects.length > 0 ? (
                            <ProjectSection className="space-y-4 rounded-[1.75rem]">
                                <ProjectSectionHeader
                                    title={exploreShelfTitle(sort, hasActiveFilters)}
                                    description={
                                        hasActiveFilters
                                            ? 'The strongest current matches based on the active search, filters, and sort.'
                                            : 'A quicker way to land on the most relevant public work before browsing the full feed.'
                                    }
                                />

                                <PublicProjectGrid projects={featuredProjects} />
                            </ProjectSection>
                        ) : null}

                        {remainingProjects.length > 0 ? (
                            <ProjectSection className="space-y-4 rounded-[1.75rem]">
                                <ProjectSectionHeader
                                    title={
                                        featuredProjects.length > 0
                                            ? 'More selected work'
                                            : 'Published projects'
                                    }
                                    description={
                                        featuredProjects.length > 0
                                            ? 'Keep browsing the broader public feed after the top highlights.'
                                            : 'A live public feed of work shared through CreativeHub.'
                                    }
                                />

                                <PublicProjectGrid projects={remainingProjects} />
                            </ProjectSection>
                        ) : null}
                    </div>
                )}
            </div>
        </>
    );
}
