import { Badge } from '@/components/ui/badge';
import type { ProjectAsset } from '@/types';

function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectAssetGrid({
    assets,
}: {
    assets: ProjectAsset[];
}) {
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
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {assets.map((asset) => (
                <article
                    key={asset.id}
                    className="overflow-hidden rounded-xl border bg-card/80 shadow-sm"
                >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                            src={asset.url}
                            alt={asset.filename}
                            className="h-full w-full object-cover"
                        />
                        {!asset.analysis && (
                            <div className="absolute inset-x-3 bottom-3 rounded-md bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm">
                                AI is reviewing this image...
                            </div>
                        )}
                        {asset.analysis?.is_highlight && (
                            <div className="absolute left-4 top-4">
                                <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-300">
                                    Highlight
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 p-4">
                        <p className="truncate text-sm font-medium">
                            {asset.filename}
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
                </article>
            ))}
        </div>
    );
}
