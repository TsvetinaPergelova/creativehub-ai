import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { show } from '@/actions/App/Http/Controllers/Projects/ProjectController';
import type { Project } from '@/types';

export default function ProjectCard({ project }: { project: Project }) {
    return (
        <Card className="gap-4">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.category}</CardDescription>
                    </div>

                    <Badge variant="outline" className="capitalize">
                        {project.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <p className="line-clamp-3 min-h-15 text-sm text-muted-foreground">
                    {project.description ?? 'No description added yet.'}
                </p>

                <Badge className="capitalize">{project.visibility}</Badge>
            </CardContent>

            <CardFooter>
                <Link
                    href={show(project.id)}
                    className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                    prefetch
                >
                    Open project
                </Link>
            </CardFooter>
        </Card>
    );
}
