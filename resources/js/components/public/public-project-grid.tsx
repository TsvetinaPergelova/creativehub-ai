import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import SaveProjectButton from '@/components/public/save-project-button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Auth } from '@/types/auth';
import type { Project } from '@/types';

export default function PublicProjectGrid({
    projects,
}: {
    projects: Project[];
}) {
    const page = usePage<{ auth: Auth }>();
    const authenticatedUser = page.props.auth.user;
    const publishedDateFormatter = new Intl.DateTimeFormat('en', {
        month: 'short',
        year: 'numeric',
    });
    const imageBadgeClass =
        'border-white/20 bg-black/65 px-3 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md';

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {projects.map((project) => (
                <Card
                    key={project.id}
                    className="h-full gap-0 overflow-hidden rounded-[1.5rem] border-primary/18 bg-card/85 py-0 shadow-none transition hover:-translate-y-1 hover:border-primary/24 hover:bg-card xl:rounded-[1.75rem]"
                >
                    <Link
                        href={project.public_url ?? '#'}
                        className="group block"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            {project.cover_image_url ? (
                                <img
                                    src={project.cover_image_url}
                                    alt={project.name}
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="flex size-full items-end justify-start bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_40%)] p-5">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                            Portfolio entry
                                        </p>
                                        <p className="mt-2 text-lg font-semibold">
                                            {project.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                                <Badge
                                    variant="outline"
                                    className={imageBadgeClass}
                                >
                                    {project.category}
                                </Badge>
                                {project.published_at ? (
                                    <Badge
                                        variant="outline"
                                        className={imageBadgeClass}
                                    >
                                        {publishedDateFormatter.format(
                                            new Date(project.published_at),
                                        )}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </Link>

                    <CardHeader className="flex min-h-[7.75rem] flex-col justify-between px-4 pt-4 pb-0 sm:min-h-[9.25rem] sm:px-5 sm:pt-5">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {project.creator_name ? (
                                    project.creator_profile_url ? (
                                        <Link
                                            href={project.creator_profile_url}
                                            className="font-medium text-foreground transition hover:text-primary"
                                        >
                                            By {project.creator_name}
                                        </Link>
                                    ) : (
                                        <span className="font-medium text-foreground">
                                            By {project.creator_name}
                                        </span>
                                    )
                                ) : null}
                                <span className="opacity-40">/</span>
                                <span>
                                    {project.asset_count ?? 0}{' '}
                                    {(project.asset_count ?? 0) === 1
                                        ? 'image'
                                        : 'images'}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <CardTitle className="line-clamp-2 text-lg leading-tight sm:min-h-[3.5rem] sm:text-xl">
                                    <Link
                                        href={project.public_url ?? '#'}
                                        className="transition hover:text-primary"
                                    >
                                        {project.name}
                                    </Link>
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-sm leading-6 sm:min-h-[4.5rem] sm:line-clamp-3">
                                    {project.description ??
                                        'Open the project to see the full published sequence and presentation.'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex min-h-[6rem] flex-1 flex-col px-4 py-4 sm:min-h-[7rem] sm:px-5 sm:py-5">
                        <div className="flex min-h-[1.5rem] flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>Published project</span>
                            {project.creator_name ? (
                                <>
                                    <span className="opacity-40">/</span>
                                    <span>Creator profile available</span>
                                </>
                            ) : null}
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-sm font-medium sm:pt-4">
                            <Link
                                href={project.public_url ?? '#'}
                                className="inline-flex items-center gap-2 text-foreground transition hover:text-primary"
                            >
                                View project
                                <ArrowRight className="size-4" />
                            </Link>

                            {project.creator_profile_url &&
                            project.creator_name ? (
                                <Link
                                    href={project.creator_profile_url}
                                    className="text-muted-foreground transition hover:text-foreground"
                                >
                                    View {project.creator_name}
                                </Link>
                            ) : null}

                            {authenticatedUser && project.creator_id ? (
                                <SaveProjectButton
                                    creatorId={project.creator_id}
                                    projectSlug={project.slug}
                                    isSaved={project.is_saved_by_auth_user ?? false}
                                    only={['projects']}
                                    compact
                                />
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
