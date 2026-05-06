import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Heading from '@/components/heading';
import ProjectCard from '@/components/projects/project-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { create, index as projects } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { dashboard } from '@/routes';
import type { Project } from '@/types';

type DashboardStat = {
    label: string;
    value: number;
    hint: string;
};

export default function Dashboard({
    stats,
    recentProjects,
    portfolioAdvice,
}: {
    stats: DashboardStat[];
    recentProjects: Project[];
    portfolioAdvice: {
        title: string;
        message: string;
    };
}) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 sm:p-6">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_32%),rgba(255,255,255,0.03)] px-6 py-8 shadow-[0_30px_120px_rgba(0,0,0,0.24)] sm:px-8">
                    <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
                        <div className="space-y-5">
                            <div className="space-y-4">
                                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                                    CreativeHub Studio
                                </p>
                                <Heading
                                    title="Dashboard"
                                    description="Track how your portfolio is taking shape, watch your publishing momentum, and jump back into the next project that needs attention."
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" asChild>
                                    <Link href={projects()} prefetch>
                                        View projects
                                    </Link>
                                </Button>

                                <Button className="rounded-full px-5" asChild>
                                    <Link href={create()} prefetch>
                                        <Plus className="mr-2 size-4" />
                                        New project
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <Card className="gap-4 rounded-[1.75rem] border-white/10 bg-black/25 py-5 shadow-none">
                            <CardHeader className="px-5">
                                <CardTitle>{portfolioAdvice.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5">
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {portfolioAdvice.message}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="gap-4 rounded-[1.5rem] border-white/10 bg-white/[0.04] py-5 shadow-none"
                        >
                            <CardHeader className="px-5">
                                <CardTitle className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 px-5">
                                <p className="text-4xl font-semibold tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {stat.hint}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Recent projects
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Re-enter active workspaces and keep your best
                                work moving.
                            </p>
                        </div>
                    </div>

                    {recentProjects.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                No projects yet. Create one to start shaping
                                your portfolio.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {recentProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
