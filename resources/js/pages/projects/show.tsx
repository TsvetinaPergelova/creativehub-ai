import { Head, Link, usePoll } from '@inertiajs/react';
import {
    ChevronDown,
    FolderOpen,
    Images,
    LoaderCircle,
    PencilLine,
    Share2,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    edit,
    index,
} from '@/actions/App/Http/Controllers/Projects/ProjectController';
import ProjectAiSidebar from '@/components/projects/project-ai-sidebar';
import ProjectAssetGrid from '@/components/projects/project-asset-grid';
import ProjectCoverPicker from '@/components/projects/project-cover-picker';
import ProjectCuratorPresence from '@/components/projects/project-curator-presence';
import ProjectSharePanel from '@/components/projects/project-share-panel';
import ProjectUploadDropzone from '@/components/projects/project-upload-dropzone';
import ProjectUploadReview from '@/components/projects/project-upload-review';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type {
    Project,
    ProjectAsset,
    ProjectSharePanel as ProjectSharePanelData,
} from '@/types';
import type { ProjectProcessing } from '@/types';

type CuratorSummary = {
    assistant_name: string;
    summary: string;
};

type MobileWorkspacePanel =
    | 'library'
    | 'share'
    | 'curator'
    | 'results'
    | 'upload-review';

function MobileWorkspaceLauncher({
    icon: Icon,
    title,
    description,
    badge,
    onClick,
}: {
    icon: typeof Images;
    title: string;
    description: string;
    badge?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-2xl border bg-card/50 p-4 text-left transition hover:border-primary/35 hover:bg-card/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs leading-5 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
                {badge ? (
                    <Badge variant="outline" className="shrink-0">
                        {badge}
                    </Badge>
                ) : null}
            </div>
        </button>
    );
}

function MobileWorkspaceDialog({
    title,
    description,
    open,
    onOpenChange,
    children,
}: {
    title: string;
    description: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] gap-0 overflow-hidden rounded-[1.75rem] border-white/10 bg-background p-0 sm:max-h-[92vh] sm:max-w-3xl sm:rounded-lg">
                <DialogHeader className="border-b px-4 py-4 text-left sm:px-6 sm:py-5">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}

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
    const [isPulseOpen, setIsPulseOpen] = useState(false);
    const [isResultsOpen, setIsResultsOpen] = useState(false);
    const [activeMobilePanel, setActiveMobilePanel] =
        useState<MobileWorkspacePanel | null>(null);
    const assets = project.assets ?? [];
    const analyzedAssets = assets.filter((asset) => asset.analysis);
    const latestReviewedAsset =
        [...analyzedAssets]
            .sort(
                (leftAsset, rightAsset) =>
                    rightAsset.sort_order - leftAsset.sort_order,
            )
            .at(0) ?? null;
    const pendingAssets = assets.filter((asset) => !asset.analysis);
    const uploadReviewAssets = recentlyUploadedAssetIds
        .map((assetId) => assets.find((asset) => asset.id === assetId) ?? null)
        .filter((asset): asset is ProjectAsset => asset !== null)
        .filter((asset) => !asset.title);
    const hasPendingAnalysis = pendingAssets.length > 0;
    const analysisCoverage =
        assets.length === 0
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

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');

        const syncResultsState = (): void => {
            setIsResultsOpen(mediaQuery.matches);
        };

        syncResultsState();
        mediaQuery.addEventListener('change', syncResultsState);

        return () => {
            mediaQuery.removeEventListener('change', syncResultsState);
        };
    }, []);

    return (
        <>
            <Head title={project.name} />

            <div className="min-w-0 space-y-5 overflow-x-clip p-3 sm:space-y-6 sm:p-6">
                <section className="relative overflow-hidden rounded-xl border bg-card/70 px-4 py-6 shadow-sm sm:px-8 sm:py-12">
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
                    <div className="relative grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_34rem] xl:items-stretch">
                        <div className="flex min-w-0 flex-col gap-5 sm:gap-8">
                            <div className="space-y-5 sm:space-y-6">
                                <div className="space-y-3">
                                    <p className="text-xs tracking-[0.34em] text-muted-foreground uppercase">
                                        {project.category}
                                    </p>
                                    <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                                        {project.name}
                                    </h1>
                                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-lg sm:leading-7">
                                        {project.description ??
                                            'Add a description to help frame this project before upload.'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                            Project state
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className="border border-primary/35 bg-primary/85 text-primary-foreground capitalize shadow-sm backdrop-blur-md">
                                                {project.status}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="border-white/15 bg-background/70 text-foreground capitalize shadow-sm backdrop-blur-md"
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
                                                className="hidden border-white/15 bg-background/70 text-foreground shadow-sm backdrop-blur-md sm:inline-flex"
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
                            className="min-w-0 self-stretch"
                        >
                            <Card className="min-w-0 gap-0 overflow-hidden border-white/10 bg-background/72 py-0 shadow-xl backdrop-blur">
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="w-full text-left transition hover:bg-white/[0.03] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                    >
                                        <CardHeader className="px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
                                            <div className="space-y-4 sm:space-y-5">
                                                <div className="space-y-2">
                                                    <CardTitle className="text-xl tracking-tight sm:text-2xl">
                                                        Project pulse
                                                    </CardTitle>
                                                    <CardDescription className="hidden max-w-sm text-sm leading-6 sm:block">
                                                        Your working set,
                                                        condensed into the
                                                        numbers and readiness
                                                        signals that matter
                                                        right now.
                                                    </CardDescription>
                                                </div>

                                                <div className="rounded-xl border bg-background/45 px-3 py-3 backdrop-blur-sm sm:px-4">
                                                    <div className="grid gap-3">
                                                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
                                                            <div>
                                                                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:text-[11px] sm:tracking-[0.22em]">
                                                                    Assets
                                                                </p>
                                                                <p className="mt-1 font-semibold">
                                                                    {
                                                                        assets.length
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:text-[11px] sm:tracking-[0.22em]">
                                                                    Analyzed
                                                                </p>
                                                                <p className="mt-1 font-semibold">
                                                                    {
                                                                        analyzedAssets.length
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="max-sm:col-span-2">
                                                                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:text-[11px] sm:tracking-[0.22em]">
                                                                    Highlights
                                                                </p>
                                                                <p className="mt-1 font-semibold">
                                                                    {
                                                                        highlights.length
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase sm:text-[11px] sm:tracking-[0.22em]">
                                                                    Status
                                                                </p>
                                                                <p className="mt-1 text-sm font-semibold sm:text-base">
                                                                    {
                                                                        pulseStatus
                                                                    }
                                                                </p>
                                                            </div>

                                                            <ChevronDown
                                                                className={cn(
                                                                    'size-4 shrink-0 text-muted-foreground transition-transform',
                                                                    isPulseOpen &&
                                                                        'rotate-180',
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
                                    <CardContent className="grid gap-3 border-t px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
                                        {heroStats.map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-xl border bg-background/65 p-3.5"
                                            >
                                                <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
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
                                    <CardContent className="space-y-3 border-t px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-6">
                                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                                            <ProjectCoverPicker
                                                assets={assets}
                                                coverAssetId={
                                                    project.cover_asset_id
                                                }
                                                projectId={project.id}
                                            />

                                            <Button
                                                variant="outline"
                                                className="h-11"
                                                asChild
                                            >
                                                <Link
                                                    href={edit(project.id)}
                                                    prefetch
                                                >
                                                    <PencilLine className="mr-2 size-4" />
                                                    Edit details
                                                </Link>
                                            </Button>
                                        </div>

                                        <div className="rounded-xl border bg-background/45 p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
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
                                                    style={{
                                                        width: `${analysisCoverage}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    </div>
                </section>

                <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_28rem] xl:items-start">
                    <div id="project-upload" className="min-w-0 space-y-6">
                        <section className="overflow-hidden rounded-xl border bg-card/50 p-4 sm:p-6">
                            <div className="min-w-0 space-y-2 border-b pb-5">
                                <div className="min-w-0 space-y-2">
                                    <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase sm:text-xs sm:tracking-[0.28em]">
                                        Project workflow
                                    </p>
                                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                        Build your set
                                    </h2>
                                    <p className="max-w-full text-sm leading-6 text-muted-foreground sm:max-w-2xl">
                                        Upload new frames, optionally name them,
                                        and let Curator review the latest set in
                                        the background.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5 pt-5">
                                <ProjectUploadDropzone projectId={project.id} />

                                <div className="hidden md:block">
                                    <ProjectUploadReview
                                        assets={assets}
                                        projectId={project.id}
                                        recentlyUploadedAssetIds={
                                            recentlyUploadedAssetIds
                                        }
                                    />
                                </div>

                                <div className="overflow-hidden rounded-xl border bg-background/55 p-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                                                    {processing.is_reviewing ? (
                                                        <LoaderCircle className="size-4 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="size-4" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 space-y-3">
                                                    <div className="min-w-0 space-y-1">
                                                        <p className="text-sm font-medium">
                                                            {
                                                                processing.headline
                                                            }
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                processing.description
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {processing.current_asset_label && (
                                                            <div className="w-full max-w-full rounded-2xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary sm:w-auto sm:rounded-full">
                                                                <span className="font-medium">
                                                                    Reviewing
                                                                    now:
                                                                </span>{' '}
                                                                <span
                                                                    className="inline-block max-w-full truncate align-bottom text-primary/90 sm:max-w-[min(100%,34rem)]"
                                                                    title={
                                                                        processing.current_asset_label
                                                                    }
                                                                >
                                                                    {
                                                                        processing.current_asset_label
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {processing.pending_count >
                                                            1 && (
                                                            <Badge variant="outline">
                                                                {processing.pending_count -
                                                                    1}{' '}
                                                                more waiting
                                                                behind it
                                                            </Badge>
                                                        )}
                                                        {!processing.is_reviewing && (
                                                            <Badge variant="outline">
                                                                Ready for your
                                                                next upload
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {processing
                                                        .pending_asset_labels
                                                        .length > 1 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                                                Up next
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {processing.pending_asset_labels
                                                                    .slice(1)
                                                                    .map(
                                                                        (
                                                                            label,
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    label
                                                                                }
                                                                                variant="outline"
                                                                                className="max-w-full"
                                                                                title={
                                                                                    label
                                                                                }
                                                                            >
                                                                                <span className="inline-block max-w-full truncate align-bottom sm:max-w-72">
                                                                                    {
                                                                                        label
                                                                                    }
                                                                                </span>
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <p className="hidden text-sm text-muted-foreground sm:block">
                                                        {processing.expectation}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-full rounded-xl border bg-background/70 px-4 py-3 text-sm xl:min-w-56">
                                                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                                    Progress
                                                </p>
                                                <p className="mt-2 font-semibold">
                                                    {
                                                        processing.coverage_percent
                                                    }
                                                    % reviewed
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {processing.reviewed_count}{' '}
                                                    of {processing.total_count}{' '}
                                                    images complete
                                                </p>
                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                                        style={{
                                                            width: `${processing.coverage_percent}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <section className="space-y-3 md:hidden">
                                    <div className="space-y-1">
                                        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                            Workspace panels
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Open the longer review, library, and
                                            sharing sections only when you need
                                            them.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {latestReviewedAsset ? (
                                            <MobileWorkspaceLauncher
                                                icon={Sparkles}
                                                title="Latest review"
                                                description="Curator notes, tags, and the strongest signals from the newest reviewed frame."
                                                badge={`${
                                                    latestReviewedAsset.analysis
                                                        ?.is_highlight
                                                        ? 'Highlight'
                                                        : '1 frame'
                                                }`}
                                                onClick={() =>
                                                    setActiveMobilePanel(
                                                        'results',
                                                    )
                                                }
                                            />
                                        ) : null}

                                        <MobileWorkspaceLauncher
                                            icon={FolderOpen}
                                            title="Asset library"
                                            description="Browse all uploaded images without leaving the project page."
                                            badge={`${assets.length}`}
                                            onClick={() =>
                                                setActiveMobilePanel('library')
                                            }
                                        />

                                        <MobileWorkspaceLauncher
                                            icon={Share2}
                                            title="Share project"
                                            description="Switch visibility and copy the live destinations for this project."
                                            badge={sharePanel.visibility}
                                            onClick={() =>
                                                setActiveMobilePanel('share')
                                            }
                                        />

                                        <MobileWorkspaceLauncher
                                            icon={Sparkles}
                                            title="Curator summary"
                                            description="Highlights, top tags, and the broader read of the whole set."
                                            badge={`${highlights.length} highlights`}
                                            onClick={() =>
                                                setActiveMobilePanel('curator')
                                            }
                                        />

                                        {uploadReviewAssets.length > 0 ? (
                                            <MobileWorkspaceLauncher
                                                icon={PencilLine}
                                                title="Name uploads"
                                                description="Add clear titles to the latest uploaded frames without keeping the form open inline."
                                                badge={`${uploadReviewAssets.length}`}
                                                onClick={() =>
                                                    setActiveMobilePanel(
                                                        'upload-review',
                                                    )
                                                }
                                            />
                                        ) : null}
                                    </div>
                                </section>
                            </div>
                        </section>

                        {latestReviewedAsset ? (
                            <section
                                id="curator-review"
                                className="hidden overflow-hidden rounded-xl border bg-card/50 p-4 md:block md:p-6"
                            >
                                <Collapsible
                                    open={isResultsOpen}
                                    onOpenChange={setIsResultsOpen}
                                >
                                    <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between sm:pb-5">
                                        <div className="min-w-0 space-y-2">
                                            <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">
                                                Curator results
                                            </p>
                                            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                                Latest reviewed frame
                                            </h2>
                                            <p className="hidden max-w-2xl text-sm leading-6 text-muted-foreground sm:block">
                                                The most recent notes, tags, and
                                                framing signals that Curator has
                                                synced into this project.
                                            </p>

                                            {!isResultsOpen ? (
                                                <div className="space-y-2 pt-1 md:hidden">
                                                    <p className="text-sm font-medium">
                                                        {latestReviewedAsset.title ??
                                                            latestReviewedAsset.filename}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(
                                                            latestReviewedAsset
                                                                .analysis
                                                                ?.tags ?? []
                                                        )
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <Badge
                                                                    key={tag}
                                                                    variant="outline"
                                                                    className="border-white/10 bg-background/45"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        {latestReviewedAsset
                                                            .analysis
                                                            ?.is_highlight ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-400/30 bg-amber-400/10 text-amber-200"
                                                            >
                                                                Highlight
                                                                candidate
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        <CollapsibleTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="self-end md:hidden"
                                            >
                                                <ChevronDown
                                                    className={cn(
                                                        'size-4 transition-transform',
                                                        isResultsOpen &&
                                                            'rotate-180',
                                                    )}
                                                />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>

                                    <CollapsibleContent className="pt-5">
                                        <div className="space-y-5">
                                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] xl:items-start">
                                                <div className="space-y-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-primary/25 bg-primary/8 text-primary"
                                                        >
                                                            Latest insight
                                                            snapshot
                                                        </Badge>
                                                        {latestReviewedAsset
                                                            .analysis
                                                            ?.is_highlight ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-400/30 bg-amber-400/10 text-amber-200"
                                                            >
                                                                Highlight
                                                                candidate
                                                            </Badge>
                                                        ) : null}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <p className="text-base font-semibold tracking-tight sm:text-lg">
                                                            {latestReviewedAsset.title ??
                                                                latestReviewedAsset.filename}
                                                        </p>
                                                        <p className="max-w-3xl text-sm leading-7 text-foreground/90 sm:text-base">
                                                            {latestReviewedAsset
                                                                .analysis
                                                                ?.critique ??
                                                                latestReviewedAsset
                                                                    .analysis
                                                                    ?.alt_text ??
                                                                'Curator has already attached notes to the latest reviewed frame.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                                                        Curator tags
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(
                                                            latestReviewedAsset
                                                                .analysis
                                                                ?.tags ?? []
                                                        ).length > 0 ? (
                                                            (
                                                                latestReviewedAsset
                                                                    .analysis
                                                                    ?.tags ?? []
                                                            )
                                                                .slice(0, 6)
                                                                .map((tag) => (
                                                                    <Badge
                                                                        key={
                                                                            tag
                                                                        }
                                                                        variant="outline"
                                                                        className="border-white/10 bg-background/45"
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                ))
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                Curator did not
                                                                attach tags to
                                                                this frame yet.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 border-t pt-4 lg:grid-cols-[minmax(0,1.6fr)_10rem_12rem]">
                                                <div className="space-y-2">
                                                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                        Alt text
                                                    </p>
                                                    <p
                                                        className="line-clamp-2 text-sm leading-6 text-foreground/85"
                                                        title={
                                                            latestReviewedAsset
                                                                .analysis
                                                                ?.alt_text ??
                                                            undefined
                                                        }
                                                    >
                                                        {latestReviewedAsset
                                                            .analysis
                                                            ?.alt_text ??
                                                            'No alt text yet.'}
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                        Mood
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground capitalize">
                                                        {latestReviewedAsset
                                                            .analysis?.mood ??
                                                            'Not set'}
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                        Highlight status
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {latestReviewedAsset
                                                            .analysis
                                                            ?.is_highlight
                                                            ? 'Marked as a strong frame'
                                                            : 'Supporting frame'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </section>
                        ) : null}

                        <Collapsible defaultOpen className="hidden md:block">
                            <div className="overflow-hidden rounded-xl border bg-card/60 p-4 sm:p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
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
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                        >
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent className="pt-5">
                                    <ProjectAssetGrid
                                        assets={assets}
                                        projectId={project.id}
                                    />
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    </div>

                        <div id="share-project" className="hidden min-w-0 space-y-4 md:block xl:sticky xl:top-6">
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

                <MobileWorkspaceDialog
                    title="Asset library"
                    description="Review the raw upload set before AI analysis and curation layers are applied."
                    open={activeMobilePanel === 'library'}
                    onOpenChange={(open) =>
                        setActiveMobilePanel(open ? 'library' : null)
                    }
                >
                    <ProjectAssetGrid assets={assets} projectId={project.id} />
                </MobileWorkspaceDialog>

                <MobileWorkspaceDialog
                    title="Share this project"
                    description="Choose how other people experience this project and open the live links."
                    open={activeMobilePanel === 'share'}
                    onOpenChange={(open) =>
                        setActiveMobilePanel(open ? 'share' : null)
                    }
                >
                    <ProjectSharePanel
                        project={project}
                        sharePanel={sharePanel}
                    />
                </MobileWorkspaceDialog>

                <MobileWorkspaceDialog
                    title="Curator summary"
                    description={`What ${curator.assistant_name} has surfaced from the full set so far.`}
                    open={activeMobilePanel === 'curator'}
                    onOpenChange={(open) =>
                        setActiveMobilePanel(open ? 'curator' : null)
                    }
                >
                    <ProjectAiSidebar
                        curator={curator}
                        project={project}
                        highlights={highlights}
                    />
                </MobileWorkspaceDialog>

                <MobileWorkspaceDialog
                    title="Latest reviewed frame"
                    description="The most recent notes, tags, and framing signals from Curator."
                    open={activeMobilePanel === 'results'}
                    onOpenChange={(open) =>
                        setActiveMobilePanel(open ? 'results' : null)
                    }
                >
                    {latestReviewedAsset ? (
                        <div className="space-y-5">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="border-primary/25 bg-primary/8 text-primary"
                                    >
                                        Latest insight snapshot
                                    </Badge>
                                    {latestReviewedAsset.analysis
                                        ?.is_highlight ? (
                                        <Badge
                                            variant="outline"
                                            className="border-amber-400/30 bg-amber-400/10 text-amber-200"
                                        >
                                            Highlight candidate
                                        </Badge>
                                    ) : null}
                                </div>

                                <div className="space-y-3">
                                    <p className="text-base font-semibold tracking-tight">
                                        {latestReviewedAsset.title ??
                                            latestReviewedAsset.filename}
                                    </p>
                                    <p className="text-sm leading-7 text-foreground/90">
                                        {latestReviewedAsset.analysis
                                            ?.critique ??
                                            latestReviewedAsset.analysis
                                                ?.alt_text ??
                                            'Curator has already attached notes to the latest reviewed frame.'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                                    Curator tags
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(latestReviewedAsset.analysis?.tags ?? [])
                                        .length > 0 ? (
                                        (
                                            latestReviewedAsset.analysis
                                                ?.tags ?? []
                                        )
                                            .slice(0, 6)
                                            .map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                    className="border-white/10 bg-background/45"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Curator did not attach tags to this
                                            frame yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                        Alt text
                                    </p>
                                    <p
                                        className="text-sm leading-6 text-foreground/85"
                                        title={
                                            latestReviewedAsset.analysis
                                                ?.alt_text ?? undefined
                                        }
                                    >
                                        {latestReviewedAsset.analysis
                                            ?.alt_text ?? 'No alt text yet.'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                        Mood
                                    </p>
                                    <p className="text-sm font-medium text-foreground capitalize">
                                        {latestReviewedAsset.analysis?.mood ??
                                            'Not set'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                        Highlight status
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {latestReviewedAsset.analysis
                                            ?.is_highlight
                                            ? 'Marked as a strong frame'
                                            : 'Supporting frame'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </MobileWorkspaceDialog>

                <MobileWorkspaceDialog
                    title="Name new uploads"
                    description="Add clear titles to the latest uploaded frames whenever you are ready."
                    open={activeMobilePanel === 'upload-review'}
                    onOpenChange={(open) =>
                        setActiveMobilePanel(open ? 'upload-review' : null)
                    }
                >
                    <ProjectUploadReview
                        assets={assets}
                        projectId={project.id}
                        recentlyUploadedAssetIds={recentlyUploadedAssetIds}
                    />
                </MobileWorkspaceDialog>
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
