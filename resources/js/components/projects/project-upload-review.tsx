import { useEffect } from 'react';
import { useRemember } from '@inertiajs/react';
import ProjectAssetTitleForm from '@/components/projects/project-asset-title-form';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ProjectAsset } from '@/types';

export default function ProjectUploadReview({
    assets,
    projectId,
    recentlyUploadedAssetIds,
}: {
    assets: ProjectAsset[];
    projectId: number;
    recentlyUploadedAssetIds: number[];
}) {
    const [reviewAssetIds, setReviewAssetIds] = useRemember<number[]>(
        recentlyUploadedAssetIds,
        `projects.${projectId}.recent-upload-review`,
    );

    useEffect(() => {
        if (recentlyUploadedAssetIds.length === 0) {
            return;
        }

        setReviewAssetIds((currentIds) => {
            const mergedIds = new Set([...currentIds, ...recentlyUploadedAssetIds]);

            return [...mergedIds];
        });
    }, [recentlyUploadedAssetIds, setReviewAssetIds]);

    const assetsForReview = reviewAssetIds
        .map((assetId) => assets.find((asset) => asset.id === assetId) ?? null)
        .filter((asset): asset is ProjectAsset => asset !== null)
        .filter((asset) => !asset.title);

    if (assetsForReview.length === 0) {
        return null;
    }

    return (
        <Card className="bg-white dark:bg-card/60">
            <CardHeader>
                <Badge variant="outline" className="w-fit">
                    Optional
                </Badge>
                <CardTitle>Optional: name new uploads</CardTitle>
                <CardDescription>
                    Clear titles help you scan the library later, but Curator
                    already reviewed these uploads. You can name them now or
                    come back to them later without blocking the analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {assetsForReview.map((asset) => (
                    <div
                        key={asset.id}
                    className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-background/70"
                    >
                        <div className="overflow-hidden rounded-lg border bg-muted">
                            <img
                                src={asset.url}
                                alt={asset.title ?? asset.filename}
                                className="aspect-[4/3] w-full object-cover"
                            />
                        </div>

                        <ProjectAssetTitleForm
                            asset={asset}
                            projectId={projectId}
                            onSaved={() =>
                                setReviewAssetIds((currentIds) =>
                                    currentIds.filter((assetId) => assetId !== asset.id),
                                )
                            }
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
