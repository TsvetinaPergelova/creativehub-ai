import { Link } from '@inertiajs/react';
import { FolderOpen, LoaderCircle, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { create, show } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { WorkspaceProjectSearchItem } from '@/types';

export function WorkspaceQuickSwitcher({
    projects,
    currentProjectId,
}: {
    projects: WorkspaceProjectSearchItem[];
    currentProjectId?: number;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const filteredProjects = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery.length === 0) {
            return projects;
        }

        return projects.filter((project) =>
            `${project.name} ${project.category} ${project.status}`
                .toLowerCase()
                .includes(normalizedQuery),
        );
    }, [projects, query]);
    const hasQuery = query.trim().length > 0;
    const resultsLabel = hasQuery ? 'Matching projects' : 'Recent projects';

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group flex w-full items-center gap-3 rounded-full border border-white/10 bg-background/60 px-3 py-2 text-left transition hover:border-primary/25 hover:bg-background/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Search className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground group-hover:text-foreground">
                        Search projects or jump back in
                    </p>
                </div>
            </button>

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    setIsOpen(open);

                    if (!open) {
                        setQuery('');
                    }
                }}
            >
                <DialogContent className="max-h-[min(80vh,40rem)] overflow-hidden rounded-[1.5rem] border-white/10 bg-background p-0 sm:max-w-2xl [&>button]:hidden">
                    <DialogTitle className="sr-only">
                        Search projects
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Search across recent projects and open one quickly.
                    </DialogDescription>

                    <div className="border-b border-white/10 px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-background/70 px-4 py-3">
                            <Search className="size-4 shrink-0 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by project name, category, or status..."
                                className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="min-h-0 overflow-y-auto">
                        <div className="space-y-3 p-4 sm:p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                                    {resultsLabel}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                                </p>
                            </div>

                            {filteredProjects.length === 0 ? (
                                <div className="rounded-[1.25rem] border border-white/10 bg-background/50 p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Search className="size-4" />
                                        </div>
                                        <div className="min-w-0 space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    No matching projects
                                                </p>
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    Try another keyword, or start a fresh project if this workspace needs something new.
                                                </p>
                                            </div>
                                            <Link
                                                href={create()}
                                                onClick={() => setIsOpen(false)}
                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/70 px-3 py-2 text-sm transition hover:border-primary/25 hover:bg-background/90"
                                                prefetch
                                            >
                                                <Plus className="size-4" />
                                                New project
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {filteredProjects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={show(project.id)}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                'block rounded-[1.25rem] border border-white/10 bg-background/50 px-4 py-3.5 transition hover:border-primary/25 hover:bg-background/70',
                                                currentProjectId === project.id &&
                                                    'border-primary/30 bg-primary/8',
                                            )}
                                            prefetch
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    {project.pending_assets_count > 0 ? (
                                                        <LoaderCircle className="size-4" />
                                                    ) : (
                                                        <FolderOpen className="size-4" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-medium">
                                                            {project.name}
                                                        </p>
                                                        <span className="rounded-full border border-white/10 bg-background/80 px-2 py-0.5 text-[11px] capitalize text-muted-foreground">
                                                            {project.status}
                                                        </span>
                                                        {project.pending_assets_count > 0 ? (
                                                            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                                                                {project.pending_assets_count} in review
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {project.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
