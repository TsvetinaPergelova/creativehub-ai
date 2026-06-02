import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { getProjectModeLabel } from '@/lib/project-mode';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

type ProjectCardProps = {
    project: Project;
    defaultOpen?: boolean;
};

const imageBadgeClass =
    'border-white/20 bg-black/65 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md';

function getProjectCardState(project: Project) {
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
            ? 'border-emerald-300/35 bg-emerald-500/35 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md'
            : imageBadgeClass;

    return {
        assetCount,
        modeLabel,
        attentionFlags,
        previewLabel,
        statusToneClass,
    };
}

function ProjectCardMedia({
    project,
    statusToneClass,
    showMobileTitle = false,
}: {
    project: Project;
    statusToneClass: string;
    showMobileTitle?: boolean;
}) {
    return (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {project.cover_image_url ? (
                <img
                    src={project.cover_image_url}
                    alt={project.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
            ) : (
                <div className="flex size-full items-end justify-start bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_40%),rgba(255,255,255,0.04)] p-5">
                    {!showMobileTitle ? (
                        <div>
                            <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">
                                Library entry
                            </p>
                            <p className="mt-2 text-lg font-semibold">
                                {project.name}
                            </p>
                        </div>
                    ) : null}
                </div>
            )}

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge
                    variant="outline"
                    className={cn('capitalize', statusToneClass)}
                >
                    {project.status}
                </Badge>
                <Badge
                    variant="outline"
                    className={cn('capitalize', imageBadgeClass)}
                >
                    {project.visibility}
                </Badge>
            </div>

            {showMobileTitle ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4">
                    <p className="text-lg leading-tight font-semibold text-white">
                        {project.name}
                    </p>
                </div>
            ) : null}
        </div>
    );
}

function ProjectCardDetails({
    project,
    modeLabel,
    assetCount,
    previewLabel,
    attentionFlags,
    compact = false,
}: {
    project: Project;
    modeLabel: string;
    assetCount: number;
    previewLabel: string | null;
    attentionFlags: string[];
    compact?: boolean;
}) {
    return (
        <>
            <CardHeader
                className={cn(
                    'space-y-3 px-5 pt-5 pb-0',
                    compact && 'px-4 pt-4',
                )}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs tracking-[0.2em] text-slate-500 uppercase dark:text-muted-foreground">
                        {project.category}
                    </p>
                    <Badge
                        variant="outline"
                        className="border-slate-200 bg-slate-50 px-2.5 text-[10px] tracking-[0.08em] text-slate-700 uppercase dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80"
                    >
                        {modeLabel}
                    </Badge>
                </div>

                <div className="space-y-1.5">
                    {!compact ? (
                        <CardTitle className="line-clamp-2 text-xl leading-tight tracking-tight text-slate-950 dark:text-foreground">
                            {project.name}
                        </CardTitle>
                    ) : null}
                    <CardDescription
                        className={cn(
                            'text-sm leading-6 text-slate-600 dark:text-muted-foreground',
                            compact
                                ? 'line-clamp-3 min-h-0'
                                : 'line-clamp-3 min-h-[4.5rem]',
                        )}
                    >
                        {project.description ??
                            'Add a short description to give this project a clearer point of view.'}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent
                className={cn(
                    'space-y-4 px-5 py-5',
                    compact && 'space-y-3 px-4 py-4',
                )}
            >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                        {assetCount} asset{assetCount === 1 ? '' : 's'}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                        {project.published_at ? 'Published' : 'Workspace'}
                    </span>
                    {previewLabel ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                            {previewLabel}
                        </span>
                    ) : null}
                </div>

                {attentionFlags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {attentionFlags.slice(0, 2).map((flag) => (
                            <span
                                key={flag}
                                className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100"
                            >
                                {flag}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-[10px] text-slate-600 dark:text-muted-foreground">
                        Ready to keep shaping or share.
                    </div>
                )}
            </CardContent>

            <CardFooter
                className={cn('px-5 pt-0 pb-5', compact && 'px-4 pb-4')}
            >
                <Link
                    href={show(project.id)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-950 transition-colors hover:text-primary dark:text-foreground"
                    prefetch
                >
                    Open project
                    <ArrowRight className="size-4" />
                </Link>
            </CardFooter>
        </>
    );
}

function DesktopProjectCard({ project }: { project: Project }) {
    const {
        assetCount,
        modeLabel,
        attentionFlags,
        previewLabel,
        statusToneClass,
    } = getProjectCardState(project);

    return (
        <Link href={show(project.id)} className="group block h-full" prefetch>
            <Card className="h-full gap-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-primary/25 hover:bg-white dark:border-white/10 dark:bg-card/85 dark:shadow-none dark:hover:border-primary/20 dark:hover:bg-card">
                <ProjectCardMedia
                    project={project}
                    statusToneClass={statusToneClass}
                />

                <ProjectCardDetails
                    project={project}
                    modeLabel={modeLabel}
                    assetCount={assetCount}
                    previewLabel={previewLabel}
                    attentionFlags={attentionFlags}
                />
            </Card>
        </Link>
    );
}

export default function ProjectCard({
    project,
    defaultOpen = false,
}: ProjectCardProps) {
    const {
        assetCount,
        modeLabel,
        attentionFlags,
        previewLabel,
        statusToneClass,
    } = getProjectCardState(project);
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <>
            <div className="md:hidden">
                <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="group"
                >
                    <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-card/90 dark:shadow-none">
                        <ProjectCardMedia
                            project={project}
                            statusToneClass={statusToneClass}
                            showMobileTitle
                        />

                        <div className="border-t border-slate-200 px-4 py-3 dark:border-white/10">
                            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 text-left">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-950 dark:text-white">
                                        {isOpen
                                            ? 'Hide project details'
                                            : 'View project details'}
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-muted-foreground">
                                        {project.published_at
                                            ? 'Published project'
                                            : 'Workspace draft'}
                                    </p>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'size-4 text-muted-foreground transition-transform duration-200',
                                        isOpen && 'rotate-180',
                                    )}
                                />
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="border-t border-slate-200 dark:border-white/10">
                            <ProjectCardDetails
                                project={project}
                                modeLabel={modeLabel}
                                assetCount={assetCount}
                                previewLabel={previewLabel}
                                attentionFlags={attentionFlags}
                                compact
                            />
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            </div>

            <div className="hidden md:block">
                <DesktopProjectCard project={project} />
            </div>
        </>
    );
}
