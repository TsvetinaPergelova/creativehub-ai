import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowRight,
    ChevronDown,
    FolderOpen,
    ImagePlus,
    LoaderCircle,
    PencilLine,
    Rocket,
    Sparkles,
} from 'lucide-react';
import { create, index as projects, show } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import PublicProfileActions from '@/components/public/public-profile-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { Project } from '@/types';

type DashboardStat = {
    label: string;
    value: number;
    hint: string;
};

type DashboardTarget = 'create' | 'project' | 'projects';

type DashboardPrimaryAction = {
    eyebrow: string;
    title: string;
    description: string;
    cta_label: string;
    target: DashboardTarget;
    project_id: number | null;
};

type DashboardAttentionItem = {
    label: string;
    count: number;
    hint: string;
    cta_label: string;
    target: DashboardTarget;
    project_id: number | null;
};

type WorkflowProject = Project & {
    pending_assets_count: number;
    analyzed_assets_count: number;
    unnamed_assets_count: number;
    dashboard_status: string;
    dashboard_mode_label: string;
    dashboard_mode_summary: string;
    dashboard_tone: 'cover' | 'draft' | 'naming' | 'published' | 'ready' | 'review';
    dashboard_action_label: string;
    dashboard_action_note: string;
    dashboard_action_type: string;
};

type AssistantRecommendation = {
    eyebrow: string;
    title: string;
    reason: string;
    cta_label: string;
    target: DashboardTarget;
    project_id: number | null;
    tone: WorkflowProject['dashboard_tone'] | 'strategy';
};

type AssistantPanel = {
    title: string;
    summary: string;
    primary: AssistantRecommendation;
    follow_ups: AssistantRecommendation[];
};

const imageBadgeClass =
    'border-white/20 bg-black/65 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md';
const imageEyebrowClass =
    'rounded-full border border-white/18 bg-black/62 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] text-white uppercase shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-md';

function resolveDashboardLink(target: DashboardTarget, projectId: number | null) {
    if (target === 'project' && projectId !== null) {
        return show(projectId);
    }

    if (target === 'create') {
        return create();
    }

    return projects();
}

function toneClasses(tone: WorkflowProject['dashboard_tone']) {
    switch (tone) {
        case 'review':
            return {
                badge: 'border-violet-400/30 bg-violet-400/12 text-violet-100',
                imageBadge:
                    'border-violet-300/35 bg-violet-500/35 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md',
                iconWrap: 'bg-violet-500/15 text-violet-200',
            };
        case 'ready':
            return {
                badge: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-100',
                imageBadge:
                    'border-emerald-300/35 bg-emerald-500/35 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md',
                iconWrap: 'bg-emerald-500/15 text-emerald-200',
            };
        case 'cover':
            return {
                badge: 'border-sky-400/30 bg-sky-400/12 text-sky-100',
                imageBadge:
                    'border-sky-300/35 bg-sky-500/35 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md',
                iconWrap: 'bg-sky-500/15 text-sky-200',
            };
        case 'naming':
            return {
                badge: 'border-amber-300/70 bg-amber-50 text-amber-700 shadow-[0_10px_24px_rgba(245,158,11,0.08)] dark:border-amber-400/30 dark:bg-amber-400/12 dark:text-amber-100 dark:shadow-none',
                imageBadge:
                    'border-amber-300/35 bg-amber-500/35 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md',
                iconWrap: 'bg-amber-100 text-amber-500 dark:bg-amber-500/15 dark:text-amber-200',
            };
        case 'published':
            return {
                badge: 'border-slate-200 bg-white/90 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-white/15 dark:bg-white/[0.08] dark:text-white dark:shadow-none',
                imageBadge: imageBadgeClass,
                iconWrap: 'bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-white/90',
            };
        default:
            return {
                badge: 'border-slate-200 bg-white/90 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-white/15 dark:bg-white/[0.08] dark:text-white dark:shadow-none',
                imageBadge: imageBadgeClass,
                iconWrap: 'bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-white/90',
            };
    }
}

function recommendationToneClasses(tone: AssistantRecommendation['tone']) {
    if (tone === 'strategy') {
        return {
            badge: 'border-fuchsia-400/30 bg-fuchsia-400/12 text-fuchsia-100',
            iconWrap: 'bg-fuchsia-500/15 text-fuchsia-200',
        };
    }

    return toneClasses(tone);
}

function workflowIcon(tone: WorkflowProject['dashboard_tone']) {
    switch (tone) {
        case 'review':
            return LoaderCircle;
        case 'ready':
            return Rocket;
        case 'cover':
            return ImagePlus;
        case 'naming':
            return PencilLine;
        case 'published':
            return Sparkles;
        default:
            return FolderOpen;
    }
}

function recommendationIcon(tone: AssistantRecommendation['tone']) {
    if (tone === 'strategy') {
        return Sparkles;
    }

    return workflowIcon(tone);
}

function AttentionCard({ item }: { item: DashboardAttentionItem }) {
    const href = resolveDashboardLink(item.target, item.project_id);

    return (
        <Link href={href} className="group block h-full" prefetch>
            <Card className="h-full gap-4 rounded-[1.5rem] border-slate-200/85 bg-white py-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition hover:border-primary/25 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-primary/20 dark:hover:bg-white/[0.05] sm:py-5">
                <CardHeader className="space-y-3 px-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                                {item.label}
                            </CardTitle>
                            <p className="mt-3 text-4xl font-semibold tracking-tight">
                                {item.count}
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85"
                        >
                            {item.count === 0 ? 'Clear' : 'Action'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-5">
                    <p className="text-sm leading-6 text-muted-foreground">
                        {item.hint}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition group-hover:text-primary">
                        {item.cta_label}
                        <ArrowRight className="size-4" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function WorkflowProjectCardMedia({
    project,
    tone,
    showMobileTitle = false,
}: {
    project: WorkflowProject;
    tone: ReturnType<typeof toneClasses>;
    showMobileTitle?: boolean;
}) {
    return (
        <div className="relative aspect-[16/10] overflow-hidden bg-muted sm:aspect-[4/3]">
            {project.cover_image_url ? (
                <img
                    src={project.cover_image_url}
                    alt={project.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
            ) : (
                <div className="flex size-full items-end justify-start bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_bottom,rgba(248,113,113,0.14),transparent_38%),rgba(255,255,255,0.02)] p-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                            Workspace preview
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                            {project.name}
                        </p>
                    </div>
                </div>
            )}

            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                    <p className={imageEyebrowClass}>
                        {project.category}
                    </p>
                    <Badge
                        variant="outline"
                        className={cn(
                            imageBadgeClass,
                            'px-2.5 text-[10px] tracking-[0.08em] uppercase',
                        )}
                    >
                        {project.dashboard_mode_label}
                    </Badge>
                </div>
                <Badge variant="outline" className={tone.imageBadge}>
                    {project.dashboard_status}
                </Badge>
            </div>

            {showMobileTitle ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 py-4">
                    <h3 className="line-clamp-2 text-2xl font-semibold tracking-tight text-white">
                        {project.name}
                    </h3>
                </div>
            ) : null}
        </div>
    );
}

function WorkflowProjectCardDetails({
    project,
    tone,
    Icon,
    compact = false,
}: {
    project: WorkflowProject;
    tone: ReturnType<typeof toneClasses>;
    Icon: ReturnType<typeof workflowIcon>;
    compact?: boolean;
}) {
    return (
        <>
            <CardHeader
                className={cn(
                    'flex flex-col justify-between space-y-3 px-4 pb-0 sm:px-5',
                    compact
                        ? 'pt-4'
                        : 'min-h-[8.5rem] pt-4 sm:min-h-[9.75rem] sm:pt-5',
                )}
            >
                <div className="min-w-0 space-y-1.5">
                    <CardTitle
                        className={cn(
                            'line-clamp-2 text-xl leading-tight tracking-tight',
                            compact ? 'hidden' : 'min-h-[3rem] sm:min-h-[3.5rem]',
                        )}
                    >
                        {project.name}
                    </CardTitle>
                    <CardDescription className="hidden">
                        {project.category} · {project.dashboard_mode_label}
                    </CardDescription>
                    <p
                        className={cn(
                            'text-sm leading-6 text-muted-foreground',
                            compact
                                ? 'line-clamp-2'
                                : 'line-clamp-2 min-h-[3.75rem] sm:line-clamp-3 sm:min-h-[4.5rem]',
                        )}
                    >
                        {project.description ??
                            'Add a short description to give this project a clearer point of view.'}
                    </p>
                </div>
            </CardHeader>
            <CardContent
                className={cn(
                    'flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5',
                    compact
                        ? 'gap-4'
                        : 'min-h-[12rem] sm:min-h-[13.5rem] xl:min-h-[15.25rem]',
                )}
            >
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full border border-primary/28 bg-primary/[0.045] px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                            {project.asset_count ?? 0} assets
                            </span>
                            <span className="rounded-full border border-primary/28 bg-primary/[0.045] px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                            {project.analyzed_assets_count} analyzed
                            </span>
                            <span className="rounded-full border border-primary/28 bg-primary/[0.045] px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                            {project.pending_assets_count +
                                project.unnamed_assets_count}{' '}
                            need attention
                            </span>
                        </div>

                    <p
                        className={cn(
                            'text-sm leading-6 text-muted-foreground',
                            compact ? 'line-clamp-2' : 'line-clamp-2 sm:line-clamp-3',
                        )}
                    >
                        {project.dashboard_action_note}
                    </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-white/10 sm:pt-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex size-10 items-center justify-center rounded-full',
                                tone.iconWrap,
                            )}
                        >
                            <Icon
                                className={cn(
                                    'size-4',
                                    project.dashboard_tone === 'review'
                                        ? 'animate-spin'
                                        : '',
                                )}
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium">
                                {project.dashboard_action_label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {project.dashboard_status}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={show(project.id)}
                        className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
                        prefetch
                    >
                        Open
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </CardContent>
        </>
    );
}

function DesktopWorkflowProjectCard({
    project,
}: {
    project: WorkflowProject;
}) {
    const tone = toneClasses(project.dashboard_tone);
    const Icon = workflowIcon(project.dashboard_tone);

    return (
        <Link href={show(project.id)} className="group block h-full" prefetch>
            <Card className="h-full gap-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-primary/25 hover:bg-white dark:border-white/10 dark:bg-card/85 dark:shadow-none dark:hover:border-primary/20 dark:hover:bg-card">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted sm:aspect-[4/3]">
                    {project.cover_image_url ? (
                        <img
                            src={project.cover_image_url}
                            alt={project.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex size-full items-end justify-start bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_bottom,rgba(248,113,113,0.14),transparent_38%),rgba(255,255,255,0.02)] p-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                    Workspace preview
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    {project.name}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4 pt-4 sm:px-4 sm:pt-4">
                        <div className="flex flex-wrap items-center gap-2">
                              <p className={imageEyebrowClass}>
                                  {project.category}
                              </p>
                              <Badge
                                  variant="outline"
                                  className={cn(
                                      imageBadgeClass,
                                      'px-2.5 text-[10px] tracking-[0.08em] uppercase',
                                  )}
                              >
                                  {project.dashboard_mode_label}
                              </Badge>
                          </div>
                          <Badge variant="outline" className={tone.imageBadge}>
                              {project.dashboard_status}
                          </Badge>
                      </div>
                </div>

                <CardHeader className="flex min-h-[8.5rem] flex-col justify-between space-y-3 px-4 pt-4 pb-0 sm:min-h-[9.75rem] sm:px-5 sm:pt-5">
                    <div className="min-w-0 space-y-1.5">
                        <CardTitle className="line-clamp-2 min-h-[3rem] text-xl leading-tight tracking-tight sm:min-h-[3.5rem]">
                            {project.name}
                        </CardTitle>
                        <CardDescription className="hidden">
                            {project.category} · {project.dashboard_mode_label}
                        </CardDescription>
                        <p className="line-clamp-2 min-h-[3.75rem] text-sm leading-6 text-muted-foreground sm:line-clamp-3 sm:min-h-[4.5rem]">
                            {project.description ??
                                'Add a short description to give this project a clearer point of view.'}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="flex min-h-[12rem] flex-1 flex-col px-4 py-4 sm:min-h-[13.5rem] sm:px-5 sm:py-5 xl:min-h-[15.25rem]">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full border border-primary/28 bg-primary/[0.045] px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                                {project.asset_count ?? 0} assets
                            </span>
                            <span className="rounded-full border border-primary/28 bg-primary/[0.045] px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                                {project.analyzed_assets_count} analyzed
                            </span>
                            <span className="rounded-full border border-primary/28 bg-primary/[0.045] px-2.5 py-1 text-slate-700 dark:border-white/10 dark:bg-black/[0.15] dark:text-muted-foreground">
                                {project.pending_assets_count + project.unnamed_assets_count} need attention
                            </span>
                        </div>

                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground sm:line-clamp-3">
                            {project.dashboard_action_note}
                        </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-white/10 sm:pt-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-full',
                                    tone.iconWrap,
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'size-4',
                                        project.dashboard_tone === 'review'
                                            ? 'animate-spin'
                                            : '',
                                    )}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium">
                                    {project.dashboard_action_label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {project.dashboard_status}
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-foreground transition group-hover:text-primary">
                            Open
                            <ArrowRight className="size-4" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function WorkflowProjectCard({
    project,
    defaultOpen = false,
}: {
    project: WorkflowProject;
    defaultOpen?: boolean;
}) {
    const tone = toneClasses(project.dashboard_tone);
    const Icon = workflowIcon(project.dashboard_tone);
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <>
            <div className="sm:hidden">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <Card className="gap-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white py-0 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-card/85 dark:shadow-none">
                        <WorkflowProjectCardMedia
                            project={project}
                            tone={tone}
                            showMobileTitle
                        />
                        <div className="border-t border-slate-200 dark:border-white/10">
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-950 dark:text-white">
                                            {isOpen
                                                ? 'Hide project details'
                                                : 'View project details'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {project.dashboard_action_label}
                                        </p>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                                            isOpen ? 'rotate-180' : '',
                                        )}
                                    />
                                </button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            <WorkflowProjectCardDetails
                                project={project}
                                tone={tone}
                                Icon={Icon}
                                compact
                            />
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            </div>

            <div className="hidden h-full sm:block">
                <DesktopWorkflowProjectCard project={project} />
            </div>
        </>
    );
}

export default function Dashboard({
    primaryAction,
    stats,
    attentionItems,
    workflowProjects,
    assistantPanel,
}: {
    primaryAction: DashboardPrimaryAction;
    stats: DashboardStat[];
    attentionItems: DashboardAttentionItem[];
    workflowProjects: WorkflowProject[];
    assistantPanel: AssistantPanel;
}) {
    const { workspace } = usePage().props;
    const assistantPrimaryTone = recommendationToneClasses(
        assistantPanel.primary.tone,
    );
    const AssistantPrimaryIcon = recommendationIcon(
        assistantPanel.primary.tone,
    );
    const assistantFollowUps = assistantPanel.follow_ups.slice(0, 1);
    const portfolioUrl =
        typeof workspace?.portfolio_url === 'string'
            ? workspace.portfolio_url
            : null;
    const heroProject =
        primaryAction.target === 'project' && primaryAction.project_id !== null
            ? workflowProjects.find(
                  (project) => project.id === primaryAction.project_id,
              ) ?? null
            : null;
    const heroUsesImage = Boolean(heroProject?.cover_image_url);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-x-clip p-3 sm:gap-8 sm:p-6">
                <section
                    className={cn(
                        'relative overflow-hidden rounded-[1.75rem] border border-primary/22 bg-[#faf7ff] px-4 py-4 shadow-[0_24px_64px_rgba(99,102,241,0.07)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_30px_120px_rgba(0,0,0,0.24)] sm:rounded-[2rem] sm:px-7 sm:py-6',
                        heroUsesImage
                            ? 'bg-[#faf7ff]'
                            : 'bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]',
                    )}
                >
                    {heroProject?.cover_image_url ? (
                        <>
                            <img
                                src={heroProject.cover_image_url}
                                alt={heroProject.name}
                                className="absolute inset-0 size-full object-cover opacity-[0.82] saturate-100 dark:opacity-100 dark:saturate-100"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(250,247,255,0.74)_0%,rgba(250,247,255,0.68)_28%,rgba(250,247,255,0.44)_54%,rgba(250,247,255,0.26)_74%,rgba(250,247,255,0.18)_100%)] dark:bg-[linear-gradient(110deg,rgba(7,9,20,0.92)_0%,rgba(7,9,20,0.82)_38%,rgba(7,9,20,0.72)_58%,rgba(7,9,20,0.82)_100%)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.08),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.06))] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_34%)]" />
                        </>
                    ) : null}

                    <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2.5 sm:space-y-3">
                                <p className="text-xs tracking-[0.32em] text-slate-500 uppercase dark:text-muted-foreground">
                                    {primaryAction.eyebrow}
                                </p>
                                <div className="space-y-2.5">
                                    <h1 className="max-w-2xl text-[2rem] leading-[0.98] font-semibold tracking-tight text-slate-950 sm:text-4xl xl:text-[2.65rem] xl:leading-[1.02] dark:text-foreground">
                                        {primaryAction.title}
                                    </h1>
                                    <p className="max-w-xl text-sm leading-6 text-slate-700 sm:text-[15px] dark:text-muted-foreground">
                                        {primaryAction.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                                <Button className="w-full rounded-full px-5 sm:w-auto" size="sm" asChild>
                                    <Link
                                        href={resolveDashboardLink(
                                            primaryAction.target,
                                            primaryAction.project_id,
                                        )}
                                        prefetch
                                    >
                                        {primaryAction.cta_label}
                                    </Link>
                                </Button>

                                <PublicProfileActions portfolioUrl={portfolioUrl} />
                            </div>
                        </div>

                        <Card className="gap-3 rounded-[1.5rem] border border-primary/18 bg-white/84 py-3.5 text-slate-950 shadow-[0_14px_34px_rgba(99,102,241,0.05)] backdrop-blur-md dark:border-white/10 dark:bg-black/65 dark:text-white dark:shadow-none sm:rounded-[1.75rem] sm:py-4">
                            <CardHeader className="space-y-2 px-4">
                                <div className="flex items-center gap-2 text-sm text-slate-950 dark:text-foreground">
                                    <Sparkles className="size-4 text-primary" />
                                    <CardTitle>{assistantPanel.title}</CardTitle>
                                </div>
                                <CardDescription className="line-clamp-2 leading-6 text-slate-600 dark:text-muted-foreground sm:line-clamp-3">
                                    {assistantPanel.summary}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 px-4 sm:space-y-3.5">
                                <div className="space-y-3 rounded-[1.35rem] border border-primary/14 bg-white/80 p-3 sm:rounded-[1.5rem] sm:p-3.5 dark:border-white/10 dark:bg-black/30">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-full',
                                                assistantPrimaryTone.iconWrap,
                                            )}
                                        >
                                            <AssistantPrimaryIcon className="size-4" />
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                {assistantPanel.primary.eyebrow}
                                            </p>
                                            <p className="text-sm font-medium text-slate-950 dark:text-foreground">
                                                {assistantPanel.primary.title}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-muted-foreground sm:line-clamp-3">
                                        {assistantPanel.primary.reason}
                                    </p>

                                    <Link
                                        href={resolveDashboardLink(
                                            assistantPanel.primary.target,
                                            assistantPanel.primary.project_id,
                                        )}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-950 transition hover:text-primary dark:text-foreground"
                                        prefetch
                                    >
                                        {assistantPanel.primary.cta_label}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>

                                {assistantFollowUps.length > 0 ? (
                                    <div className="space-y-2.5">
                                        <p className="text-[11px] tracking-[0.18em] text-slate-500 uppercase dark:text-muted-foreground">
                                            Also worth doing
                                        </p>
                                        <div className="space-y-2.5">
                                            {assistantFollowUps.map(
                                                (recommendation) => {
                                                    const followUpTone =
                                                        recommendationToneClasses(
                                                            recommendation.tone,
                                                        );
                                                    const FollowUpIcon =
                                                        recommendationIcon(
                                                            recommendation.tone,
                                                        );

                                                    return (
                                                        <Link
                                                            key={`${recommendation.title}-${recommendation.project_id ?? recommendation.target}`}
                                                            href={resolveDashboardLink(
                                                                recommendation.target,
                                                                recommendation.project_id,
                                                            )}
                                                            className="flex items-start gap-3 rounded-2xl border border-primary/14 bg-white/88 px-3 py-2.5 transition hover:border-primary/24 hover:bg-white dark:border-white/10 dark:bg-black/25 dark:hover:border-primary/20 dark:hover:bg-black/35"
                                                            prefetch
                                                        >
                                                            <div
                                                                className={cn(
                                                                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                                                                    followUpTone.iconWrap,
                                                                )}
                                                            >
                                                                <FollowUpIcon className="size-3.5" />
                                                            </div>
                                                            <div className="min-w-0 space-y-1">
                                                                <p className="text-sm font-medium text-slate-950 dark:text-foreground">
                                                                    {recommendation.title}
                                                                </p>
                                                                <p className="line-clamp-2 text-xs leading-5 text-slate-600 dark:text-muted-foreground">
                                                                    {recommendation.reason}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-slate-950 dark:text-foreground">
                                        <Sparkles className="size-4 text-primary" />
                                        <span>
                                            Use the next action to keep
                                            momentum.
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Needs attention
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            The shortest path back into meaningful work across
                            your active projects.
                        </p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-3">
                        {attentionItems.map((item) => (
                            <div
                                key={item.label}
                                className="min-w-[17rem] shrink-0 snap-start md:min-w-0 md:shrink"
                            >
                                <AttentionCard item={item} />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Continue working
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Prioritized projects that are most worth reopening
                            right now.
                        </p>
                    </div>

                    {workflowProjects.length > 0 ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {workflowProjects.map((project, index) => (
                                <WorkflowProjectCard
                                    key={project.id}
                                    project={project}
                                    defaultOpen={index === 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-white/15 dark:bg-white/[0.03]">
                            <p className="text-sm text-slate-600 dark:text-muted-foreground">
                                No projects yet. Create one to start shaping
                                your portfolio.
                            </p>
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Studio pulse
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            A tighter read on how much of your portfolio is
                            still in motion.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <Card
                                key={stat.label}
                                className="min-h-[8.5rem] gap-3 rounded-[1.5rem] border-slate-200/85 bg-white py-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none sm:min-h-[9.5rem] sm:gap-4 sm:py-5"
                            >
                                <CardHeader className="px-4 sm:px-5">
                                    <CardTitle className="text-xs tracking-[0.24em] text-slate-500 uppercase dark:text-muted-foreground">
                                        {stat.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-auto space-y-2 px-4 sm:space-y-3 sm:px-5">
                                    <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-foreground sm:text-4xl">
                                        {stat.value}
                                    </p>
                                    <p className="hidden text-sm leading-6 text-slate-600 dark:text-muted-foreground sm:block">
                                        {stat.hint}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
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
