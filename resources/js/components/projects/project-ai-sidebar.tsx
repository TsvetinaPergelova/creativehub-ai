import { useState } from 'react';
import { ChevronDown, Sparkles, Star } from 'lucide-react';
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
    const topTags = Array.from(
        new Set(
            analyzedAssets.flatMap((asset) => asset.analysis?.tags ?? []),
        ),
    ).slice(0, 8);
    const visibleHighlights = highlights.slice(0, 3);

    return (
        <aside className="xl:sticky xl:top-6">
            <Card className="overflow-hidden bg-card/60">
                <CardHeader className="pb-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                                <Sparkles className="size-4" />
                            </div>
                            <div>
                                <CardTitle>{curator.assistant_name}</CardTitle>
                                <CardDescription>AI curator</CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className="border-white/10 bg-black/20"
                        >
                            Live
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                    <p className="text-sm leading-6 text-muted-foreground">
                        {curator.summary}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
                        <div className="rounded-lg border bg-background/60 p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                Analyzed
                            </p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight">
                                {analyzedAssets.length}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                of {(project.assets ?? []).length} uploaded
                            </p>
                        </div>
                        <div className="rounded-lg border bg-background/60 p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                Highlights
                            </p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight">
                                {highlights.length}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                strongest frames
                            </p>
                        </div>
                        <div className="rounded-lg border bg-background/60 p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                Tagged cues
                            </p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight">
                                {topTags.length}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                reusable themes
                            </p>
                        </div>
                    </div>

                    <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-between px-0"
                            >
                                Open curator details
                                <ChevronDown
                                    className={`size-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
                                />
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-5 pt-2">
                            <div className="space-y-3">
                                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                    Curator vocabulary
                                </p>
                                {topTags.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Tags will appear after image analysis
                                        finishes.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {topTags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <CardTitle className="text-base">
                                        Highlights
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Strongest frames surfaced from current
                                        analysis.
                                    </CardDescription>
                                </div>

                                {visibleHighlights.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Upload more images to unlock highlight
                                        suggestions.
                                    </p>
                                ) : (
                                    visibleHighlights.map((asset) => (
                                        <div
                                            key={asset.id}
                                            className="rounded-lg border bg-background/60 p-4"
                                        >
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Star className="size-4 text-amber-400" />
                                                {asset.filename}
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                {asset.analysis?.critique ??
                                                    'Curator selected this frame as a strong visual lead.'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>
        </aside>
    );
}
