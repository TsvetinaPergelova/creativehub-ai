import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import ProjectCard from '@/components/projects/project-card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { create } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import type { Project } from '@/types';

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    const publishedProjects = projects.filter(
        (project) => project.status === 'published',
    ).length;
    const clientProjects = projects.filter(
        (project) => project.visibility === 'client',
    ).length;
    const draftProjects = projects.filter(
        (project) => project.status === 'draft',
    ).length;

    return (
        <>
            <Head title="Projects" />

            <div className="space-y-8 p-4 sm:p-6">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_30%),rgba(255,255,255,0.03)] px-6 py-8 shadow-[0_30px_120px_rgba(0,0,0,0.2)] sm:px-8">
                    <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-end">
                        <div className="space-y-4">
                            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                                Workspace
                            </p>
                            <Heading
                                title="Projects"
                                description="Manage your creative collections, drafts, and client work in one place without losing the thread of what should be published next."
                            />
                            <Button className="rounded-full px-5" asChild>
                                <Link href={create()} prefetch>
                                    <Plus className="mr-2 size-4" />
                                    New project
                                </Link>
                            </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    Total
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight">
                                    {projects.length}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    Published
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight">
                                    {publishedProjects}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    Drafts / Client
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight">
                                    {draftProjects} / {clientProjects}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

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
                ) : (
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Your library
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                A cleaner view of every collection, from early
                                drafts to public showcases.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    </section>
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
