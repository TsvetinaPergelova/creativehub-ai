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
import { Badge } from '@/components/ui/badge';
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

function exploreShelfTitle(
    sort: SortOption,
    hasActiveFilters: boolean,
): string {
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

export default function ExploreIndex({ projects }: { projects: Project[] }) {
    const [query, setQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [creatorFilter, setCreatorFilter] = useState('all');
    const [sort, setSort] = useState<SortOption>('newest');

    const deferredQuery = useDeferredValue(query);
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const categories = Array.from(
        new Set(projects.map((project) => project.category)),
    )
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

    const filterSummaryLabel = hasActiveFilters
        ? `${filteredProjects.length} visible`
        : `${filteredProjects.length} live`;
    const filterSummaryBadges = (
        <div className="flex flex-wrap items-center gap-2">
            <Badge
                variant="outline"
                className="rounded-full border-primary/16 bg-slate-50 font-normal text-slate-700 dark:border-white/10 dark:bg-background/60 dark:text-muted-foreground"
            >
                {filterSummaryLabel}
            </Badge>
            <Badge
                variant="outline"
                className="rounded-full border-primary/16 bg-slate-50 font-normal text-slate-700 dark:border-white/10 dark:bg-background/60 dark:text-muted-foreground"
            >
                {hasActiveFilters ? 'Filtered view' : 'Full public feed'}
            </Badge>
        </div>
    );

    return (
        <>
            <Head title="Explore" />

            <div className="space-y-5 p-4 sm:space-y-7 sm:p-6">
                <ProjectSection className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 shadow-none sm:px-5 sm:py-5 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] xl:items-center">
                        <div className="space-y-2.5">
                            <div className="space-y-1.5">
                                <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase dark:text-muted-foreground">
                                    Discovery
                                </p>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-foreground">
                                    Explore public portfolios
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:hidden dark:text-muted-foreground">
                                    Find published work and creators worth
                                    following.
                                </p>
                                <p className="hidden max-w-2xl text-sm leading-6 text-slate-600 sm:block dark:text-muted-foreground">
                                    Browse published work across categories,
                                    find creators worth following, and open the
                                    projects that best match the style or
                                    direction you are looking for.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <ProjectInsetPanel className="flex min-h-[6.4rem] flex-col rounded-[1.05rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2.5 shadow-none sm:min-h-[6.8rem] sm:rounded-[1.1rem] sm:py-3 dark:border-primary/18 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[9px] leading-5 tracking-[0.14em] text-slate-500 uppercase sm:text-[10px] sm:tracking-[0.2em] dark:text-muted-foreground">
                                    Live projects
                                </p>
                                <p className="mt-auto self-start text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-foreground">
                                    {projects.length}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex min-h-[6.4rem] flex-col rounded-[1.05rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2.5 shadow-none sm:min-h-[6.8rem] sm:rounded-[1.1rem] sm:py-3 dark:border-primary/18 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[9px] leading-5 tracking-[0.14em] text-slate-500 uppercase sm:text-[10px] sm:tracking-[0.2em] dark:text-muted-foreground">
                                    Categories
                                </p>
                                <p className="mt-auto self-start text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-foreground">
                                    {categories.length}
                                </p>
                            </ProjectInsetPanel>
                            <ProjectInsetPanel className="flex min-h-[6.4rem] flex-col rounded-[1.05rem] border border-primary/16 bg-[#f5f1ff] px-3 py-2.5 shadow-none sm:min-h-[6.8rem] sm:rounded-[1.1rem] sm:py-3 dark:border-primary/18 dark:bg-black/[0.16] dark:shadow-none">
                                <p className="text-[9px] leading-5 tracking-[0.14em] text-slate-500 uppercase sm:text-[10px] sm:tracking-[0.2em] dark:text-muted-foreground">
                                    Creators
                                </p>
                                <p className="mt-auto self-start text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-foreground">
                                    {creators.length}
                                </p>
                            </ProjectInsetPanel>
                        </div>
                    </div>
                </ProjectSection>

                <ProjectSection className="space-y-4 rounded-[1.75rem] border-primary/16 bg-white/88 px-4 py-5 shadow-[0_18px_54px_rgba(99,102,241,0.05)] dark:border-white/10 dark:bg-card/60 dark:px-4 dark:py-5 dark:shadow-none">
                    <ProjectSectionHeader
                        title="Explore controls"
                        description="Narrow the feed by project title, category, or creator without leaving the discovery flow."
                        action={
                            <div className="flex flex-wrap items-center gap-2">
                                {filterSummaryBadges}
                                {hasActiveFilters ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={clearControls}
                                    >
                                        <X className="mr-2 size-4" />
                                        Clear
                                    </Button>
                                ) : null}
                            </div>
                        }
                    />

                    <div className="space-y-3">
                        <div className="relative xl:hidden">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400 dark:text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search projects, creators, categories..."
                                className="h-11 rounded-full border-primary/20 bg-[#f5f1ff] pr-4 pl-11 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-inherit dark:placeholder:text-muted-foreground dark:focus-visible:border-ring"
                            />
                        </div>

                        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] xl:hidden [&::-webkit-scrollbar]:hidden">
                            <div className="flex min-w-max gap-2 pr-4">
                                <Select
                                    value={categoryFilter}
                                    onValueChange={setCategoryFilter}
                                >
                                    <SelectTrigger className="h-10 min-w-[11rem] rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All categories
                                        </SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={creatorFilter}
                                    onValueChange={setCreatorFilter}
                                >
                                    <SelectTrigger className="h-10 min-w-[11rem] rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                        <SelectValue placeholder="Creator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All creators
                                        </SelectItem>
                                        {creators.map((creator) => (
                                            <SelectItem
                                                key={creator}
                                                value={creator}
                                            >
                                                {creator}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={sort}
                                    onValueChange={(value) =>
                                        setSort(value as SortOption)
                                    }
                                >
                                    <SelectTrigger className="h-10 min-w-[10rem] rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                        <SlidersHorizontal className="size-4 text-slate-400 dark:text-muted-foreground" />
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">
                                            Newest first
                                        </SelectItem>
                                        <SelectItem value="oldest">
                                            Oldest first
                                        </SelectItem>
                                        <SelectItem value="title">
                                            Title A-Z
                                        </SelectItem>
                                        <SelectItem value="creator">
                                            Creator A-Z
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="hidden gap-3 xl:grid xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.72fr))]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400 dark:text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(event) =>
                                        setQuery(event.target.value)
                                    }
                                    placeholder="Search projects, creators, categories..."
                                    className="h-11 rounded-full border-primary/20 bg-[#f5f1ff] pr-4 pl-11 text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-inherit dark:placeholder:text-muted-foreground dark:focus-visible:border-ring"
                                />
                            </div>

                            <Select
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                            >
                                <SelectTrigger className="h-11 rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All categories
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={creatorFilter}
                                onValueChange={setCreatorFilter}
                            >
                                <SelectTrigger className="h-11 rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                    <SelectValue placeholder="Creator" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All creators
                                    </SelectItem>
                                    {creators.map((creator) => (
                                        <SelectItem
                                            key={creator}
                                            value={creator}
                                        >
                                            {creator}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={sort}
                                onValueChange={(value) =>
                                    setSort(value as SortOption)
                                }
                            >
                                <SelectTrigger className="h-11 rounded-full border-primary/35 bg-white text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:border-primary/50 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:shadow-none dark:hover:bg-background/80 dark:hover:text-foreground dark:focus-visible:border-ring">
                                    <SlidersHorizontal className="size-4 text-slate-400 dark:text-muted-foreground" />
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">
                                        Newest first
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        Oldest first
                                    </SelectItem>
                                    <SelectItem value="title">
                                        Title A-Z
                                    </SelectItem>
                                    <SelectItem value="creator">
                                        Creator A-Z
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </ProjectSection>

                {projects.length === 0 ? (
                    <ProjectSection className="rounded-[1.75rem] border-dashed border-slate-200 bg-slate-50 p-10 text-center shadow-[0_18px_42px_rgba(15,23,42,0.05)] dark:border-white/8 dark:bg-card/60 dark:shadow-none">
                        <p className="text-sm text-slate-600 dark:text-muted-foreground">
                            No public projects are available yet.
                        </p>
                    </ProjectSection>
                ) : filteredProjects.length === 0 ? (
                    <ProjectSection className="space-y-4 rounded-[1.75rem] border-dashed border-slate-200 bg-slate-50 p-8 text-center shadow-[0_18px_42px_rgba(15,23,42,0.05)] dark:border-white/8 dark:bg-card/60 dark:shadow-none">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                No matching projects
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-muted-foreground">
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
                            <ProjectSection className="space-y-4 rounded-[1.75rem] border-primary/16 bg-white/88 px-4 py-5 shadow-[0_18px_54px_rgba(99,102,241,0.05)] dark:border-white/8 dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none">
                                <ProjectSectionHeader
                                    title={exploreShelfTitle(
                                        sort,
                                        hasActiveFilters,
                                    )}
                                    description={
                                        hasActiveFilters
                                            ? 'The strongest current matches based on the active search, filters, and sort.'
                                            : 'A quicker way to land on the most relevant public work before browsing the full feed.'
                                    }
                                />

                                <PublicProjectGrid
                                    projects={featuredProjects}
                                />
                            </ProjectSection>
                        ) : null}

                        {remainingProjects.length > 0 ? (
                            <ProjectSection className="space-y-4 rounded-[1.75rem] border-primary/16 bg-white/88 px-4 py-5 shadow-[0_18px_54px_rgba(99,102,241,0.05)] dark:border-white/8 dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none">
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

                                <PublicProjectGrid
                                    projects={remainingProjects}
                                />
                            </ProjectSection>
                        ) : null}
                    </div>
                )}
            </div>
        </>
    );
}
