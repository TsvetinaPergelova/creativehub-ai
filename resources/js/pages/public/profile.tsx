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

            <div className="relative min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_34%)]" />
                <div className="relative mx-auto max-w-6xl space-y-8 lg:space-y-10">
                    <section className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-card/85 shadow-sm backdrop-blur">
                        <div className={`relative h-44 sm:h-52 lg:h-60 ${coverStyle.coverClass}`}>
                            <div className="absolute inset-x-0 -bottom-10 h-32 bg-gradient-to-b from-transparent via-card/18 to-card/72 blur-3xl sm:-bottom-12 sm:h-36" />
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-card/8 to-card/48 sm:h-24" />
                        </div>

                        <div className="px-6 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
                                    <div className="space-y-3">
                                        <Avatar className="size-28 -mt-20 overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-[0_16px_50px_rgba(0,0,0,0.28)] sm:size-32 sm:-mt-24">
                                            <AvatarImage
                                                src={creator.avatar ?? undefined}
                                                alt={creator.name}
                                            />
                                            <AvatarFallback className="bg-white/[0.08] text-3xl text-foreground">
                                                {getInitials(creator.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="space-y-5 pt-4 sm:pt-6">
                                        <div className="space-y-2.5">
                                            <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                                                CreativeHub Portfolio
                                            </p>
                                            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                                {creator.name}
                                            </h1>
                                        </div>

                                        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                                            {creator.bio ??
                                                'A curated selection of public work, ready to share with clients, collaborators, and new audiences.'}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {creator.contact_email ? (
                                                <Button
                                                    size="sm"
                                                    className="rounded-full px-5"
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
                                                className="rounded-full px-5"
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
                                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground transition hover:border-primary/30 hover:text-primary"
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
                                                className="rounded-[1.35rem] border-white/10 bg-black/[0.14] py-0 shadow-none"
                                            >
                                                <CardContent className="space-y-2 px-4 py-4">
                                                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                                                        {fact.label}
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground">
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
                            <div className="rounded-[1.5rem] border border-dashed bg-card/70 p-10 text-center text-sm text-muted-foreground">
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
