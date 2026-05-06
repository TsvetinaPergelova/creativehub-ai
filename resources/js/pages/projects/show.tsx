import { Head, Link, usePoll } from '@inertiajs/react';
import { useEffect } from 'react';
import { ChevronDown, LoaderCircle, PencilLine, Sparkles } from 'lucide-react';
import { edit, index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import Heading from '@/components/heading';
import ProjectAiSidebar from '@/components/projects/project-ai-sidebar';
import ProjectAssetGrid from '@/components/projects/project-asset-grid';
import ProjectSharePanel from '@/components/projects/project-share-panel';
import ProjectUploadDropzone from '@/components/projects/project-upload-dropzone';
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
import type { Project, ProjectAsset, ProjectSharePanel as ProjectSharePanelData } from '@/types';

type CuratorSummary = {
    assistant_name: string;
    summary: string;
};

export default function ShowProject({
    project,
    curator,
    highlights,
    sharePanel,
}: {
    project: Project;
    curator: CuratorSummary;
    highlights: ProjectAsset[];
    sharePanel: ProjectSharePanelData;
}) {
    const assets = project.assets ?? [];
    const analyzedAssets = assets.filter((asset) => asset.analysis);
    const pendingAssets = assets.filter((asset) => !asset.analysis);
    const hasPendingAnalysis = pendingAssets.length > 0;
    const heroStats = [
        {
            label: 'Assets',
            value: assets.length,
        },
        {
            label: 'Analyzed',
            value: analyzedAssets.length,
        },
        {
            label: 'Highlights',
            value: highlights.length,
        },
    ];
    const { start, stop } = usePoll(
        2500,
        {
            only: ['project', 'highlights', 'curator'],
            preserveScroll: true,
        },
        {
            autoStart: false,
            keepAlive: true,
        },
    );

    useEffect(() => {
        if (hasPendingAnalysis) {
            start();

            return stop;
        }

        stop();
    }, [hasPendingAnalysis, start, stop]);

    return (
        <>
            <Head title={project.name} />

            <div className="space-y-6 p-4 sm:p-6">
                <section className="relative overflow-hidden rounded-xl border bg-card/70 px-6 py-8 shadow-sm sm:px-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_40%)]" />
                    <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
                        <div className="space-y-5">
                            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                                {project.category}
                            </p>
                            <Heading
                                title={project.name}
                                description={
                                    project.description ??
                                    'Add a description to help frame this project before upload.'
                                }
                            />
                            <div className="flex flex-wrap gap-2">
                                <Badge className="capitalize">{project.status}</Badge>
                                <Badge variant="outline" className="capitalize">
                                    {project.visibility}
                                </Badge>
                            </div>
                        </div>

                        <Card className="gap-4 py-5 shadow-sm">
                            <CardHeader className="px-5">
                                <CardTitle>Project pulse</CardTitle>
                                <CardDescription>
                                    Your working set, condensed into the numbers
                                    that matter right now.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 px-5 sm:grid-cols-3">
                                {heroStats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-lg border bg-background/60 p-4"
                                    >
                                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold tracking-tight">
                                            {stat.value}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                            <CardContent className="px-5 pt-0">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={edit(project.id)} prefetch>
                                        <PencilLine className="mr-2 size-4" />
                                        Edit details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
                    <div className="space-y-6">
                        <ProjectUploadDropzone projectId={project.id} />

                        <Card className="bg-card/60">
                            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                                        {hasPendingAnalysis ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="size-4" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {hasPendingAnalysis
                                                ? 'AI analysis in progress'
                                                : 'AI analysis complete'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {hasPendingAnalysis
                                                ? `${pendingAssets.length} image${pendingAssets.length === 1 ? '' : 's'} still being reviewed. New insights will appear automatically.`
                                                : 'Everything uploaded so far has been analyzed and synced into the workspace.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-52">
                                    <div className="rounded-lg border bg-background/60 px-3 py-2">
                                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                            Reviewed
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {analyzedAssets.length}/{assets.length}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-background/60 px-3 py-2">
                                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                            Pending
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {pendingAssets.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Collapsible defaultOpen>
                            <div className="rounded-xl border bg-card/60 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold tracking-tight">
                                            Asset library
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Review the raw upload set before AI
                                            analysis and curation layers are
                                            layered in.
                                        </p>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button type="button" variant="ghost" size="icon">
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent className="pt-5">
                                    <ProjectAssetGrid assets={assets} />
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    </div>

                    <div className="space-y-6">
                        <ProjectSharePanel
                            project={project}
                            sharePanel={sharePanel}
                        />

                        <ProjectAiSidebar
                            curator={curator}
                            project={project}
                            highlights={highlights}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

ShowProject.layout = {
    breadcrumbs: [
        {
            title: 'Projects',
            href: index(),
        },
    ],
};
