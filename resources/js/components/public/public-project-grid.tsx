import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Project } from '@/types';

export default function PublicProjectGrid({
    projects,
}: {
    projects: Project[];
}) {
    const publishedDateFormatter = new Intl.DateTimeFormat('en', {
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
                <Link
                    key={project.id}
                    href={project.public_url ?? '#'}
                    className="group block h-full"
                >
                    <Card className="h-full gap-0 overflow-hidden rounded-[1.75rem] border-white/10 bg-card/85 py-0 shadow-none transition hover:-translate-y-1 hover:border-primary/20 hover:bg-card">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            {project.cover_image_url ? (
                                <img
                                    src={project.cover_image_url}
                                    alt={project.name}
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="flex size-full items-end justify-start bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_40%)] p-5">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                            Portfolio entry
                                        </p>
                                        <p className="mt-2 text-lg font-semibold">
                                            {project.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className="border-white/15 bg-black/25 backdrop-blur-sm"
                                >
                                    {project.category}
                                </Badge>
                                {project.published_at ? (
                                    <Badge
                                        variant="outline"
                                        className="border-white/15 bg-black/25 backdrop-blur-sm"
                                    >
                                        {publishedDateFormatter.format(
                                            new Date(project.published_at),
                                        )}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                        <CardHeader className="space-y-3 px-5 pt-5 pb-0">
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl leading-tight">
                                    {project.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-3 text-sm leading-6">
                                    {project.description ??
                                        'Open the project to see the full published sequence and presentation.'}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 px-5 py-5">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>{project.asset_count ?? 0} images</span>
                                <span className="opacity-40">/</span>
                                <span>Published project</span>
                            </div>

                            <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition group-hover:text-primary">
                                View project
                                <ArrowRight className="size-4" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
