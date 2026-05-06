import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import ProjectCard from '@/components/projects/project-card';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { create } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import type { Project } from '@/types';

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    return (
        <>
            <Head title="Projects" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <Heading
                        title="Projects"
                        description="Manage your creative collections, drafts, and client work in one place."
                    />

                    <Button asChild>
                        <Link href={create()} prefetch>
                            <Plus className="mr-2 size-4" />
                            New project
                        </Link>
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <h2 className="text-lg font-semibold">
                            No projects yet
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Create your first collection to start organizing
                            portfolio work and client galleries.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
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
