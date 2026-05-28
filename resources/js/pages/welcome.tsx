import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    ArrowRight,
    CheckCircle2,
    FolderHeart,
    GalleryVerticalEnd,
    Images,
    LayoutTemplate,
    MessageSquareHeart,
    ScanSearch,
    WandSparkles,
} from 'lucide-react';
import {
    ProjectInsetPanel,
    ProjectSection,
    ProjectSectionHeader,
} from '@/components/projects/project-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';
import { index as explore } from '@/routes/explore';
import { create as createProject } from '@/routes/projects';
import type { Auth } from '@/types/auth';

const workflowHighlights = [
    {
        icon: WandSparkles,
        title: 'Curate faster',
        description:
            'Upload full sets, let Curator surface stronger previews, and keep the narrative clear while the library grows.',
    },
    {
        icon: LayoutTemplate,
        title: 'Present better',
        description:
            'Turn drafts into project stories with cleaner covers, stronger sequencing, and portfolio-ready public pages.',
    },
    {
        icon: MessageSquareHeart,
        title: 'Share with clients',
        description:
            'Collect favorites, shortlist approvals, and project-level notes without the feedback loop turning noisy.',
    },
];

const workflowSteps = [
    {
        step: '01',
        title: 'Upload the raw set',
        description:
            'Bring in photography sessions, design case studies, or mixed visual work without over-structuring first.',
    },
    {
        step: '02',
        title: 'Let Curator read the material',
        description:
            'Auto-picked previews, analysis, and highlights make the strongest frames visible right away.',
    },
    {
        step: '03',
        title: 'Shape the project story',
        description:
            'Refine naming, sequencing, and presentation once the best material is already surfaced.',
    },
    {
        step: '04',
        title: 'Publish or share privately',
        description:
            'Use public portfolio pages when the work is ready, or client galleries when the review is still in progress.',
    },
];

const creatorModes = [
    {
        label: 'Photography',
        description:
            'Built for image sets where selection strength, consistency, and client-ready presentation matter most.',
    },
    {
        label: 'Design / Case Study',
        description:
            'Great for branding, product, and interface work that needs a tighter hero and a clearer supporting story.',
    },
    {
        label: 'Art Series',
        description:
            'Better for smaller conceptual sequences where cohesion, statement, and atmosphere do the heavy lifting.',
    },
    {
        label: 'Mixed / Experimental',
        description:
            'Useful when the project does not fit one pattern yet and you want the most neutral review flow.',
    },
];

const outputSurfaces = [
    {
        icon: GalleryVerticalEnd,
        title: 'Public portfolio',
        description:
            'A profile and project layer that reads like published work, not just a pile of uploaded assets.',
    },
    {
        icon: FolderHeart,
        title: 'Client shortlist',
        description:
            'Private gallery links keep approvals, favorites, and comments tied to the project they belong to.',
    },
    {
        icon: ScanSearch,
        title: 'Explore discovery',
        description:
            'Published work can be browsed like a public library, helping creators be found beyond direct share links.',
    },
];

function LandingFeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <ProjectInsetPanel className="rounded-[1.5rem] border-primary/18 bg-black/[0.18] p-5 sm:p-6">
            <div className="space-y-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/14 text-primary">
                    <Icon className="size-5" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </ProjectInsetPanel>
    );
}

type LandingPreviewFrame = {
    id: number;
    title: string;
    project_name: string;
    category: string;
    creator_name: string;
    image_url: string;
};

export default function Welcome({
    canRegister = true,
    landingPreviewFrames = [],
}: {
    canRegister?: boolean;
    landingPreviewFrames?: LandingPreviewFrame[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);

    const primaryHref = auth.user
        ? createProject()
        : canRegister
          ? register()
          : login();
    const primaryLabel = auth.user
        ? 'Start a project'
        : canRegister
          ? 'Start building'
          : 'Log in to start';
    const previewFrames = landingPreviewFrames;
    const hasLandingPreviewFrames = previewFrames.length > 0;
    const activePreviewFrame = hasLandingPreviewFrames
        ? previewFrames[activePreviewIndex % previewFrames.length]
        : null;

    useEffect(() => {
        if (previewFrames.length < 2) {
            return;
        }

        const interval = window.setInterval(() => {
            setActivePreviewIndex((currentIndex) => {
                return (currentIndex + 1) % previewFrames.length;
            });
        }, 3200);

        return () => window.clearInterval(interval);
    }, [previewFrames.length]);

    return (
        <>
            <Head title="CreativeHub" />

            <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.08),transparent_26%)]" />

                <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <header className="flex flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-card/65 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-5 sm:py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full border border-primary/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01)),radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_58%),#151728] text-white shadow-[0_10px_28px_rgba(79,70,229,0.12)]">
                                <AppLogoIcon className="size-4.5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold tracking-tight">
                                    CreativeHub
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Curate. Present. Share.
                                </p>
                            </div>
                        </div>

                        <nav className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:gap-3">
                            <Link
                                href={explore()}
                                className="flex-1 rounded-full border border-white/10 bg-black/10 px-3 py-2 text-center text-sm text-muted-foreground transition hover:border-primary/20 hover:text-foreground sm:flex-none sm:border-transparent sm:bg-transparent sm:text-left"
                            >
                                Explore
                            </Link>

                            {auth.user ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full px-4 sm:min-w-[7rem]"
                                    asChild
                                >
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="flex-1 rounded-full border border-white/10 bg-black/10 px-3 py-2 text-center text-sm text-muted-foreground transition hover:border-primary/20 hover:text-foreground sm:flex-none sm:border-transparent sm:bg-transparent sm:text-left"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister ? (
                                        <Button
                                            size="sm"
                                            className="min-w-[7rem] rounded-full px-4"
                                            asChild
                                        >
                                            <Link href={register()}>
                                                Register
                                            </Link>
                                        </Button>
                                    ) : null}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="space-y-7 py-6 sm:space-y-10 sm:py-10 lg:space-y-12">
                        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(26rem,0.95fr)] lg:items-start">
                            <div className="relative space-y-5 sm:space-y-7">
                                <div className="space-y-4 sm:space-y-5">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-primary"
                                    >
                                        Portfolio workflow
                                    </Badge>

                                    <div className="space-y-3 sm:space-y-4">
                                        <h1 className="max-w-4xl text-[2.7rem] leading-[0.98] font-semibold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.02]">
                                            Turn raw image sets into clear
                                            portfolios and client-ready
                                            galleries.
                                        </h1>
                                        <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-lg">
                                            CreativeHub helps you upload work,
                                            review Curator-picked previews,
                                            shape stronger project stories, and
                                            share them without the usual admin
                                            drag.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                    <Button
                                        size="lg"
                                        className="h-14 w-full rounded-full px-7 text-base sm:w-auto"
                                        asChild
                                    >
                                        <Link href={primaryHref}>
                                            {primaryLabel}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-14 w-full rounded-full border-primary/30 px-7 text-base text-primary hover:border-primary/45 hover:bg-primary/10 hover:text-primary sm:w-auto"
                                        asChild
                                    >
                                        <Link href={explore()}>
                                            Explore published work
                                        </Link>
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline">
                                        Photography
                                    </Badge>
                                    <Badge variant="outline">
                                        Design / Case Study
                                    </Badge>
                                    <Badge variant="outline">Art Series</Badge>
                                    <Badge variant="outline">
                                        Client shortlists
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-3 rounded-[1.5rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(0,0,0,0.18))] p-4 sm:space-y-4 sm:rounded-[1.7rem] sm:p-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant="outline"
                                                className="border-white/15 bg-black/15 text-white/90"
                                            >
                                                Portraits
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="border-white/15 bg-black/15 text-white/90"
                                            >
                                                Auto-picked preview
                                            </Badge>
                                        </div>

                                        <div className="self-start rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80 backdrop-blur sm:shrink-0">
                                            Live public gallery
                                        </div>
                                    </div>

                                    <div className="max-w-md space-y-2">
                                        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                                            {activePreviewFrame?.title ??
                                                'Quiet Portraits'}
                                        </h2>
                                        <p className="text-sm leading-6 text-white/75">
                                            Browse how published work can look
                                            once projects are curated, titled,
                                            and ready to live on the portfolio.
                                        </p>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="overflow-hidden rounded-[1.3rem] border border-white/12 bg-black/18">
                                            {activePreviewFrame ? (
                                                <div className="relative">
                                                    <div
                                                        className="flex transition-transform duration-700 ease-out"
                                                        style={{
                                                            transform: `translateX(-${activePreviewIndex * 100}%)`,
                                                        }}
                                                    >
                                                        {previewFrames.map(
                                                            (frame) => (
                                                                <div
                                                                    key={
                                                                        frame.id
                                                                    }
                                                                    className="min-w-full"
                                                                >
                                                                    <div className="flex h-[14rem] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.18))] p-3 sm:h-[20rem] sm:p-5">
                                                                        <img
                                                                            src={
                                                                                frame.image_url
                                                                            }
                                                                            alt={
                                                                                frame.title
                                                                            }
                                                                            className="max-h-full max-w-full rounded-[1rem] object-contain shadow-[0_20px_60px_rgba(0,0,0,0.32)]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>

                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-3 sm:p-5">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/65">
                                                                {
                                                                    activePreviewFrame.category
                                                                }{' '}
                                                                / By{' '}
                                                                {
                                                                    activePreviewFrame.creator_name
                                                                }
                                                            </p>
                                                            <p className="text-base font-semibold text-white sm:text-lg">
                                                                {
                                                                    activePreviewFrame.project_name
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex h-[14rem] items-end bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.18),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.35))] p-3 sm:h-[20rem]">
                                                    <p className="max-w-sm text-sm leading-6 text-white/70">
                                                        Published work from the
                                                        portfolio will rotate
                                                        here once projects are
                                                        ready to go public.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex flex-wrap gap-2">
                                                {previewFrames.map(
                                                    (frame, index) => {
                                                        const isActive =
                                                            frame.id ===
                                                            activePreviewFrame?.id;

                                                        return (
                                                            <button
                                                                key={frame.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    setActivePreviewIndex(
                                                                        index,
                                                                    )
                                                                }
                                                                className={`size-2.5 rounded-full transition ${
                                                                    isActive
                                                                        ? 'bg-white'
                                                                        : 'bg-white/30 hover:bg-white/50'
                                                                }`}
                                                                aria-label={`Show ${frame.project_name}`}
                                                            />
                                                        );
                                                    },
                                                )}
                                            </div>

                                            {activePreviewFrame ? (
                                                <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                                                    Showing{' '}
                                                    {activePreviewIndex + 1} of{' '}
                                                    {previewFrames.length}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                            <ProjectInsetPanel className="rounded-[1.5rem] border-primary/16 bg-black/[0.2] p-5 sm:rounded-[1.7rem] sm:p-6">
                                <div className="space-y-2.5">
                                    <p className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                                        Public portfolio
                                    </p>
                                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                        A profile that reads like published
                                        work
                                    </h3>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                                        Strong headers, focused project cards,
                                        and cleaner creator presentation from
                                        the same workspace.
                                    </p>
                                </div>
                            </ProjectInsetPanel>

                            <ProjectInsetPanel className="rounded-[1.5rem] border-primary/16 bg-black/[0.2] p-5 sm:rounded-[1.7rem] sm:p-6">
                                <div className="space-y-2.5">
                                    <p className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                                        Client review
                                    </p>
                                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                        Favorites, shortlist, and final
                                        approval
                                    </h3>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                                        Keep feedback on the project, not
                                        spread across inboxes and disconnected
                                        links.
                                    </p>
                                </div>
                            </ProjectInsetPanel>
                        </section>

                        <ProjectSection className="rounded-[1.7rem] border-primary/16 bg-black/[0.18] p-4 sm:rounded-[1.9rem] sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01)),radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_58%),#151728] text-white shadow-[0_10px_28px_rgba(79,70,229,0.12)] sm:size-14">
                                        <AppLogoIcon className="size-5 text-white sm:size-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold tracking-tight">
                                            CreativeHub
                                        </p>
                                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                            Curate. Present. Share.
                                        </p>
                                    </div>
                                </div>

                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-right">
                                    A calmer workflow for turning raw uploads
                                    into clearer portfolios, stronger project
                                    stories, and client-ready review links.
                                </p>
                            </div>
                        </ProjectSection>

                        <ProjectSection className="space-y-4 sm:space-y-5 rounded-[2rem]">
                            <ProjectSectionHeader
                                title="What CreativeHub actually helps with"
                                description="Not just publishing, not just storage. The value is in how the work gets reviewed, shaped, and shared."
                            />

                            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                                {workflowHighlights.map((item) => (
                                    <LandingFeatureCard
                                        key={item.title}
                                        icon={item.icon}
                                        title={item.title}
                                        description={item.description}
                                    />
                                ))}
                            </div>
                        </ProjectSection>

                        <ProjectSection className="space-y-4 sm:space-y-5 rounded-[2rem]">
                            <ProjectSectionHeader
                                title="How the flow stays simple"
                                description="A straightforward sequence that still leaves room for taste, iteration, and better presentation decisions."
                            />

                            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {workflowSteps.map((item) => (
                                    <ProjectInsetPanel
                                        key={item.step}
                                        className="rounded-[1.35rem] border-primary/16 bg-black/[0.16] p-4 sm:rounded-[1.5rem] sm:p-5"
                                    >
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full border-primary/20 bg-primary/8 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary"
                                                >
                                                    Step {item.step}
                                                </Badge>
                                                <CheckCircle2 className="size-4 text-primary/80" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold tracking-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </ProjectInsetPanel>
                                ))}
                            </div>
                        </ProjectSection>

                        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                            <ProjectSection className="space-y-4 sm:space-y-5 rounded-[2rem]">
                                <ProjectSectionHeader
                                    title="Built for different creator rhythms"
                                    description="The same workspace adapts to photography sets, design case studies, and more concept-driven series."
                                />

                                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                    {creatorModes.map((mode) => (
                                        <ProjectInsetPanel
                                            key={mode.label}
                                            className="rounded-[1.35rem] border-primary/16 bg-black/[0.16] p-4 sm:rounded-[1.5rem] sm:p-5"
                                        >
                                            <div className="space-y-3">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full"
                                                >
                                                    {mode.label}
                                                </Badge>
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    {mode.description}
                                                </p>
                                            </div>
                                        </ProjectInsetPanel>
                                    ))}
                                </div>
                            </ProjectSection>

                            <ProjectSection className="space-y-4 sm:space-y-5 rounded-[2rem]">
                                <ProjectSectionHeader
                                    title="Where the work can end up"
                                    description="Every project can move toward a public portfolio, a private client review, or a cleaner internal draft."
                                />

                                <div className="space-y-3 sm:space-y-4">
                                    {outputSurfaces.map((surface) => (
                                        <ProjectInsetPanel
                                            key={surface.title}
                                            className="rounded-[1.35rem] border-primary/16 bg-black/[0.16] p-4 sm:rounded-[1.5rem] sm:p-5"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                                                    <surface.icon className="size-4" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <h3 className="text-base font-semibold tracking-tight">
                                                        {surface.title}
                                                    </h3>
                                                    <p className="text-sm leading-6 text-muted-foreground">
                                                        {surface.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </ProjectInsetPanel>
                                    ))}
                                </div>
                            </ProjectSection>
                        </div>

                        <ProjectSection className="overflow-hidden rounded-[2rem] border-primary/18 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-5 sm:rounded-[2.2rem] sm:p-8">
                            <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                <div className="space-y-4">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-primary/20 bg-primary/8 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-primary"
                                    >
                                        Start with one set
                                    </Badge>
                                    <div className="space-y-3">
                                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                            Give the next project a cleaner
                                            start.
                                        </h2>
                                        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                                            Upload the work, let Curator surface
                                            a stronger first pass, and keep the
                                            path open toward public portfolio
                                            pages and private client galleries.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                                    <Button
                                        size="lg"
                                        className="w-full rounded-full px-6 sm:w-auto"
                                        asChild
                                    >
                                        <Link href={primaryHref}>
                                            {primaryLabel}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full rounded-full px-6 sm:w-auto"
                                        asChild
                                    >
                                        <Link href={explore()}>
                                            Browse live work
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </ProjectSection>
                    </main>
                </div>
            </div>
        </>
    );
}
