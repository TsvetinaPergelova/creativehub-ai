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
    const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
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
        () => (selectedAssetIndex === null ? null : assets[selectedAssetIndex] ?? null),
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
            ((image.clientWidth * zoomScale) - viewport.clientWidth) / 2,
            0,
        );
        const verticalOverflow = Math.max(
            ((image.clientHeight * zoomScale) - viewport.clientHeight) / 2,
            0,
        );

        return {
            x: Math.min(Math.max(nextX, -horizontalOverflow), horizontalOverflow),
            y: Math.min(Math.max(nextY, -verticalOverflow), verticalOverflow),
        };
    }

    function handlePreviewPointerDown(event: PointerEvent<HTMLButtonElement>): void {
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

    function handlePreviewPointerMove(event: PointerEvent<HTMLButtonElement>): void {
        const dragState = dragStateRef.current;

        if (!isZoomed || !dragState || dragState.pointerId !== event.pointerId) {
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

    function handlePreviewPointerEnd(event: PointerEvent<HTMLButtonElement>): void {
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

        setSelectedAssetIndex((selectedAssetIndex - 1 + assets.length) % assets.length);
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

        router.delete(destroy({ project: projectId, asset: selectedAsset.id }), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeletingAsset(false);
            },
            onSuccess: () => {
                setIsDeleteConfirming(false);
                closeAsset(false);
            },
        });
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
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {assets.map((asset, index) => (
                    <button
                        key={asset.id}
                        type="button"
                        onClick={() => openAsset(index)}
                        className="overflow-hidden rounded-xl border bg-card/80 text-left shadow-sm transition hover:border-primary/40 hover:bg-card focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            <img
                                src={asset.url}
                                alt={getAssetDisplayTitle(asset)}
                                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                            />
                            <div className="absolute right-3 top-3 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                                    <Expand className="size-3.5" />
                                    Preview
                                </span>
                            </div>
                            {asset.is_cover && (
                                <div className="absolute left-4 top-4">
                                    <Badge>Cover</Badge>
                                </div>
                            )}
                            {!asset.analysis && (
                                <div className="absolute inset-x-3 bottom-3 rounded-md bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm">
                                    AI is reviewing this image...
                                </div>
                            )}
                            {asset.analysis?.is_highlight && (
                                <div className="absolute left-4 top-14">
                                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-300">
                                        Highlight
                                    </Badge>
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
                                    {asset.analysis?.tags.slice(0, 3).map((tag) => (
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
                    <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-[min(94vw,88rem)]">
                        <DialogTitle className="sr-only">
                            {getAssetDisplayTitle(selectedAsset)}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Full preview and AI details for the selected project asset.
                        </DialogDescription>

                        <div className="grid max-h-[92vh] min-h-0 lg:grid-cols-[minmax(0,1.35fr)_26rem] xl:grid-cols-[minmax(0,1.45fr)_30rem]">
                            <div
                                ref={imageViewportRef}
                                className={cn(
                                    'relative flex min-h-[18rem] items-center justify-center overflow-hidden bg-black/95 p-4 sm:p-6 xl:p-8',
                                    isZoomed ? 'select-none' : '',
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={handlePreviewClick}
                                    onDragStart={(event) => event.preventDefault()}
                                    onPointerDown={handlePreviewPointerDown}
                                    onPointerMove={handlePreviewPointerMove}
                                    onPointerUp={handlePreviewPointerEnd}
                                    onPointerCancel={handlePreviewPointerEnd}
                                    className={cn(
                                        'flex h-full w-full items-center justify-center focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
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
                                            'pointer-events-none max-h-[72vh] w-auto max-w-full select-none rounded-lg object-contain transition duration-300 will-change-transform',
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
                                            className="absolute left-4 top-1/2 -translate-y-1/2"
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
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            <ChevronRight className="size-4" />
                                            <span className="sr-only">
                                                Next image
                                            </span>
                                        </Button>
                                    </>
                                )}

                                <div className="absolute bottom-4 left-4 rounded-md bg-background/85 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur-sm">
                                    {selectedAssetIndex !== null
                                        ? `${selectedAssetIndex + 1} of ${assets.length}`
                                        : null}
                                </div>
                                <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-background/85 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur-sm">
                                    <Search className="size-3.5" />
                                    {isZoomed
                                        ? 'Drag to pan, click to zoom out'
                                        : 'Click image to zoom in'}
                                </div>
                            </div>

                            <div className="flex min-h-0 max-h-[92vh] flex-col border-t bg-background lg:border-t-0 lg:border-l">
                                <div className="border-b bg-background/95 px-6 py-5 backdrop-blur-sm">
                                    <div className="space-y-3 pr-10">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {selectedAsset.is_cover && <Badge>Cover</Badge>}
                                            {selectedAsset.analysis?.is_highlight && (
                                                <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-300">
                                                    Highlight
                                                </Badge>
                                            )}
                                            {!selectedAsset.analysis && (
                                                <Badge variant="outline">
                                                    Analyzing
                                                </Badge>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="break-words text-2xl font-semibold leading-tight tracking-tight">
                                                {getAssetDisplayTitle(selectedAsset)}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span>{formatBytes(selectedAsset.size)}</span>
                                            {selectedAsset.width &&
                                                selectedAsset.height && (
                                                    <span>
                                                        {selectedAsset.width} x{' '}
                                                        {selectedAsset.height}
                                                    </span>
                                                )}
                                        </div>
                                        <p className="break-all text-xs leading-5 text-muted-foreground/90">
                                            Original file: {selectedAsset.filename}
                                        </p>
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                                    <div className="space-y-5">
                                        <section className="space-y-4 rounded-xl border bg-card/50 p-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Naming</p>
                                                <p className="text-xs leading-5 text-muted-foreground">
                                                    Give this frame a clear, human-readable title for the project.
                                                </p>
                                            </div>

                                            <ProjectAssetTitleForm
                                                asset={selectedAsset}
                                                projectId={projectId}
                                                mode="panel"
                                            />
                                        </section>

                                        <section className="space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Quick read</p>
                                                <p className="text-xs leading-5 text-muted-foreground">
                                                    A fast visual summary of this frame before you read the fuller notes.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="rounded-xl border bg-card/70 p-3">
                                                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                                        Composition
                                                    </p>
                                                    <p className="mt-2 text-lg font-semibold">
                                                        {formatScoreLabel(
                                                            selectedAsset.analysis?.composition_score ??
                                                                null,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border bg-card/70 p-3">
                                                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                                        Focus
                                                    </p>
                                                    <p className="mt-2 text-lg font-semibold">
                                                        {formatScoreLabel(
                                                            selectedAsset.analysis?.focus_score ??
                                                                null,
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border bg-card/70 p-3">
                                                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                                        Lighting
                                                    </p>
                                                    <p className="mt-2 text-lg font-semibold">
                                                        {formatScoreLabel(
                                                            selectedAsset.analysis?.lighting_score ??
                                                                null,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4 rounded-xl border bg-card/50 p-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">AI readout</p>
                                                <p className="text-xs leading-5 text-muted-foreground">
                                                    Tags, critique, and accessibility notes gathered for this image.
                                                </p>
                                            </div>

                                            {(selectedAsset.analysis?.tags?.length ?? 0) > 0 && (
                                                <div className="space-y-3">
                                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        Tags
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedAsset.analysis?.tags.map((tag) => (
                                                            <Badge key={tag} variant="outline">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3 rounded-lg border bg-background/60 p-4">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="size-4 text-primary" />
                                                    <p className="text-sm font-medium">
                                                        Curator notes
                                                    </p>
                                                </div>
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    {selectedAsset.analysis?.critique ??
                                                        'Curator is still processing this image. Notes will appear here automatically.'}
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                    Alt text
                                                </p>
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    {selectedAsset.analysis?.alt_text ??
                                                        'Alt text will appear once AI analysis finishes.'}
                                                </p>
                                            </div>

                                            {selectedAsset.analysis?.mood && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        Mood
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedAsset.analysis.mood}
                                                    </p>
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                </div>

                                <div className="border-t bg-background/95 px-6 py-4 backdrop-blur-sm">
                                    <div className="space-y-4">
                                        {isDeleteConfirming && (
                                            <div className="rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-4">
                                                <div className="space-y-3">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Are you sure you want to delete this image?
                                                    </p>

                                                    <div className="flex items-center gap-3">
                                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/15 text-destructive shadow-sm">
                                                        <AlertTriangle className="size-5" />
                                                    </div>

                                                        <div className="min-w-0 flex-1 space-y-1 text-left">
                                                            <p className="truncate text-sm font-medium text-foreground">
                                                            {getAssetDisplayTitle(
                                                                selectedAsset,
                                                            )}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                            File: {selectedAsset.filename}
                                                            </p>
                                                            {selectedAsset.is_cover && (
                                                                <p className="text-xs text-destructive">
                                                                    This will also clear the project cover.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-3">
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
                                                        disabled={isDeletingAsset}
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={
                                                            confirmDeleteSelectedAsset
                                                        }
                                                        disabled={isDeletingAsset}
                                                        className="flex-1 sm:flex-none"
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
                                                        disabled={isDeletingAsset}
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Delete image
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        <a
                                                            href={selectedAsset.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Open full image
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
