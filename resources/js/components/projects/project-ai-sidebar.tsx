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
    const analyzedAssets = (project.assets ?? []).filter(
        (asset) => asset.analysis,
    );
    const topTags = Array.from(
        new Set(analyzedAssets.flatMap((asset) => asset.analysis?.tags ?? [])),
    ).slice(0, 8);
    const visibleHighlights = highlights.slice(0, 3);

    return (
        <Card className="overflow-hidden bg-card/60">
            <CardHeader className="space-y-4 border-b px-4 py-5 sm:px-6 sm:pb-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                            <Sparkles className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-2xl tracking-tight">
                                Curator review
                            </CardTitle>
                            <CardDescription>
                                What {curator.assistant_name} has already
                                surfaced from this set.
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 p-4 sm:p-6">
                <p className="text-sm leading-6 text-muted-foreground">
                    {curator.summary}
                </p>

                <div className="space-y-4">
                    <div className="space-y-3">
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
                                    <p className="text-sm font-medium break-words">
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

                    <Collapsible
                        open={detailsOpen}
                        onOpenChange={setDetailsOpen}
                    >
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
                                        <div className="min-w-0">
                                            <p className="font-medium">
                                                Curator tags
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Reusable keywords pulled from
                                                the set.
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'size-4 shrink-0 transition-transform',
                                            detailsOpen && 'rotate-180',
                                        )}
                                    />
                                </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-3 border-t px-4 pt-3 pb-4">
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
                </div>
            </CardContent>
        </Card>
    );
}
