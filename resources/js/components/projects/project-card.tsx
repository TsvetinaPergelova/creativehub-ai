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
import { show } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import type { Project } from '@/types';

export default function ProjectCard({ project }: { project: Project }) {
    return (
        <Card className="group gap-0 overflow-hidden rounded-[1.75rem] border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:-translate-y-1">
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {project.cover_image_url ? (
                    <img
                        src={project.cover_image_url}
                        alt={project.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex size-full items-end justify-start bg-[linear-gradient(135deg,rgba(244,114,182,0.18),rgba(250,204,21,0.12),rgba(255,255,255,0.04))] p-5">
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                Draft board
                            </p>
                            <p className="mt-2 text-xl font-semibold">
                                {project.name}
                            </p>
                        </div>
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge
                        variant="outline"
                        className="border-white/15 bg-black/30 capitalize text-white backdrop-blur-sm"
                    >
                        {project.status}
                    </Badge>
                    <Badge className="capitalize">{project.visibility}</Badge>
                </div>
            </div>

            <CardHeader className="space-y-3 px-5 pt-5">
                <div className="space-y-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription>{project.category}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-5 pb-0">
                <p className="line-clamp-3 min-h-15 text-sm leading-6 text-muted-foreground">
                    {project.description ?? 'No description added yet.'}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                        {project.assets?.length ?? 0} asset
                        {(project.assets?.length ?? 0) === 1 ? '' : 's'}
                    </span>
                    {project.published_at && (
                        <>
                            <span className="opacity-40">•</span>
                            <span>Published</span>
                        </>
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-5 pb-5 pt-5">
                <Link
                    href={show(project.id)}
                    className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                    prefetch
                >
                    Open project
                </Link>
            </CardFooter>
        </Card>
    );
}
