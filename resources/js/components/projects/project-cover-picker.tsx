import { useEffect, useState } from 'react';
import { CheckCircle2, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import ProjectCoverController from '@/actions/App/Http/Controllers/Projects/ProjectCoverController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProjectAsset } from '@/types';
import { useForm } from '@inertiajs/react';

function getAssetDisplayTitle(asset: ProjectAsset): string {
    return asset.title ?? asset.filename;
}

export default function ProjectCoverPicker({
    assets,
    coverAssetId,
    projectId,
}: {
    assets: ProjectAsset[];
    coverAssetId: number | null | undefined;
    projectId: number;
}) {
    const [open, setOpen] = useState(false);
    const [selectedCoverId, setSelectedCoverId] = useState<number | null>(
        coverAssetId ?? null,
    );
    const form = useForm<{
        cover_asset_id: number | null;
    }>({
        cover_asset_id: coverAssetId ?? null,
    });

    useEffect(() => {
        const nextCoverId = coverAssetId ?? null;

        setSelectedCoverId(nextCoverId);
        form.setDefaults('cover_asset_id', nextCoverId);
        form.setData('cover_asset_id', nextCoverId);
    }, [coverAssetId]);

    function selectCover(nextCoverId: number | null): void {
        setSelectedCoverId(nextCoverId);
        form.setData('cover_asset_id', nextCoverId);
    }

    function submit(): void {
        form.patch(ProjectCoverController.update(projectId).url, {
            preserveScroll: true,
            only: ['project'],
            onSuccess: () => {
                setOpen(false);
            },
        });
    }

    function removeCover(): void {
        selectCover(null);

        form.patch(ProjectCoverController.update(projectId).url, {
            preserveScroll: true,
            only: ['project'],
        });
    }

    const hasAssets = assets.length > 0;
    const selectedAsset = assets.find((asset) => asset.id === selectedCoverId) ?? null;

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    variant={coverAssetId ? 'secondary' : 'default'}
                    className="h-11"
                    onClick={() => setOpen(true)}
                    disabled={!hasAssets}
                >
                    <ImagePlus className="mr-2 size-4" />
                    {coverAssetId ? 'Change cover' : 'Choose cover'}
                </Button>

                {coverAssetId && (
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={removeCover}
                        disabled={form.processing}
                    >
                        {form.processing && form.data.cover_asset_id === null ? (
                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 size-4" />
                        )}
                        Use auto-picked preview
                    </Button>
                )}

                {!hasAssets && (
                    <p className="text-sm text-muted-foreground">
                        Upload at least one image to personalize this project.
                    </p>
                )}

                {form.recentlySuccessful && (
                    <p className="text-sm font-medium text-primary">
                        {coverAssetId ? 'Cover saved.' : 'Auto-picked preview restored.'}
                    </p>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-5xl">
                    <DialogHeader className="border-b px-6 py-5">
                        <DialogTitle>Choose a project cover</DialogTitle>
                        <DialogDescription>
                            Pick one of your uploaded images if you want more
                            control over how the project appears across the
                            workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="border-b bg-card/50 px-6 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <ImagePlus className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium">
                                    {selectedAsset
                                        ? `Selected cover: ${getAssetDisplayTitle(selectedAsset)}`
                                        : 'Using auto-picked preview'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedAsset
                                        ? 'Press Save cover to use this image in the project hero and cards.'
                                        : 'Pick one image below, or keep the auto-picked preview.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[calc(90vh-8.5rem)] overflow-y-auto px-6 py-5">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <button
                                type="button"
                                onClick={() => selectCover(null)}
                                className={cn(
                                    'overflow-hidden rounded-xl border bg-card/70 text-left transition hover:border-primary/40 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                                    selectedCoverId === null && 'border-primary ring-1 ring-primary/30',
                                )}
                            >
                                <div className="relative flex aspect-[4/3] items-center justify-center bg-muted/60 p-6">
                                    {selectedCoverId === null && (
                                        <div className="absolute right-3 top-3">
                                            <Badge className="gap-1">
                                                <CheckCircle2 className="size-3.5" />
                                                Selected
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="space-y-2 text-center">
                                        <p className="text-sm font-medium">
                                            Keep auto-picked preview
                                        </p>
                                        <p className="text-xs leading-5 text-muted-foreground">
                                            Curator will keep using the
                                            strongest uploaded frame until you
                                            choose a specific cover.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm font-medium">
                                        No custom cover
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        The project keeps its current preview
                                        automatically.
                                    </p>
                                </div>
                            </button>

                            {assets.map((asset) => {
                                const isSelected = selectedCoverId === asset.id;
                                const isCurrentCover = coverAssetId === asset.id;

                                return (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => selectCover(asset.id)}
                                        className={cn(
                                            'overflow-hidden rounded-xl border bg-card/70 text-left transition hover:border-primary/40 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                                            isSelected && 'border-primary ring-1 ring-primary/30',
                                        )}
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                            <img
                                                src={asset.url}
                                                alt={getAssetDisplayTitle(asset)}
                                                className="size-full object-cover"
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-primary/10 ring-2 ring-inset ring-primary" />
                                            )}
                                            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                                {isSelected && (
                                                    <Badge className="gap-1">
                                                        <CheckCircle2 className="size-3.5" />
                                                        Selected
                                                    </Badge>
                                                )}
                                                {isCurrentCover && (
                                                    <Badge variant="secondary">
                                                        Current cover
                                                    </Badge>
                                                )}
                                                {asset.analysis?.is_highlight && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-amber-400 text-amber-950 hover:bg-amber-300"
                                                    >
                                                        Highlight
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2 p-4">
                                            <p className="truncate text-sm font-medium">
                                                {getAssetDisplayTitle(asset)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {asset.filename}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="sticky bottom-0 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {selectedCoverId === null
                                ? 'Curator will keep using the auto-picked preview until you choose a specific cover.'
                                : 'This image will appear in the project hero and on your dashboard project card.'}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={submit}
                                disabled={form.processing || !form.isDirty}
                            >
                                {form.processing ? 'Saving...' : 'Save cover'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
