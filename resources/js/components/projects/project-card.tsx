import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { show } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getProjectModeLabel } from '@/lib/project-mode';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

export default function ProjectCard({ project }: { project: Project }) {
    const assetCount = project.asset_count ?? project.assets?.length ?? 0;
    const modeLabel = getProjectModeLabel(project.mode);
    const attentionFlags = [
        assetCount === 0 ? 'No assets yet' : null,
        !project.has_explicit_cover ? 'Needs cover' : null,
        !project.description ? 'Needs description' : null,
    ].filter(Boolean) as string[];
    const statusToneClass =
        project.status === 'published'
            ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-100'
            : 'border-white/15 bg-black/30 text-white';

    return (
        <Link href={show(project.id)} className="group block h-full" prefetch>
            <Card className="h-full gap-0 overflow-hidden rounded-[1.25rem] border-white/10 bg-white/[0.04] shadow-none transition hover:border-primary/20 hover:bg-white/[0.05]">
                <div className="relative aspect-[1.95/1] overflow-hidden bg-muted">
                    {project.cover_image_url ? (
                        <img
                            src={project.cover_image_url}
                            alt={project.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex size-full items-end justify-start bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(250,204,21,0.12),rgba(255,255,255,0.04))] p-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                                    Library entry
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {project.name}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <Badge
                            variant="outline"
                            className={cn(
                                'h-6 px-2 text-[10px] capitalize backdrop-blur-sm',
                                statusToneClass,
                            )}
                        >
                            {project.status}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="h-6 border-white/15 bg-black/30 px-2 text-[10px] capitalize text-white backdrop-blur-sm"
                        >
                            {project.visibility}
                        </Badge>
                    </div>
                </div>

                <CardHeader className="space-y-1.5 px-3 pt-3 pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                            {project.category}
                        </p>
                        <Badge
                            variant="outline"
                            className="border-white/10 bg-white/[0.05] px-2 text-[9px] tracking-[0.08em] uppercase text-white/80"
                        >
                            {modeLabel}
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <CardTitle className="line-clamp-2 text-[1.15rem] leading-tight tracking-tight">
                            {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 min-h-[3.25rem] text-[13px] leading-6">
                            {project.description ?? 'Add a short description to give this project a clearer point of view.'}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-2 px-3 py-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="rounded-full border border-white/10 bg-black/[0.15] px-2.5 py-1">
                            {assetCount} asset{assetCount === 1 ? '' : 's'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/[0.15] px-2.5 py-1">
                            {project.published_at ? 'Published' : 'Workspace'}
                        </span>
                        {project.has_explicit_cover ? (
                            <span className="rounded-full border border-white/10 bg-black/[0.15] px-2.5 py-1">
                                Has cover
                            </span>
                        ) : null}
                    </div>

                    {attentionFlags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {attentionFlags.slice(0, 2).map((flag) => (
                                <span
                                    key={flag}
                                    className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-100"
                                >
                                    {flag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-muted-foreground">
                            Ready to keep shaping or share.
                        </div>
                    )}
                </CardContent>

                <CardFooter className="px-3 pb-3 pt-0">
                    <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                        Open project
                        <ArrowRight className="size-3.5" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
