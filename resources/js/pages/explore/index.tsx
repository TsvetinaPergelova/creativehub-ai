import { Head } from '@inertiajs/react';
import PublicProjectGrid from '@/components/public/public-project-grid';
import type { Project } from '@/types';

export default function ExploreIndex({
    projects,
}: {
    projects: Project[];
}) {
    return (
        <>
            <Head title="Explore" />

            <div className="min-h-screen bg-[linear-gradient(180deg,#f5f0e8_0%,#ffffff_36%,#f3ede4_100%)] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-10">
                    <section className="rounded-[2rem] border bg-white/80 p-8 shadow-sm backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                            Explore
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                            Discover published work from the community
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
                            Browse recent public projects, study visual
                            directions, and see how other creators are shaping
                            their portfolios.
                        </p>
                    </section>

                    {projects.length === 0 ? (
                        <div className="rounded-[2rem] border border-dashed bg-white/70 p-10 text-center text-sm text-muted-foreground">
                            No public projects are available yet.
                        </div>
                    ) : (
                        <PublicProjectGrid projects={projects} />
                    )}
                </div>
            </div>
        </>
    );
}
