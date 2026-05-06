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
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <Heading
                        title="Dashboard"
                        description="Track how your portfolio is taking shape and jump back into recent work."
                    />

                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={projects()} prefetch>
                                View projects
                            </Link>
                        </Button>

                        <Button asChild>
                            <Link href={create()} prefetch>
                                <Plus className="mr-2 size-4" />
                                New project
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">
                                    {stat.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-3xl font-semibold tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {stat.hint}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{portfolioAdvice.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {portfolioAdvice.message}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent projects</h2>
                    </div>

                    {recentProjects.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-10 text-center">
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
