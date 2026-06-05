import { Head } from '@inertiajs/react';
import { Check, Copy, Globe, Instagram, Mail } from 'lucide-react';
import PublicProjectGrid from '@/components/public/public-project-grid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClipboard } from '@/hooks/use-clipboard';
import { useInitials } from '@/hooks/use-initials';
import { resolveProfileCoverStyle } from '@/lib/profile-cover';
import type { Project } from '@/types';

type Creator = {
    id: number;
    name: string;
    avatar: string | null;
    specialization: string | null;
    location: string | null;
    bio: string | null;
    website_url: string | null;
    instagram_url: string | null;
    contact_email: string | null;
    profile_cover_style: string | null;
    profile_url: string;
};

export default function PublicProfile({
    creator,
    projects,
}: {
    creator: Creator;
    projects: Project[];
}) {
    const getInitials = useInitials();
    const [copiedText, copy] = useClipboard();
    const socialLinks = [
        creator.website_url
            ? { label: 'Website', href: creator.website_url, icon: Globe }
            : null,
        creator.instagram_url
            ? {
                  label: 'Instagram',
                  href: creator.instagram_url,
                  icon: Instagram,
              }
            : null,
        creator.contact_email
            ? {
                  label: 'Contact',
                  href: `mailto:${creator.contact_email}`,
                  icon: Mail,
              }
            : null,
    ].filter(Boolean) as Array<{
        label: string;
        href: string;
        icon: typeof Globe;
    }>;
    const coverStyle = resolveProfileCoverStyle(creator.profile_cover_style);
    const creatorFacts = [
        creator.specialization
            ? {
                  label: 'Focus',
                  value: creator.specialization,
              }
            : null,
        creator.location
            ? {
                  label: 'Based in',
                  value: creator.location,
              }
            : null,
        {
            label: 'Published work',
            value: `${projects.length} project${projects.length === 1 ? '' : 's'}`,
        },
    ].filter(Boolean) as Array<{ label: string; value: string }>;
    const isCopied = copiedText === creator.profile_url;

    return (
        <>
            <Head title={`${creator.name} Portfolio`} />

            <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] px-4 py-10 text-foreground sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]">
                <div className="relative mx-auto max-w-6xl space-y-8 lg:space-y-10">
                    <section className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/85 dark:shadow-sm">
                        <div className={`relative h-44 sm:h-52 lg:h-60 ${coverStyle.coverClass}`}>
                        </div>

                        <div className="px-6 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
                                    <div className="space-y-3">
                                        <Avatar className="size-28 -mt-20 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-none sm:size-32 sm:-mt-24 dark:border-white/10 dark:bg-card">
                                            <AvatarImage
                                                src={creator.avatar ?? undefined}
                                                alt={creator.name}
                                            />
                                            <AvatarFallback className="bg-slate-50 text-3xl text-slate-900 dark:bg-white/[0.08] dark:text-foreground">
                                                {getInitials(creator.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="space-y-5 pt-4 sm:pt-6">
                                        <div className="space-y-2.5">
                                            <p className="text-[11px] uppercase tracking-[0.34em] text-primary/70">
                                                CreativeHub Portfolio
                                            </p>
                                            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-foreground">
                                                {creator.name}
                                            </h1>
                                        </div>

                                        <p className="max-w-3xl text-lg leading-8 text-slate-700 dark:text-muted-foreground">
                                            {creator.bio ??
                                                'A curated selection of public work, ready to share with clients, collaborators, and new audiences.'}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {creator.contact_email ? (
                                                <Button
                                                    size="sm"
                                                    className="rounded-full px-5 shadow-none"
                                                    asChild
                                                >
                                                    <a
                                                        href={`mailto:${creator.contact_email}`}
                                                    >
                                                        Start a conversation
                                                        <Mail className="size-4" />
                                                    </a>
                                                </Button>
                                            ) : creator.website_url ? (
                                                <Button
                                                    size="sm"
                                                    className="rounded-full px-5"
                                                    asChild
                                                >
                                                    <a
                                                        href={creator.website_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Visit website
                                                        <Globe className="size-4" />
                                                    </a>
                                                </Button>
                                            ) : null}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-full border-primary/35 px-5 text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:hover:bg-background/80 dark:hover:text-foreground"
                                                    onClick={() =>
                                                        void copy(creator.profile_url)
                                                    }
                                                >
                                                {isCopied
                                                    ? 'Copied portfolio link'
                                                    : 'Copy portfolio link'}
                                                {isCopied ? (
                                                    <Check className="size-4" />
                                                ) : (
                                                    <Copy className="size-4" />
                                                )}
                                            </Button>

                                            {socialLinks.map(
                                                ({
                                                    label,
                                                    href,
                                                    icon: Icon,
                                                }) => (
                                                    <a
                                                        key={label}
                                                        href={href}
                                                        target={
                                                            href.startsWith(
                                                                'mailto:',
                                                            )
                                                                ? undefined
                                                                : '_blank'
                                                        }
                                                        rel={
                                                            href.startsWith(
                                                                'mailto:',
                                                            )
                                                                ? undefined
                                                                : 'noreferrer'
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm text-primary shadow-none transition hover:border-primary/35 hover:bg-primary/10 dark:border-white/10 dark:bg-background/60 dark:text-foreground dark:hover:bg-background/80"
                                                    >
                                                        <Icon className="size-4" />
                                                        {label}
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {creatorFacts.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {creatorFacts.map((fact) => (
                                            <Card
                                                key={fact.label}
                                                className="rounded-[1.35rem] border border-primary/18 bg-[#f5f1ff] py-0 shadow-none dark:border-white/10 dark:bg-background/55"
                                            >
                                                <CardContent className="space-y-2 px-4 py-4">
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-muted-foreground">
                                                        {fact.label}
                                                    </p>
                                                    <p className="text-sm font-medium text-slate-950 dark:text-foreground">
                                                        {fact.value}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    Published projects
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {projects.length} project
                                    {projects.length === 1 ? '' : 's'} live on
                                    this portfolio.
                                </p>
                            </div>
                        </div>

                        {projects.length === 0 ? (
                            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-card/70">
                                No public projects yet.
                            </div>
                        ) : (
                            <PublicProjectGrid projects={projects} />
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
