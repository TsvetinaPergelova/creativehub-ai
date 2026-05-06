import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

export default function PublicProjectGrid({
    projects,
}: {
    projects: Project[];
}) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
                <Card
                    key={project.id}
                    className="group gap-0 overflow-hidden bg-card/85 transition-transform duration-200 hover:-translate-y-1"
                >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {project.cover_image_url ? (
                            <img
                                src={project.cover_image_url}
                                alt={project.name}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                        ) : (
                            <div
                                className={cn(
                                    'flex size-full items-end justify-start bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_40%)] p-5',
                                )}
                            >
                                <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                        CreativeHub
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">
                                        {project.name}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className="absolute left-4 top-4">
                            <Badge
                                variant="outline"
                                className="capitalize backdrop-blur-sm"
                            >
                                {project.visibility}
                            </Badge>
                        </div>
                    </div>
                    <CardHeader className="space-y-4 px-5 pt-5">
                        <div className="space-y-2">
                            {project.creator_name && (
                                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                    {project.creator_name}
                                </p>
                            )}
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl leading-tight">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {project.category}
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-5 pb-0">
                        <p className="line-clamp-3 min-h-15 text-sm leading-6 text-muted-foreground">
                            {project.description ?? 'No description added yet.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {project.published_at && <span>Published</span>}
                            {project.creator_name && (
                                <>
                                    <span className="opacity-40">/</span>
                                    <span>{project.creator_name}</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="px-5 pb-5 pt-5">
                        <Link
                            href={project.public_url ?? '#'}
                            className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary"
                        >
                            View project
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
