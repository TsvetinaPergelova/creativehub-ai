import { router } from '@inertiajs/react';
import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Expand,
    Search,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { destroy } from '@/actions/App/Http/Controllers/Projects/ProjectAssetController';
import ProjectAssetTitleForm from '@/components/projects/project-asset-title-form';
import type { ProjectAsset } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatScoreLabel(score: number | null): string {
    if (score === null) {
        return 'Pending';
    }

    return `${score}/10`;
}

function getAssetDisplayTitle(asset: ProjectAsset): string {
    return asset.title ?? asset.filename;
}

export default function ProjectAssetGrid({
    assets,
    projectId,
}: {
    assets: ProjectAsset[];
    projectId: number;
}) {
    const zoomScale = 2;
    const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(
        null,
    );
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isDeletingAsset, setIsDeletingAsset] = useState(false);
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const imageViewportRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const dragStateRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
        startPanX: number;
        startPanY: number;
        moved: boolean;
    } | null>(null);
    const suppressToggleRef = useRef(false);
    const selectedAsset = useMemo(
        () =>
            selectedAssetIndex === null
                ? null
                : (assets[selectedAssetIndex] ?? null),
        [assets, selectedAssetIndex],
    );

    useEffect(() => {
        setIsZoomed(false);
        setPan({ x: 0, y: 0 });
        setIsDragging(false);
        setIsDeleteConfirming(false);
        dragStateRef.current = null;
        suppressToggleRef.current = false;
    }, [selectedAssetIndex]);

    function openAsset(index: number): void {
        setSelectedAssetIndex(index);
    }

    function closeAsset(open: boolean): void {
        if (!open) {
            setIsZoomed(false);
            setIsDragging(false);
            setPan({ x: 0, y: 0 });
            setIsDeleteConfirming(false);
            dragStateRef.current = null;
            suppressToggleRef.current = false;
            setSelectedAssetIndex(null);
        }
    }

    function toggleZoom(): void {
        setIsZoomed((current) => {
            const nextZoomed = !current;

            if (!nextZoomed) {
                setPan({ x: 0, y: 0 });
                setIsDragging(false);
            }

            return nextZoomed;
        });
    }

    function clampPan(nextX: number, nextY: number): { x: number; y: number } {
        const viewport = imageViewportRef.current;
        const image = imageRef.current;

        if (!viewport || !image || !isZoomed) {
            return { x: 0, y: 0 };
        }

        const horizontalOverflow = Math.max(
            (image.clientWidth * zoomScale - viewport.clientWidth) / 2,
            0,
        );
        const verticalOverflow = Math.max(
            (image.clientHeight * zoomScale - viewport.clientHeight) / 2,
            0,
        );

        return {
            x: Math.min(
                Math.max(nextX, -horizontalOverflow),
                horizontalOverflow,
            ),
            y: Math.min(Math.max(nextY, -verticalOverflow), verticalOverflow),
        };
    }

    function handlePreviewPointerDown(
        event: PointerEvent<HTMLButtonElement>,
    ): void {
        if (!isZoomed) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startPanX: pan.x,
            startPanY: pan.y,
            moved: false,
        };
        setIsDragging(true);
    }

    function handlePreviewPointerMove(
        event: PointerEvent<HTMLButtonElement>,
    ): void {
        const dragState = dragStateRef.current;

        if (
            !isZoomed ||
            !dragState ||
            dragState.pointerId !== event.pointerId
        ) {
            return;
        }

        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            dragState.moved = true;
            suppressToggleRef.current = true;
        }

        setPan(
            clampPan(
                dragState.startPanX + deltaX,
                dragState.startPanY + deltaY,
            ),
        );
    }

    function handlePreviewPointerEnd(
        event: PointerEvent<HTMLButtonElement>,
    ): void {
        const dragState = dragStateRef.current;

        if (dragState?.pointerId !== event.pointerId) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        dragStateRef.current = null;
        setIsDragging(false);
    }

    function handlePreviewClick(): void {
        if (suppressToggleRef.current) {
            suppressToggleRef.current = false;

            return;
        }

        toggleZoom();
    }

    function showPreviousAsset(): void {
        if (selectedAssetIndex === null) {
            return;
        }

        setSelectedAssetIndex(
            (selectedAssetIndex - 1 + assets.length) % assets.length,
        );
    }

    function showNextAsset(): void {
        if (selectedAssetIndex === null) {
            return;
        }

        setSelectedAssetIndex((selectedAssetIndex + 1) % assets.length);
    }

    function requestDeleteSelectedAsset(): void {
        if (!selectedAsset) {
            return;
        }

        setIsDeleteConfirming(true);
    }

    function confirmDeleteSelectedAsset(): void {
        if (!selectedAsset) {
            return;
        }

        setIsDeletingAsset(true);

        router.delete(
            destroy({ project: projectId, asset: selectedAsset.id }),
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsDeletingAsset(false);
                },
                onSuccess: () => {
                    setIsDeleteConfirming(false);
                    closeAsset(false);
                },
            },
        );
    }

    if (assets.length === 0) {
        return (
            <div className="rounded-xl border border-dashed bg-card/60 p-10 text-center">
                <h2 className="text-lg font-semibold">No images yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Your uploaded frames will appear here as the project grows.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto grid w-full max-w-[38rem] justify-items-center gap-4 md:max-w-none md:grid-cols-2 md:justify-items-stretch 2xl:grid-cols-3">
                {assets.map((asset, index) => (
                    <button
                        key={asset.id}
                        type="button"
                        onClick={() => openAsset(index)}
                        className={cn(
                            'w-full overflow-hidden rounded-xl border bg-card/80 text-left shadow-none transition hover:bg-card focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                            asset.analysis?.is_highlight
                                ? 'border-amber-400/45 hover:border-amber-400/65'
                                : 'hover:border-primary/40',
                        )}
                    >
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            <img
                                src={asset.url}
                                alt={getAssetDisplayTitle(asset)}
                                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                            />
                            {asset.analysis?.is_highlight && (
                                <div className="absolute inset-x-0 top-0 bg-amber-400/95 px-4 py-2 text-left text-[11px] font-semibold tracking-[0.22em] text-amber-950 uppercase shadow-none">
                                    Highlight
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground shadow-none backdrop-blur-sm">
                                    <Expand className="size-3.5" />
                                    Preview
                                </span>
                            </div>
                            {asset.is_cover && (
                                <div
                                    className={cn(
                                        'absolute left-4',
                                        asset.analysis?.is_highlight
                                            ? 'top-12'
                                            : 'top-4',
                                    )}
                                >
                                    <Badge>Cover</Badge>
                                </div>
                            )}
                            {!asset.analysis && (
                                <div className="absolute inset-x-3 bottom-3 rounded-md bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm">
                                    AI is reviewing this image...
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 p-4">
                            <p className="truncate text-sm font-medium">
                                {getAssetDisplayTitle(asset)}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>{formatBytes(asset.size)}</span>
                                {asset.width && asset.height && (
                                    <span>
                                        {asset.width} x {asset.height}
                                    </span>
                                )}
                            </div>
                            {(asset.analysis?.tags?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {asset.analysis?.tags
                                        .slice(0, 3)
                                        .map((tag) => (
                                            <Badge key={tag} variant="outline">
                                                {tag}
                                            </Badge>
                                        ))}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <Dialog open={selectedAsset !== null} onOpenChange={closeAsset}>
                {selectedAsset && (
                    <DialogContent className="top-0 right-0 bottom-0 left-0 z-[60] h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 bg-background p-0 sm:top-[50%] sm:left-[50%] sm:h-[96vh] sm:max-h-[96vh] sm:w-full sm:max-w-[min(84vw,78rem)] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:border-white/10">
                        <DialogTitle className="sr-only">
                            {getAssetDisplayTitle(selectedAsset)}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Full preview and AI details for the selected project
                            asset.
                        </DialogDescription>

                        <div className="flex h-full min-h-0 flex-col lg:grid lg:h-full lg:max-h-[96vh] lg:grid-cols-[minmax(0,1fr)_27rem] xl:grid-cols-[minmax(0,1.02fr)_31rem]">
                            <div
                                ref={imageViewportRef}
                                className={cn(
                                    'relative h-[42svh] shrink-0 items-center justify-center overflow-hidden bg-black/95 px-3 pt-12 pb-3 sm:min-h-[18rem] sm:h-auto sm:p-6 lg:flex lg:min-h-[88vh] lg:flex-1 lg:px-5 lg:py-4 xl:min-h-[90vh] xl:px-6 xl:py-5',
                                    isZoomed ? 'select-none' : '',
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={handlePreviewClick}
                                    onDragStart={(event) =>
                                        event.preventDefault()
                                    }
                                    onPointerDown={handlePreviewPointerDown}
                                    onPointerMove={handlePreviewPointerMove}
                                    onPointerUp={handlePreviewPointerEnd}
                                    onPointerCancel={handlePreviewPointerEnd}
                                        className={cn(
                                            'flex h-full w-full items-center justify-center focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                            isZoomed
                                                ? isDragging
                                                    ? 'cursor-grabbing touch-none'
                                                : 'cursor-grab touch-none'
                                            : 'cursor-zoom-in',
                                    )}
                                >
                                    <img
                                        ref={imageRef}
                                        src={selectedAsset.url}
                                        draggable={false}
                                        alt={
                                            selectedAsset.analysis?.alt_text ??
                                            getAssetDisplayTitle(selectedAsset)
                                        }
                                        className={cn(
                                            'pointer-events-none max-h-[min(46svh,30rem)] w-auto max-w-full rounded-[1.15rem] object-contain transition duration-300 will-change-transform select-none sm:max-h-[82vh] lg:max-h-[88vh] sm:rounded-lg xl:max-h-[90vh]',
                                            isZoomed ? 'cursor-grab' : '',
                                        )}
                                        style={{
                                            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${isZoomed ? zoomScale : 1})`,
                                        }}
                                    />
                                </button>

                                {assets.length > 1 && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            onClick={showPreviousAsset}
                                            className="absolute top-1/2 left-3 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-background/70 backdrop-blur sm:left-4 sm:size-9"
                                        >
                                            <ChevronLeft className="size-4" />
                                            <span className="sr-only">
                                                Previous image
                                            </span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            onClick={showNextAsset}
                                            className="absolute top-1/2 right-3 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-background/70 backdrop-blur sm:right-4 sm:size-9"
                                        >
                                            <ChevronRight className="size-4" />
                                            <span className="sr-only">
                                                Next image
                                            </span>
                                        </Button>
                                    </>
                                )}

                                <div className="absolute top-3 left-3 rounded-full bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground shadow-none backdrop-blur-sm sm:top-auto sm:bottom-4 sm:left-4 sm:rounded-md sm:px-3 sm:py-2">
                                    {selectedAssetIndex !== null
                                        ? `${selectedAssetIndex + 1} of ${assets.length}`
                                        : null}
                                </div>
                                <div className="absolute right-3 bottom-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-[11px] text-foreground shadow-none backdrop-blur-sm sm:right-4 sm:bottom-4 sm:max-w-none sm:rounded-md sm:px-3 sm:py-2 sm:text-xs">
                                    <Search className="size-3.5" />
                                    <span className="sm:hidden">
                                        {isZoomed
                                            ? 'Drag to pan'
                                            : 'Tap to zoom'}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {isZoomed
                                            ? 'Drag to pan, click to zoom out'
                                            : 'Click image to zoom in'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col border-t bg-background lg:h-full lg:max-h-[96vh] lg:border-t-0 lg:border-l">
                                <div className="border-b bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-5">
                                    <div className="mx-auto w-full max-w-[22rem] space-y-2.5 pr-10 sm:max-w-none sm:space-y-3">
                                        <div className="flex min-w-0 items-start gap-2">
                                            <h3 className="min-w-0 flex-1 truncate pt-0.5 text-base leading-tight font-semibold tracking-tight sm:line-clamp-3 sm:truncate-none sm:whitespace-normal sm:pt-0 sm:text-2xl">
                                                {getAssetDisplayTitle(
                                                    selectedAsset,
                                                )}
                                            </h3>
                                            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                                {selectedAsset.is_cover && (
                                                    <Badge className="px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs">
                                                        Cover
                                                    </Badge>
                                                )}
                                                {selectedAsset.analysis
                                                    ?.is_highlight && (
                                                    <Badge className="bg-amber-400 px-2 py-0.5 text-[10px] text-amber-950 hover:bg-amber-300 sm:px-2.5 sm:py-1 sm:text-xs">
                                                        Highlight
                                                    </Badge>
                                                )}
                                                {!selectedAsset.analysis && (
                                                    <Badge
                                                        variant="outline"
                                                        className="px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs"
                                                    >
                                                        Analyzing
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="hidden flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground sm:flex">
                                            <span>
                                                {formatBytes(
                                                    selectedAsset.size,
                                                )}
                                            </span>
                                            {selectedAsset.width &&
                                                selectedAsset.height && (
                                                    <span>
                                                        {selectedAsset.width} x{' '}
                                                        {selectedAsset.height}
                                                    </span>
                                                )}
                                        </div>
                                        <p className="hidden text-xs leading-5 break-all text-muted-foreground/90 sm:block">
                                            Original file:{' '}
                                            {selectedAsset.filename}
                                        </p>
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    <div className="mx-auto w-full max-w-[22rem] space-y-4 py-4 pb-28 sm:max-w-none sm:px-6 sm:py-5 sm:pb-5">
                                        <div className="rounded-2xl border bg-card/45 shadow-none">
                                            <div className="border-b px-3 py-3 sm:px-4 sm:py-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium">
                                                        Image details
                                                    </p>
                                                    <p className="text-xs leading-5 text-muted-foreground">
                                                        File info, AI notes and
                                                        scores.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-[#f5f1ff] px-2 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 dark:bg-background/50">
                                                <div className="space-y-5">
                                                    <section className="space-y-3 px-1 py-1 sm:px-0 sm:py-0">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                File info
                                                            </p>
                                                            <p className="text-xs leading-5 text-muted-foreground">
                                                                Original file
                                                                name and image
                                                                metadata.
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                                                            <div className="min-w-0 space-y-1">
                                                                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Size
                                                                </p>
                                                                <p className="truncate font-medium">
                                                                    {formatBytes(
                                                                        selectedAsset.size,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="min-w-0 space-y-1">
                                                                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Dimensions
                                                                </p>
                                                                <p className="truncate font-medium">
                                                                    {selectedAsset.width &&
                                                                    selectedAsset.height
                                                                        ? `${selectedAsset.width} x ${selectedAsset.height}`
                                                                        : 'Not available'}
                                                                </p>
                                                            </div>
                                                            <div className="col-span-2 min-w-0 space-y-1 sm:col-span-3">
                                                                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Original
                                                                    file
                                                                </p>
                                                                <p
                                                                    className="truncate text-xs leading-5 text-muted-foreground/90 sm:whitespace-normal sm:break-all"
                                                                    title={
                                                                        selectedAsset.filename
                                                                    }
                                                                >
                                                                    {
                                                                        selectedAsset.filename
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    <section className="space-y-4 rounded-xl border bg-white p-3 shadow-none sm:p-4 dark:bg-background/70">
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    Naming
                                                                </p>
                                                                <p className="text-xs leading-5 text-muted-foreground">
                                                                    Give this
                                                                    frame a
                                                                    clear,
                                                                    human-readable
                                                                    title for
                                                                    the project.
                                                                </p>
                                                            </div>

                                                            <ProjectAssetTitleForm
                                                                asset={
                                                                    selectedAsset
                                                                }
                                                                projectId={
                                                                    projectId
                                                                }
                                                                mode="panel"
                                                            />
                                                    </section>

                                                    <section className="space-y-3">
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    Quick read
                                                                </p>
                                                                <p className="text-xs leading-5 text-muted-foreground">
                                                                    A fast
                                                                    visual
                                                                    summary of
                                                                    this frame
                                                                    before you
                                                                    read the
                                                                    fuller
                                                                    notes.
                                                                </p>
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-3">
                                                                <div className="min-w-0 rounded-xl border bg-white p-3 shadow-none dark:bg-background/70">
                                                                    <p className="truncate text-[10px] tracking-[0.1em] text-muted-foreground uppercase sm:text-[11px] sm:tracking-[0.18em]">
                                                                        Composition
                                                                    </p>
                                                                    <p className="mt-2 text-lg font-semibold">
                                                                        {formatScoreLabel(
                                                                            selectedAsset
                                                                                .analysis
                                                                                ?.composition_score ??
                                                                                null,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="min-w-0 rounded-xl border bg-white p-3 shadow-none dark:bg-background/70">
                                                                    <p className="truncate text-[10px] tracking-[0.1em] text-muted-foreground uppercase sm:text-[11px] sm:tracking-[0.18em]">
                                                                        Focus
                                                                    </p>
                                                                    <p className="mt-2 text-lg font-semibold">
                                                                        {formatScoreLabel(
                                                                            selectedAsset
                                                                                .analysis
                                                                                ?.focus_score ??
                                                                                null,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="min-w-0 rounded-xl border bg-white p-3 shadow-none dark:bg-background/70">
                                                                    <p className="truncate text-[10px] tracking-[0.1em] text-muted-foreground uppercase sm:text-[11px] sm:tracking-[0.18em]">
                                                                        Lighting
                                                                    </p>
                                                                    <p className="mt-2 text-lg font-semibold">
                                                                        {formatScoreLabel(
                                                                            selectedAsset
                                                                                .analysis
                                                                                ?.lighting_score ??
                                                                                null,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                    </section>

                                                    <section className="space-y-4 rounded-xl border bg-white p-3 shadow-none sm:p-4 dark:bg-background/70">
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    AI readout
                                                                </p>
                                                                <p className="text-xs leading-5 text-muted-foreground">
                                                                    Tags,
                                                                    critique,
                                                                    and
                                                                    accessibility
                                                                    notes
                                                                    gathered for
                                                                    this image.
                                                                </p>
                                                            </div>

                                                            {(selectedAsset
                                                                .analysis?.tags
                                                                ?.length ?? 0) >
                                                                0 && (
                                                                <div className="space-y-3">
                                                                    <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                                                        Tags
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {selectedAsset.analysis?.tags.map(
                                                                            (
                                                                                tag,
                                                                            ) => (
                                                                                <Badge
                                                                                    key={
                                                                                        tag
                                                                                    }
                                                                                    variant="outline"
                                                                                >
                                                                                    {
                                                                                        tag
                                                                                    }
                                                                                </Badge>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="space-y-3 rounded-lg border bg-white p-4 shadow-none dark:bg-background/70">
                                                                <div className="flex items-center gap-2">
                                                                    <Sparkles className="size-4 text-primary" />
                                                                    <p className="text-sm font-medium">
                                                                        Curator
                                                                        notes
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm leading-6 text-muted-foreground">
                                                                    {selectedAsset
                                                                        .analysis
                                                                        ?.critique ??
                                                                        'Curator is still processing this image. Notes will appear here automatically.'}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                                                    Alt text
                                                                </p>
                                                                <p className="text-sm leading-6 text-muted-foreground">
                                                                    {selectedAsset
                                                                        .analysis
                                                                        ?.alt_text ??
                                                                        'Alt text will appear once AI analysis finishes.'}
                                                                </p>
                                                            </div>

                                                            {selectedAsset
                                                                .analysis
                                                                ?.mood && (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                                                        Mood
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            selectedAsset
                                                                                .analysis
                                                                                .mood
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </section>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
                                    <div className="mx-auto w-full max-w-[22rem] space-y-4 sm:max-w-none">
                                        {isDeleteConfirming && (
                                            <div className="rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-4">
                                                <div className="space-y-3">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Are you sure you want to
                                                        delete this image?
                                                    </p>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/15 text-destructive shadow-none">
                                                            <AlertTriangle className="size-5" />
                                                        </div>

                                                        <div className="min-w-0 flex-1 space-y-1 text-left">
                                                            <p className="truncate text-sm font-medium text-foreground">
                                                                {getAssetDisplayTitle(
                                                                    selectedAsset,
                                                                )}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                File:{' '}
                                                                {
                                                                    selectedAsset.filename
                                                                }
                                                            </p>
                                                            {selectedAsset.is_cover && (
                                                                <p className="text-xs text-destructive">
                                                                    This will
                                                                    also clear
                                                                    the project
                                                                    cover.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            {isDeleteConfirming ? (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setIsDeleteConfirming(
                                                                false,
                                                            )
                                                        }
                                                        disabled={
                                                            isDeletingAsset
                                                        }
                                                        className="w-full justify-center px-3 text-sm sm:text-base"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={
                                                            confirmDeleteSelectedAsset
                                                        }
                                                        disabled={
                                                            isDeletingAsset
                                                        }
                                                        className="w-full justify-center px-3 text-sm sm:text-base"
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        {isDeletingAsset
                                                            ? 'Deleting...'
                                                            : 'Delete image'}
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={
                                                            requestDeleteSelectedAsset
                                                        }
                                                        disabled={
                                                            isDeletingAsset
                                                        }
                                                        className="w-full justify-center px-3 text-sm sm:text-base"
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Delete image
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        className="w-full justify-center px-3 text-sm sm:text-base"
                                                    >
                                                        <a
                                                            href={
                                                                selectedAsset.url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <span className="sm:hidden">
                                                                Open image
                                                            </span>
                                                            <span className="hidden sm:inline">
                                                                Open full image
                                                            </span>
                                                        </a>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}
