import { Head } from '@inertiajs/react';
import PublicProjectGrid from '@/components/public/public-project-grid';
import type { Project } from '@/types';

export default function ExploreIndex({
    projects,
}: {
    projects: Project[];
}) {
    const categories = new Set(projects.map((project) => project.category)).size;
    const creators = new Set(
        projects.map((project) => project.creator_name).filter(Boolean),
    ).size;

    return (
        <>
            <Head title="Explore" />

            <div className="space-y-8 p-4 sm:p-6">
                <section className="relative overflow-hidden rounded-xl border bg-card/70 px-6 py-8 shadow-sm sm:px-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_34%)]" />
                    <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-end">
                        <div>
                            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                                Explore
                            </p>
                            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                                Discover published work from the community
                            </h1>
                            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                                Browse recent public projects, study visual
                                directions, and see how other creators are
                                shaping their portfolios.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                            <div className="rounded-lg border bg-background/60 p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    Live projects
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight">
                                    {projects.length}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-background/60 p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    Categories
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight">
                                    {categories}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-background/60 p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    Creators
                                </p>
                                <p className="mt-3 text-3xl font-semibold tracking-tight">
                                    {creators}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card/60 p-10 text-center text-sm text-muted-foreground">
                        No public projects are available yet.
                    </div>
                ) : (
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Published projects
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                A live feed of public work shared through
                                CreativeHub.
                            </p>
                        </div>

                        <PublicProjectGrid projects={projects} />
                    </section>
                )}
            </div>
        </>
    );
}
