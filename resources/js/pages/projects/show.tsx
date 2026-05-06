import { Head, Link } from '@inertiajs/react';
import { PencilLine } from 'lucide-react';
import { edit, index } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Project } from '@/types';

export default function ShowProject({ project }: { project: Project }) {
    return (
        <>
            <Head title={project.name} />

            <div className="space-y-6 p-4">
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
