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
        <Card className="bg-card/60">
            <CardHeader>
                <Badge variant="outline" className="w-fit">
                    Step 1A
                </Badge>
                <CardTitle>Name new uploads</CardTitle>
                <CardDescription>
                    Give the latest images clear titles while the set is still
                    fresh. Once saved, they drop into the library below with
                    the new title.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {assetsForReview.map((asset) => (
                    <div
                        key={asset.id}
                        className="space-y-4 rounded-lg border bg-background/70 p-4"
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
