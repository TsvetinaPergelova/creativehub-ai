import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ChevronDown, Globe, Images } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Projects/ProjectPublishController';
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
import type { Project, ProjectSharePanel } from '@/types';

export default function ProjectSharePanel({
    project,
    sharePanel,
}: {
    project: Project;
    sharePanel: ProjectSharePanel;
}) {
    const [isOpen, setIsOpen] = useState(false);
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
        <Card className="bg-card/60">
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle>Publishing</CardTitle>
                    <CardDescription>
                        Decide how this project should travel outside your
                        workspace.
                    </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                        {sharePanel.visibility}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        {project.published_at
                            ? 'Ready to share'
                            : 'Still in draft mode'}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                        type="button"
                        variant={
                            sharePanel.visibility === 'public'
                                ? 'default'
                                : 'secondary'
                        }
                        className="h-auto justify-start px-5 py-4"
                        onClick={() => publish('public')}
                        disabled={form.processing}
                    >
                        <div className="flex items-start gap-3 text-left">
                            <Globe className="mt-0.5 size-4" />
                            <div>
                                <p className="font-medium">Publish publicly</p>
                                <p className="text-xs text-current/75">
                                    Visible on your portfolio and explore feed.
                                </p>
                            </div>
                        </div>
                    </Button>
                    <Button
                        type="button"
                        variant={
                            sharePanel.visibility === 'client'
                                ? 'default'
                                : 'outline'
                        }
                        className="h-auto justify-start px-5 py-4"
                        onClick={() => publish('client')}
                        disabled={form.processing}
                    >
                        <div className="flex items-start gap-3 text-left">
                            <Images className="mt-0.5 size-4" />
                            <div>
                                <p className="font-medium">Publish for clients</p>
                                <p className="text-xs text-current/75">
                                    Generate a private gallery flow for reviews.
                                </p>
                            </div>
                        </div>
                    </Button>
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-between px-0"
                        >
                            View sharing links
                            <ChevronDown
                                className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-3 pt-2">
                        <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-lg border bg-background/60 p-4">
                                <p className="text-sm font-medium">
                                    Public portfolio link
                                </p>
                                <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                                    {sharePanel.public_url ??
                                        'Publish the project first to generate this link.'}
                                </p>
                            </div>

                            <div className="rounded-lg border bg-background/60 p-4">
                                <p className="text-sm font-medium">
                                    Client gallery link
                                </p>
                                <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                                    {sharePanel.client_url ??
                                        'A client gallery link will appear once the project is published.'}
                                </p>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
