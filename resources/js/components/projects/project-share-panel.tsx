import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    Globe,
    Images,
    Link2,
    RadioTower,
} from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Projects/ProjectPublishController';
import {
    ProjectIconBadge,
    ProjectInsetPanel,
    ProjectOptionCard,
} from '@/components/projects/project-ui';
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
import type { Project, ProjectSharePanel } from '@/types';

function ShareLinkCard({
    label,
    url,
}: {
    label: string;
    url: string | null;
}) {
    return (
        <ProjectInsetPanel className="bg-background/70">
            <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                {url ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block max-w-full font-mono text-xs leading-5 break-all text-primary transition-colors hover:text-primary/80"
                    >
                        {url}
                    </a>
                ) : (
                    <p className="mt-2 font-mono text-xs leading-5 break-all text-muted-foreground">
                        {label === 'Public portfolio link'
                            ? 'Activate public portfolio mode to generate this link.'
                            : 'Activate the client review flow to generate this link.'}
                    </p>
                )}
            </div>
        </ProjectInsetPanel>
    );
}

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

    function publish(visibility: 'public' | 'client'): void {
        form.setData('visibility', visibility);
        form.post(store(project.id).url, {
            preserveScroll: true,
        });
    }

    const isPublic = sharePanel.visibility === 'public';
    const isClient = sharePanel.visibility === 'client';
    const approvalDate = sharePanel.client_review?.approved_at
        ? new Intl.DateTimeFormat('en', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(sharePanel.client_review.approved_at))
        : null;

    return (
        <Card className="overflow-hidden bg-white shadow-none dark:bg-card/60">
            <CardHeader className="space-y-4 border-b px-4 py-5 sm:px-6 sm:pb-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl tracking-tight">
                            Share this project
                        </CardTitle>
                        <CardDescription className="max-w-md text-sm leading-6">
                            Choose where this project goes next: onto your
                            public portfolio, or into a private client review
                            flow.
                        </CardDescription>
                    </div>

                    <div className="rounded-xl border bg-background/60 px-4 py-3 sm:self-start sm:text-right">
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Sharing mode
                        </p>
                        <p className="mt-2 text-lg font-semibold capitalize">
                            {sharePanel.visibility}
                        </p>
                    </div>
                </div>

                <ProjectInsetPanel>
                    <div className="flex items-start gap-3">
                        <ProjectIconBadge icon={RadioTower} />
                        <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium">
                                {project.published_at
                                    ? 'This project is ready to be seen'
                                    : 'Choose a sharing mode when the set feels ready'}
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                                {project.published_at
                                    ? 'You can switch between public visibility and private client delivery at any time.'
                                    : 'This area controls how other people will experience the project once it leaves your workspace.'}
                            </p>
                        </div>
                    </div>
                </ProjectInsetPanel>
            </CardHeader>

            <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-3">
                    <ProjectOptionCard
                        icon={Globe}
                        title="Public portfolio page"
                        description="Show the project on your public portfolio and make it eligible for Explore."
                        selected={isPublic}
                        onClick={() => publish('public')}
                        disabled={form.processing}
                        badge={isPublic ? <Badge>Active</Badge> : undefined}
                    />

                    <ProjectOptionCard
                        icon={Images}
                        title="Private client gallery"
                        description="Generate a private gallery link and keep the conversation focused on feedback and selection."
                        selected={isClient}
                        onClick={() => publish('client')}
                        disabled={form.processing}
                        badge={isClient ? <Badge>Active</Badge> : undefined}
                    />
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <ProjectInsetPanel className="p-0">
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-auto w-full justify-between px-4 py-4"
                            >
                                <div className="flex min-w-0 items-center gap-3 text-left">
                                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Link2 className="size-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium">
                                            Live links
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Open the destinations people will
                                            use.
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'size-4 transition-transform',
                                        isOpen && 'rotate-180',
                                    )}
                                />
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-3 border-t px-4 pt-3 pb-4">
                            <ShareLinkCard
                                label="Public portfolio link"
                                url={sharePanel.public_url}
                            />

                            <ShareLinkCard
                                label="Client gallery link"
                                url={sharePanel.client_url}
                            />
                        </CollapsibleContent>
                    </ProjectInsetPanel>
                </Collapsible>

                {sharePanel.client_review?.approved_at ? (
                    <ProjectInsetPanel className="bg-background/70">
                        <div className="flex items-start gap-3">
                            <ProjectIconBadge icon={Check} />
                            <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium">
                                        Client shortlist approved
                                    </p>
                                    {approvalDate ? (
                                        <Badge variant="outline">
                                            {approvalDate}
                                        </Badge>
                                    ) : null}
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {sharePanel.client_review.favorites_count} favorite
                                    {sharePanel.client_review.favorites_count === 1
                                        ? ''
                                        : 's'}{' '}
                                    saved by the client
                                    {sharePanel.client_review.reviewer_name
                                        ? ` as ${sharePanel.client_review.reviewer_name}`
                                        : ''}.
                                </p>
                                {sharePanel.client_review.reviewer_comment ? (
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        “{sharePanel.client_review.reviewer_comment}”
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </ProjectInsetPanel>
                ) : null}
            </CardContent>
        </Card>
    );
}
