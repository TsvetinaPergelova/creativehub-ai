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
        !project.description ? 'Needs description' : null,
    ].filter(Boolean) as string[];
    const previewLabel = project.has_explicit_cover
        ? 'Custom cover'
        : project.cover_image_url
          ? 'Auto-picked preview'
          : null;
    const statusToneClass =
        project.status === 'published'
            ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-100'
            : 'border-white/15 bg-black/30 text-white';

    return (
        <Link href={show(project.id)} className="group block h-full" prefetch>
            <Card className="h-full gap-0 overflow-hidden rounded-[1.75rem] border-white/10 bg-card/85 py-0 shadow-none transition hover:-translate-y-1 hover:border-primary/20 hover:bg-card">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {project.cover_image_url ? (
                        <img
                            src={project.cover_image_url}
                            alt={project.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex size-full items-end justify-start bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_40%),rgba(255,255,255,0.04)] p-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                    Library entry
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
                            className={cn(
                                'border-white/15 bg-black/25 capitalize text-white backdrop-blur-sm',
                                statusToneClass,
                            )}
                        >
                            {project.status}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="border-white/15 bg-black/25 capitalize text-white backdrop-blur-sm"
                        >
                            {project.visibility}
                        </Badge>
                    </div>
                </div>

                <CardHeader className="space-y-3 px-5 pt-5 pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                            {project.category}
                        </p>
                        <Badge
                            variant="outline"
                            className="border-white/10 bg-white/[0.05] px-2.5 text-[10px] tracking-[0.08em] uppercase text-white/80"
                        >
                            {modeLabel}
                        </Badge>
                    </div>

                    <div className="space-y-1.5">
                        <CardTitle className="line-clamp-2 text-xl leading-tight tracking-tight">
                            {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 min-h-[4.5rem] text-sm leading-6">
                            {project.description ?? 'Add a short description to give this project a clearer point of view.'}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 px-5 py-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-white/10 bg-black/[0.15] px-2.5 py-1">
                            {assetCount} asset{assetCount === 1 ? '' : 's'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/[0.15] px-2.5 py-1">
                            {project.published_at ? 'Published' : 'Workspace'}
                        </span>
                        {previewLabel ? (
                            <span className="rounded-full border border-white/10 bg-black/[0.15] px-2.5 py-1">
                                {previewLabel}
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

                <CardFooter className="px-5 pb-5 pt-0">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        Open project
                        <ArrowRight className="size-4" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
