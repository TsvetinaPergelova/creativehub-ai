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
import type { Project } from '@/types';

export default function PublicProjectGrid({
    projects,
}: {
    projects: Project[];
}) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden gap-0">
                    <div className="aspect-[4/3] bg-muted">
                        {project.cover_image_url ? (
                            <img
                                src={project.cover_image_url}
                                alt={project.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                                Cover coming soon
                            </div>
                        )}
                    </div>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>
                                    {project.category}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="capitalize">
                                {project.visibility}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                            {project.description ?? 'No description added yet.'}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link
                            href={project.public_url ?? '#'}
                            className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                        >
                            View project
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
