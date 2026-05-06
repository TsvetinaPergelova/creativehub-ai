import { useForm } from '@inertiajs/react';
import { Globe, Images } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Projects/ProjectPublishController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Project, ProjectSharePanel } from '@/types';

export default function ProjectSharePanel({
    project,
    sharePanel,
}: {
    project: Project;
    sharePanel: ProjectSharePanel;
}) {
    const form = useForm({
        visibility: project.visibility === 'client' ? 'client' : 'public',
    });

    const publish = (visibility: 'public' | 'client') => {
        form.setData('visibility', visibility);
        form.post(store(project.id), {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Publish and share</CardTitle>
                <CardDescription>
                    Choose how this project should be exposed outside your
                    workspace.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                        {sharePanel.visibility}
                    </Badge>
                    {project.published_at ? (
                        <span className="text-sm text-muted-foreground">
                            Published and ready to share
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            Still in draft mode
                        </span>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        onClick={() => publish('public')}
                        disabled={form.processing}
                    >
                        <Globe className="mr-2 size-4" />
                        Publish publicly
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => publish('client')}
                        disabled={form.processing}
                    >
                        <Images className="mr-2 size-4" />
                        Publish for clients
                    </Button>
                </div>

                <div className="space-y-3 rounded-xl border p-4">
                    <div>
                        <p className="text-sm font-medium">Public portfolio link</p>
                        <p className="text-sm text-muted-foreground">
                            {sharePanel.public_url ??
                                'Publish the project first to generate this link.'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-medium">Client gallery link</p>
                        <p className="text-sm text-muted-foreground">
                            {sharePanel.client_url ??
                                'A client gallery link will appear once the project is published.'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
