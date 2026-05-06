import { Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Project, ProjectAsset } from '@/types';

type CuratorSummary = {
    assistant_name: string;
    summary: string;
};

export default function ProjectAiSidebar({
    curator,
    project,
    highlights,
}: {
    curator: CuratorSummary;
    project: Project;
    highlights: ProjectAsset[];
}) {
    const analyzedAssets = (project.assets ?? []).filter((asset) => asset.analysis);
    const topTags = Array.from(
        new Set(
            analyzedAssets.flatMap((asset) => asset.analysis?.tags ?? []),
        ),
    ).slice(0, 8);

    return (
        <aside className="space-y-4 xl:sticky xl:top-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Sparkles className="size-4" />
                        </div>
                        <div>
                            <CardTitle>{curator.assistant_name}</CardTitle>
                            <CardDescription>AI curator</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {curator.summary}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Analysis snapshot</CardTitle>
                    <CardDescription>
                        Quick read on how much of the set Curator has processed.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-lg border p-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            Analyzed
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {analyzedAssets.length}
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            Highlights
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {highlights.length}
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            Tagged cues
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                            {topTags.length}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Highlights</CardTitle>
                    <CardDescription>
                        Strongest frames surfaced from current analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {highlights.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Upload more images to unlock highlight suggestions.
                        </p>
                    ) : (
                        highlights.map((asset) => (
                            <div
                                key={asset.id}
                                className="rounded-lg border p-3"
                            >
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Star className="size-4 text-amber-500" />
                                    {asset.filename}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {asset.analysis?.critique ??
                                        'Curator selected this frame as a strong visual lead.'}
                                </p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Top tags</CardTitle>
                    <CardDescription>
                        Reusable keywords generated from current assets.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {topTags.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Tags will appear after image analysis finishes.
                        </p>
                    ) : (
                        topTags.map((tag) => (
                            <Badge key={tag} variant="outline">
                                {tag}
                            </Badge>
                        ))
                    )}
                </CardContent>
            </Card>
        </aside>
    );
}
