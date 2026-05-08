import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Check, ChevronDown, Copy, ExternalLink, Globe, Images, Link2, RadioTower } from 'lucide-react';
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
import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';
import type { Project, ProjectSharePanel } from '@/types';

function ShareLinkCard({
    label,
    url,
    copiedText,
    onCopy,
}: {
    label: string;
    url: string | null;
    copiedText: string | null;
    onCopy: (url: string) => void;
}) {
    const isCopied = copiedText !== null && copiedText === url;

    return (
        <div className="rounded-lg border bg-background/70 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium">
                        {label}
                    </p>
                    {url ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex max-w-full items-center gap-2 break-all font-mono text-xs leading-5 text-primary transition-colors hover:text-primary/80"
                        >
                            <span className="break-all">{url}</span>
                            <ExternalLink className="size-3.5 shrink-0" />
                        </a>
                    ) : (
                        <p className="mt-2 break-all font-mono text-xs leading-5 text-muted-foreground">
                            {label === 'Public portfolio link'
                                ? 'Activate public portfolio mode to generate this link.'
                                : 'Activate the client review flow to generate this link.'}
                        </p>
                    )}
                </div>

                {url && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 self-center"
                        onClick={() => onCopy(url)}
                    >
                        {isCopied ? (
                            <Check className="size-4" />
                        ) : (
                            <Copy className="size-4" />
                        )}
                        <span className="sr-only">Copy {label}</span>
                    </Button>
                )}
            </div>
        </div>
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
    const [copiedText, copy] = useClipboard();
    const form = useForm({
        visibility: project.visibility === 'client' ? 'client' : 'public',
    });

    function publish(visibility: 'public' | 'client'): void {
        form.setData('visibility', visibility);
        form.post(store(project.id), {
            preserveScroll: true,
        });
    }

    const isPublic = sharePanel.visibility === 'public';
    const isClient = sharePanel.visibility === 'client';

    return (
        <Card className="overflow-hidden bg-card/60">
            <CardHeader className="space-y-4 border-b pb-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <Badge variant="outline">Step 3</Badge>
                        <CardTitle className="text-2xl tracking-tight">
                            Share this project
                        </CardTitle>
                        <CardDescription className="max-w-md text-sm leading-6">
                            Choose where this project goes next: onto your
                            public portfolio, or into a private client review
                            flow.
                        </CardDescription>
                    </div>

                    <div className="rounded-xl border bg-background/60 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Sharing mode
                        </p>
                        <p className="mt-2 text-lg font-semibold capitalize">
                            {sharePanel.visibility}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border bg-background/50 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                            <RadioTower className="size-4" />
                        </div>
                        <div className="space-y-1">
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
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => publish('public')}
                        disabled={form.processing}
                        className={cn(
                            'w-full rounded-xl border p-4 text-left transition focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                            isPublic
                                ? 'border-primary bg-primary/10'
                                : 'bg-background/50 hover:border-primary/40',
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background/80">
                                <Globe className="size-4" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">
                                        Public portfolio page
                                    </p>
                                    {isPublic && <Badge>Active</Badge>}
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Show the project on your public portfolio
                                    and make it eligible for Explore.
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => publish('client')}
                        disabled={form.processing}
                        className={cn(
                            'w-full rounded-xl border p-4 text-left transition focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                            isClient
                                ? 'border-primary bg-primary/10'
                                : 'bg-background/50 hover:border-primary/40',
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background/80">
                                <Images className="size-4" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">
                                        Private client gallery
                                    </p>
                                    {isClient && <Badge>Active</Badge>}
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Generate a private gallery link and keep the
                                    conversation focused on feedback and
                                    selection.
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className="rounded-xl border bg-background/50">
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-auto w-full justify-between px-4 py-4"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Link2 className="size-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Live links
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Open or copy the destinations people will use.
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

                        <CollapsibleContent className="space-y-3 border-t px-4 pb-4 pt-3">
                            <ShareLinkCard
                                label="Public portfolio link"
                                url={sharePanel.public_url}
                                copiedText={copiedText}
                                onCopy={copy}
                            />

                            <ShareLinkCard
                                label="Client gallery link"
                                url={sharePanel.client_url}
                                copiedText={copiedText}
                                onCopy={copy}
                            />
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            </CardContent>
        </Card>
    );
}
