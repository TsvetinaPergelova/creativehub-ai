import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    FolderOpen,
    ImagePlus,
    LoaderCircle,
    PencilLine,
    Rocket,
    Sparkles,
} from 'lucide-react';
import { create, index as projects, show } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
                iconWrap: 'bg-violet-500/15 text-violet-200',
            };
        case 'ready':
            return {
                badge: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-100',
                iconWrap: 'bg-emerald-500/15 text-emerald-200',
            };
        case 'cover':
            return {
                badge: 'border-sky-400/30 bg-sky-400/12 text-sky-100',
                iconWrap: 'bg-sky-500/15 text-sky-200',
            };
        case 'naming':
            return {
                badge: 'border-amber-400/30 bg-amber-400/12 text-amber-100',
                iconWrap: 'bg-amber-500/15 text-amber-200',
            };
        case 'published':
            return {
                badge: 'border-white/15 bg-white/[0.08] text-white',
                iconWrap: 'bg-white/[0.08] text-white/90',
            };
        default:
            return {
                badge: 'border-white/15 bg-white/[0.08] text-white',
                iconWrap: 'bg-white/[0.08] text-white/90',
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
            <Card className="h-full gap-4 rounded-[1.5rem] border-white/10 bg-white/[0.04] py-5 shadow-none transition hover:border-primary/20 hover:bg-white/[0.05]">
                <CardHeader className="space-y-3 px-5">
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
                            className="border-white/10 bg-white/[0.06] text-white/85"
                        >
                            {item.count === 0 ? 'Clear' : 'Action'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 px-5">
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

function WorkflowProjectStats({
    project,
}: {
    project: WorkflowProject;
}) {
    return (
        <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/[0.15] px-4 py-3">
                <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                    Assets
                </p>
                <p className="mt-2 font-semibold text-foreground">
                    {project.asset_count ?? 0}
                </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/[0.15] px-4 py-3">
                <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                    Analyzed
                </p>
                <p className="mt-2 font-semibold text-foreground">
                    {project.analyzed_assets_count}
                </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/[0.15] px-4 py-3">
                <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                    Needs attention
                </p>
                <p className="mt-2 font-semibold text-foreground">
                    {project.pending_assets_count + project.unnamed_assets_count}
                </p>
            </div>
        </div>
    );
}

function WorkflowProjectCard({ project }: { project: WorkflowProject }) {
    const tone = toneClasses(project.dashboard_tone);
    const Icon = workflowIcon(project.dashboard_tone);

    return (
        <Link href={show(project.id)} className="group block h-full" prefetch>
            <Card className="h-full gap-0 rounded-[1.75rem] border-white/10 bg-white/[0.04] py-0 shadow-none transition hover:border-primary/20 hover:bg-white/[0.05]">
            <CardHeader className="space-y-4 px-5 pt-5 pb-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                        {project.category}
                    </p>
                    <Badge
                        variant="outline"
                        className="border-white/10 bg-white/[0.05] text-[10px] tracking-[0.14em] uppercase text-white/80"
                    >
                        {project.dashboard_mode_label}
                    </Badge>
                </div>

                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                        <CardTitle className="text-xl tracking-tight">
                            {project.name}
                        </CardTitle>
                        <CardDescription className="hidden">
                            {project.category} · {project.dashboard_mode_label}
                        </CardDescription>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {project.description ??
                                'Add a short description to give this project a clearer point of view.'}
                        </p>
                    </div>
                    <Badge variant="outline" className={tone.badge}>
                        {project.dashboard_status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-5 px-5 py-5">
                <WorkflowProjectStats project={project} />

                <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/[0.2] p-4">
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

                    <p className="text-sm leading-6 text-muted-foreground">
                        {project.dashboard_action_note}
                    </p>

                    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition group-hover:text-primary">
                        {project.dashboard_action_label}
                        <ArrowRight className="size-4" />
                    </div>
                </div>
            </CardContent>
            </Card>
        </Link>
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
    const assistantPrimaryTone = recommendationToneClasses(
        assistantPanel.primary.tone,
    );
    const AssistantPrimaryIcon = recommendationIcon(
        assistantPanel.primary.tone,
    );
    const assistantFollowUps = assistantPanel.follow_ups.slice(0, 1);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-x-clip p-3 sm:gap-8 sm:p-6">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)] px-5 py-5 shadow-[0_30px_120px_rgba(0,0,0,0.24)] sm:px-7 sm:py-6">
                    <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <p className="text-xs tracking-[0.32em] text-muted-foreground uppercase">
                                    {primaryAction.eyebrow}
                                </p>
                                <div className="space-y-2.5">
                                    <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl xl:text-[3.2rem] xl:leading-[1.02]">
                                        {primaryAction.title}
                                    </h1>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                                        {primaryAction.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                                <Button className="rounded-full px-5" size="sm" asChild>
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
                            </div>
                        </div>

                        <Card className="gap-3 rounded-[1.75rem] border-white/10 bg-black/[0.25] py-4 shadow-none">
                            <CardHeader className="space-y-2.5 px-4">
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Sparkles className="size-4 text-primary" />
                                    <CardTitle>{assistantPanel.title}</CardTitle>
                                </div>
                                <CardDescription className="line-clamp-3 leading-6">
                                    {assistantPanel.summary}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3.5 px-4">
                                <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3.5">
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
                                            <p className="text-sm font-medium">
                                                {assistantPanel.primary.title}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                                        {assistantPanel.primary.reason}
                                    </p>

                                    <Link
                                        href={resolveDashboardLink(
                                            assistantPanel.primary.target,
                                            assistantPanel.primary.project_id,
                                        )}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
                                        prefetch
                                    >
                                        {assistantPanel.primary.cta_label}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>

                                {assistantFollowUps.length > 0 ? (
                                    <div className="space-y-2.5">
                                        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
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
                                                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-primary/20 hover:bg-white/[0.05]"
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
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {recommendation.title}
                                                                </p>
                                                                <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
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
                                    <div className="flex items-center gap-2 text-sm text-foreground">
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

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {attentionItems.map((item) => (
                            <AttentionCard key={item.label} item={item} />
                        ))}
                    </div>
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

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <Card
                                key={stat.label}
                                className="gap-4 rounded-[1.5rem] border-white/10 bg-white/[0.04] py-5 shadow-none"
                            >
                                <CardHeader className="px-5">
                                    <CardTitle className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
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
                        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                            {workflowProjects.map((project) => (
                                <WorkflowProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                No projects yet. Create one to start shaping
                                your portfolio.
                            </p>
                        </div>
                    )}
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
