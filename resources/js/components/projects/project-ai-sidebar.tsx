import { useState } from 'react';
import { ChevronDown, Sparkles, Star, Tags } from 'lucide-react';
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
    const [detailsOpen, setDetailsOpen] = useState(false);
    const analyzedAssets = (project.assets ?? []).filter((asset) => asset.analysis);
    const assetCount = (project.assets ?? []).length;
    const coverage = assetCount === 0
        ? 0
        : Math.round((analyzedAssets.length / assetCount) * 100);
    const topTags = Array.from(
        new Set(analyzedAssets.flatMap((asset) => asset.analysis?.tags ?? [])),
    ).slice(0, 8);
    const visibleHighlights = highlights.slice(0, 3);

    return (
        <Card className="overflow-hidden bg-card/60">
            <CardHeader className="space-y-4 border-b pb-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <Badge variant="outline">Step 2</Badge>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                                <Sparkles className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl tracking-tight">
                                    Curator review
                                </CardTitle>
                                <CardDescription>{curator.assistant_name}</CardDescription>
                            </div>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className="border-white/10 bg-black/20"
                    >
                        Live
                    </Badge>
                </div>

                <div className="space-y-3 rounded-xl border bg-background/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium">
                                Analysis coverage
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {analyzedAssets.length} of {assetCount} images reviewed
                            </p>
                        </div>
                        <p className="text-2xl font-semibold">{coverage}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${coverage}%` }}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
                <div className="rounded-xl border bg-background/50 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                        {curator.summary}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border bg-background/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            Reviewed
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {analyzedAssets.length}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-background/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            Highlights
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {highlights.length}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-background/60 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            Tags
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                            {topTags.length}
                        </p>
                    </div>
                </div>

                    <div className="space-y-3 rounded-xl border bg-background/50 p-4">
                        <div className="flex items-center gap-2">
                            <Star className="size-4 text-amber-400" />
                            <p className="text-sm font-medium">
                                Best picks so far
                            </p>
                        </div>

                        {visibleHighlights.length === 0 ? (
                            <p className="text-sm leading-6 text-muted-foreground">
                                Upload more images to help Curator surface
                                stronger favorites.
                            </p>
                        ) : (
                        visibleHighlights.map((asset) => (
                            <div
                                key={asset.id}
                                className="rounded-lg border bg-background/70 p-3"
                            >
                                <p className="text-sm font-medium">
                                    {asset.title ?? asset.filename}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {asset.analysis?.critique ??
                                        'Curator selected this frame as a strong visual lead.'}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <div className="rounded-xl border bg-background/50">
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-auto w-full justify-between px-4 py-4"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Tags className="size-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Curator tags
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Reusable keywords pulled from the set.
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'size-4 transition-transform',
                                        detailsOpen && 'rotate-180',
                                    )}
                                />
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-3 border-t px-4 pb-4 pt-3">
                            {topTags.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Tags will appear after image analysis
                                    finishes.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {topTags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
