import { Head } from '@inertiajs/react';
import PublicProjectGrid from '@/components/public/public-project-grid';
import type { Project } from '@/types';

type Creator = {
    id: number;
    name: string;
    profile_url: string;
};

export default function PublicProfile({
    creator,
    projects,
}: {
    creator: Creator;
    projects: Project[];
}) {
    return (
        <>
            <Head title={`${creator.name} Portfolio`} />

            <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#ffffff_38%,#f3f0ea_100%)] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-10">
                    <section className="rounded-[2rem] border bg-white/80 p-8 shadow-sm backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                            CreativeHub Portfolio
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                            {creator.name}
                        </h1>
                        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                            A curated view of published work, ready to share
                            with clients and collaborators.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    Published projects
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {projects.length} project
                                    {projects.length === 1 ? '' : 's'} live on
                                    this portfolio.
                                </p>
                            </div>
                        </div>

                        {projects.length === 0 ? (
                            <div className="rounded-[2rem] border border-dashed bg-white/70 p-10 text-center text-sm text-muted-foreground">
                                No public projects yet.
                            </div>
                        ) : (
                            <PublicProjectGrid projects={projects} />
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
