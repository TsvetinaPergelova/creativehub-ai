import { Head, Link, usePoll } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronDown, LoaderCircle, PencilLine, Sparkles } from 'lucide-react';
import { edit, index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import ProjectAiSidebar from '@/components/projects/project-ai-sidebar';
import ProjectAssetGrid from '@/components/projects/project-asset-grid';
import ProjectCoverPicker from '@/components/projects/project-cover-picker';
import ProjectCuratorPresence from '@/components/projects/project-curator-presence';
import ProjectSharePanel from '@/components/projects/project-share-panel';
import ProjectUploadReview from '@/components/projects/project-upload-review';
import ProjectUploadDropzone from '@/components/projects/project-upload-dropzone';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Project, ProjectAsset, ProjectSharePanel as ProjectSharePanelData } from '@/types';
import type { ProjectProcessing } from '@/types';

type CuratorSummary = {
    assistant_name: string;
    summary: string;
};

export default function ShowProject({
    project,
    curator,
    highlights,
    processing,
    recentlyUploadedAssetIds,
    sharePanel,
}: {
    project: Project;
    curator: CuratorSummary;
    highlights: ProjectAsset[];
    processing: ProjectProcessing;
    recentlyUploadedAssetIds: number[];
    sharePanel: ProjectSharePanelData;
}) {
    const [isPulseOpen, setIsPulseOpen] = useState(true);
    const assets = project.assets ?? [];
    const analyzedAssets = assets.filter((asset) => asset.analysis);
    const latestReviewedAsset = [...analyzedAssets]
        .sort((leftAsset, rightAsset) => rightAsset.sort_order - leftAsset.sort_order)
        .at(0) ?? null;
    const pendingAssets = assets.filter((asset) => !asset.analysis);
    const hasPendingAnalysis = pendingAssets.length > 0;
    const analysisCoverage = assets.length === 0
        ? 0
        : Math.round((analyzedAssets.length / assets.length) * 100);
    const pulseStatus = hasPendingAnalysis
        ? 'Still curating'
        : project.status === 'published'
          ? 'Ready to share'
          : 'Ready for the next step';
    const heroStats = [
        {
            label: 'Assets',
            value: assets.length,
            hint: 'Uploaded to this set',
        },
        {
            label: 'Analyzed',
            value: analyzedAssets.length,
            hint: 'Reviewed by Curator',
        },
        {
            label: 'Highlights',
            value: highlights.length,
            hint: 'Strongest frames surfaced',
        },
        {
            label: 'Pending',
            value: pendingAssets.length,
            hint: hasPendingAnalysis
                ? 'Still processing'
                : 'Nothing waiting in queue',
        },
    ];
    const { start, stop } = usePoll(
        2500,
        {
            only: ['project', 'highlights', 'curator', 'processing'],
            preserveScroll: true,
        },
        {
            autoStart: false,
            keepAlive: true,
        },
    );

    useEffect(() => {
        if (hasPendingAnalysis) {
            start();

            return stop;
        }

        stop();
    }, [hasPendingAnalysis, start, stop]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1536px)');

        const syncPulseState = (): void => {
            setIsPulseOpen(mediaQuery.matches);
        };

        syncPulseState();
        mediaQuery.addEventListener('change', syncPulseState);

        return () => {
            mediaQuery.removeEventListener('change', syncPulseState);
        };
    }, []);

    return (
        <>
            <Head title={project.name} />

            <div className="space-y-6 p-4 sm:p-6">
                <section className="relative overflow-hidden rounded-xl border bg-card/70 px-6 py-10 shadow-sm sm:px-8 sm:py-12">
                    {project.cover_image_url ? (
                        <>
                            <img
                                src={project.cover_image_url}
                                alt={`${project.name} cover`}
                                className="pointer-events-none absolute inset-0 size-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,6,17,0.88),rgba(6,6,17,0.6),rgba(6,6,17,0.82))]" />
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.18),transparent_40%)]" />
                        </>
                    ) : (
                        <>
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_38%)]" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.03),transparent)]" />
                        </>
                    )}
                    <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_34rem] xl:items-stretch">
                        <div className="flex min-w-0 flex-col gap-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-xs uppercase tracking-[0.34em] text-muted-foreground">
                                        {project.category}
                                    </p>
                                    <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                                        {project.name}
                                    </h1>
                                    <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                                        {project.description ??
                                            'Add a description to help frame this project before upload.'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                            Project state
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className="capitalize border border-primary/35 bg-primary/85 text-primary-foreground shadow-sm backdrop-blur-md">
                                                {project.status}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="capitalize border-white/15 bg-background/70 text-foreground shadow-sm backdrop-blur-md"
                                            >
                                                {project.visibility}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="border-white/15 bg-background/70 text-foreground shadow-sm backdrop-blur-md"
                                            >
                                                {pulseStatus}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {project.cover_image_url
                                                ? 'Cover image selected from your asset library.'
                                                : 'Choose a cover image to personalize this project.'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant="outline"
                                                className="border-white/15 bg-background/70 text-foreground shadow-sm backdrop-blur-md"
                                            >
                                                {project.cover_image_url
                                                    ? 'Hero customized'
                                                    : 'Using default hero'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <Collapsible
                            open={isPulseOpen}
                            onOpenChange={setIsPulseOpen}
                            className="self-stretch"
                        >
                            <Card className="gap-0 overflow-hidden border-white/10 bg-background/72 py-0 shadow-xl backdrop-blur">
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full text-left transition hover:bg-white/[0.03] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                                    >
                                        <CardHeader className="px-6 pb-5 pt-6">
                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <CardTitle className="text-2xl tracking-tight">
                                                        Project pulse
                                                    </CardTitle>
                                                    <CardDescription className="max-w-sm text-sm leading-6">
                                                        Your working set, condensed into the numbers and readiness signals that matter right now.
                                                    </CardDescription>
                                                </div>

                                                <div className="rounded-xl border bg-background/45 px-4 py-3 backdrop-blur-sm">
                                                    <div className="grid gap-3">
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                                                Assets
                                                            </p>
                                                            <p className="mt-1 font-semibold">
                                                                {assets.length}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                                                Analyzed
                                                            </p>
                                                            <p className="mt-1 font-semibold">
                                                                {analyzedAssets.length}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                                                Highlights
                                                            </p>
                                                            <p className="mt-1 font-semibold">
                                                                {highlights.length}
                                                            </p>
                                                        </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                                                    Status
                                                                </p>
                                                                <p className="mt-1 text-base font-semibold">
                                                                    {pulseStatus}
                                                                </p>
                                                            </div>

                                                            <ChevronDown
                                                                className={cn(
                                                                    'size-4 shrink-0 text-muted-foreground transition-transform',
                                                                    isPulseOpen && 'rotate-180',
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </button>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="grid gap-3 border-t px-6 py-5 sm:grid-cols-2">
                                        {heroStats.map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-xl border bg-background/65 p-3.5"
                                            >
                                                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                                    {stat.label}
                                                </p>
                                                <p className="mt-2 text-3xl font-semibold tracking-tight">
                                                    {stat.value}
                                                </p>
                                                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                                    {stat.hint}
                                                </p>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardContent className="space-y-3 border-t px-6 pb-6 pt-5">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <ProjectCoverPicker
                                                assets={assets}
                                                coverAssetId={project.cover_asset_id}
                                                projectId={project.id}
                                            />

                                            <Button
                                                variant="outline"
                                                className="h-11"
                                                asChild
                                            >
                                                <Link href={edit(project.id)} prefetch>
                                                    <PencilLine className="mr-2 size-4" />
                                                    Edit details
                                                </Link>
                                            </Button>
                                        </div>

                                        <div className="rounded-xl border bg-background/45 p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Set readiness
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {pulseStatus}
                                                    </p>
                                                </div>
                                                <p className="text-lg font-semibold">
                                                    {analysisCoverage}%
                                                </p>
                                            </div>
                                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                                    style={{ width: `${analysisCoverage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>

                        <div className="grid gap-3 md:grid-cols-3 xl:col-span-2">
                            <div className="rounded-xl border bg-background/45 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Status
                                </p>
                                <p className="mt-2 text-lg font-semibold capitalize">
                                    {project.status}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {project.visibility === 'public'
                                        ? 'Visible outside your workspace'
                                        : 'Still private inside your workspace'}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/45 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Analysis coverage
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    {analysisCoverage}%
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {analyzedAssets.length} of {assets.length} assets reviewed
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/45 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                    Highlights ready
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    {highlights.length}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {hasPendingAnalysis
                                        ? 'More may appear as analysis finishes'
                                        : 'Best frames are ready for review'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem] xl:items-start">
                    <div className="space-y-6">
                        <section className="rounded-xl border bg-card/50 p-5 sm:p-6">
                            <div className="flex flex-col gap-6 border-b pb-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                        Project workflow
                                    </p>
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        Build the set in order
                                    </h2>
                                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Start by adding images, name the newest
                                        ones while they are easy to recognize,
                                        and let Curator process the set in the
                                        background.
                                    </p>
                                </div>

                                <div className="grid w-full gap-3 text-sm sm:grid-cols-3 2xl:w-auto 2xl:min-w-72">
                                    <div className="rounded-xl border bg-background/60 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                            Uploaded
                                        </p>
                                        <p className="mt-2 text-xl font-semibold">
                                            {assets.length}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border bg-background/60 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                            Reviewed
                                        </p>
                                        <p className="mt-2 text-xl font-semibold">
                                            {analyzedAssets.length}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border bg-background/60 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                            Pending
                                        </p>
                                        <p className="mt-2 text-xl font-semibold">
                                            {pendingAssets.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 pt-5">
                                <ProjectUploadDropzone projectId={project.id} />

                                <ProjectUploadReview
                                    assets={assets}
                                    projectId={project.id}
                                    recentlyUploadedAssetIds={recentlyUploadedAssetIds}
                                />

                                <div className="rounded-xl border bg-background/55 p-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                                                    {processing.is_reviewing ? (
                                                        <LoaderCircle className="size-4 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="size-4" />
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium">
                                                            {processing.headline}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {processing.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {processing.current_asset_label && (
                                                            <div className="max-w-full rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary">
                                                                <span className="font-medium">Reviewing now:</span>{' '}
                                                                <span
                                                                    className="inline-block max-w-[min(100%,34rem)] truncate align-bottom text-primary/90"
                                                                    title={processing.current_asset_label}
                                                                >
                                                                    {processing.current_asset_label}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {processing.pending_count > 1 && (
                                                            <Badge variant="outline">
                                                                {processing.pending_count - 1} more waiting behind it
                                                            </Badge>
                                                        )}
                                                        {!processing.is_reviewing && (
                                                            <Badge variant="outline">
                                                                Ready for your next upload
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {processing.pending_asset_labels.length > 1 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                                Up next
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {processing.pending_asset_labels
                                                                    .slice(1)
                                                                    .map((label) => (
                                                                        <Badge
                                                                            key={label}
                                                                            variant="outline"
                                                                            className="max-w-full"
                                                                            title={label}
                                                                        >
                                                                            <span className="inline-block max-w-72 truncate align-bottom">
                                                                                {label}
                                                                            </span>
                                                                        </Badge>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="text-sm text-muted-foreground">
                                                        {processing.expectation}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="rounded-xl border bg-background/70 px-4 py-3 text-sm xl:min-w-56">
                                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                    Progress
                                                </p>
                                                <p className="mt-2 font-semibold">
                                                    {processing.coverage_percent}% reviewed
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {processing.reviewed_count} of {processing.total_count} images complete
                                                </p>
                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                                        style={{ width: `${processing.coverage_percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {latestReviewedAsset ? (
                                            <div className="rounded-xl border bg-background/70 p-4">
                                                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                                                    <div className="space-y-4">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge variant="outline" className="border-primary/25 bg-primary/8 text-primary">
                                                                Latest insight snapshot
                                                            </Badge>
                                                            {latestReviewedAsset.analysis?.is_highlight ? (
                                                                <Badge variant="outline" className="border-amber-400/30 bg-amber-400/10 text-amber-200">
                                                                    Highlight candidate
                                                                </Badge>
                                                            ) : null}
                                                        </div>

                                                        <div className="rounded-xl border border-primary/15 bg-primary/6 p-4">
                                                            <p className="text-sm font-semibold">
                                                                {latestReviewedAsset.title ?? latestReviewedAsset.filename}
                                                            </p>
                                                            <p className="mt-2 text-sm leading-7 text-foreground/90">
                                                                {latestReviewedAsset.analysis?.critique
                                                                    ?? latestReviewedAsset.analysis?.alt_text
                                                                    ?? 'Curator has already attached notes to the latest reviewed frame.'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-white/10 bg-background/55 p-4">
                                                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                                            Curator tags
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {(latestReviewedAsset.analysis?.tags ?? []).length > 0 ? (
                                                                (latestReviewedAsset.analysis?.tags ?? [])
                                                                    .slice(0, 6)
                                                                    .map((tag) => (
                                                                        <Badge
                                                                            key={tag}
                                                                            variant="outline"
                                                                            className="border-white/10 bg-background/70"
                                                                        >
                                                                            {tag}
                                                                        </Badge>
                                                                    ))
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Curator did not attach tags to this frame yet.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                    <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-4">
                                                        <p className="text-[11px] uppercase tracking-[0.18em] text-sky-100/80">
                                                            Alt text
                                                        </p>
                                                        <p className="mt-3 text-sm leading-7 text-foreground/90">
                                                            {latestReviewedAsset.analysis?.alt_text ?? 'No alt text yet.'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-fuchsia-400/15 bg-fuchsia-400/5 p-4">
                                                        <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-100/80">
                                                            Mood
                                                        </p>
                                                        <p className="mt-3 text-sm font-medium capitalize text-foreground">
                                                            {latestReviewedAsset.analysis?.mood ?? 'Not set'}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            'rounded-xl border p-4',
                                                            latestReviewedAsset.analysis?.is_highlight
                                                                ? 'border-amber-400/20 bg-amber-400/6'
                                                                : 'border-emerald-400/15 bg-emerald-400/5',
                                                        )}
                                                    >
                                                        <p
                                                            className={cn(
                                                                'text-[11px] uppercase tracking-[0.18em]',
                                                                latestReviewedAsset.analysis?.is_highlight
                                                                    ? 'text-amber-100/80'
                                                                    : 'text-emerald-100/80',
                                                            )}
                                                        >
                                                            Highlight status
                                                        </p>
                                                        <p className="mt-3 text-sm font-medium text-foreground">
                                                            {latestReviewedAsset.analysis?.is_highlight
                                                                ? 'Marked as a strong frame'
                                                                : 'Supporting frame'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Collapsible defaultOpen>
                            <div className="rounded-xl border bg-card/60 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold tracking-tight">
                                            Asset library
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Review the raw upload set before AI
                                            analysis and curation layers are
                                            layered in.
                                        </p>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button type="button" variant="ghost" size="icon">
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent className="pt-5">
                                    <ProjectAssetGrid assets={assets} projectId={project.id} />
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    </div>

                    <div className="space-y-4 xl:sticky xl:top-6">
                        <div className="rounded-xl border bg-card/50 p-5">
                            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                Project guide
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                Review, shape, and share
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Use this column for the choices that decide how
                                the project is refined, presented, and shared
                                with other people.
                            </p>
                        </div>

                        <ProjectSharePanel
                            project={project}
                            sharePanel={sharePanel}
                        />

                        <div id="curator-review">
                            <ProjectAiSidebar
                                curator={curator}
                                project={project}
                                highlights={highlights}
                            />
                        </div>
                    </div>
                </div>

                <ProjectCuratorPresence
                    assistantName={curator.assistant_name}
                    processing={processing}
                    recentlyUploadedCount={recentlyUploadedAssetIds.length}
                />
            </div>
        </>
    );
}

ShowProject.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
    ],
};
