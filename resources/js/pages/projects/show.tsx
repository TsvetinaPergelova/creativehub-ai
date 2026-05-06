import { Head, Link } from '@inertiajs/react';
import { PencilLine } from 'lucide-react';
import { edit, index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import Heading from '@/components/heading';
import ProjectAiSidebar from '@/components/projects/project-ai-sidebar';
import ProjectAssetGrid from '@/components/projects/project-asset-grid';
import ProjectSharePanel from '@/components/projects/project-share-panel';
import ProjectUploadDropzone from '@/components/projects/project-upload-dropzone';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    return (
        <>
            <Head title={project.name} />

            <div className="grid gap-6 p-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <Heading
                            title={project.name}
                            description={
                                project.description ??
                                'Add a description to help frame this project before upload.'
                            }
                        />

                        <Button variant="outline" asChild>
                            <Link href={edit(project.id)} prefetch>
                                <PencilLine className="mr-2 size-4" />
                                Edit details
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project overview</CardTitle>
                            <CardDescription>
                                This is the starting shell for the project manager.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Category
                                </p>
                                <p className="font-medium">{project.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Status
                                </p>
                                <Badge className="capitalize">{project.status}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Visibility
                                </p>
                                <Badge variant="outline" className="capitalize">
                                    {project.visibility}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <ProjectSharePanel
                        project={project}
                        sharePanel={sharePanel}
                    />

                    <ProjectUploadDropzone projectId={project.id} />

                    <section className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Asset library</h2>
                            <p className="text-sm text-muted-foreground">
                                Review the raw upload set before AI analysis and
                                curation layers are added.
                            </p>
                        </div>

                        <ProjectAssetGrid assets={project.assets ?? []} />
                    </section>
                </div>

                <ProjectAiSidebar
                    curator={curator}
                    project={project}
                    highlights={highlights}
                />
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
