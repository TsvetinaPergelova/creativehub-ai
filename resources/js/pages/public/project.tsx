import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import PublicProjectCommentController from '@/actions/App/Http/Controllers/PublicProjectCommentController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import SaveProjectButton from '@/components/public/save-project-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import type { Auth } from '@/types/auth';
import type { Project } from '@/types';

type Creator = {
    id: number;
    name: string;
    avatar: string | null;
    specialization: string | null;
    profile_url: string;
};

type ProjectComment = {
    id: number;
    body: string;
    created_at: string | null;
    author: {
        id: number;
        name: string;
        avatar: string | null;
    };
};

export default function PublicProject({
    creator,
    project,
}: {
    creator: Creator;
    project: Project & { comments?: ProjectComment[] };
}) {
    const getInitials = useInitials();
    const page = usePage<{ auth: Auth }>();
    const authenticatedUser = page.props.auth.user;
    const comments = project.comments ?? [];
    const existingComment =
        authenticatedUser !== null
            ? comments.find((comment) => comment.author.id === authenticatedUser.id)
            : null;
    const commentForm = useForm({
        body: existingComment?.body ?? '',
    });
    const commentDateFormatter = new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    useEffect(() => {
        commentForm.setData('body', existingComment?.body ?? '');
    }, [existingComment?.body]);

    function submitComment(): void {
        commentForm.post(
            PublicProjectCommentController.store({
                user: creator.id,
                project: project.slug,
            }).url,
            {
                preserveScroll: true,
                preserveState: true,
                only: ['project'],
            },
        );
    }

    return (
        <>
            <Head title={project.name} />

            <div className="relative min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.14),transparent_34%)]" />
                <div className="relative mx-auto max-w-6xl space-y-8">
                    <div className="space-y-4">
                        <Link
                            href={creator.profile_url}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to portfolio
                        </Link>

                        <div className="rounded-xl border bg-card/85 p-8 shadow-sm backdrop-blur">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-11 overflow-hidden rounded-2xl border border-white/10">
                                            <AvatarImage src={creator.avatar ?? undefined} alt={creator.name} />
                                            <AvatarFallback className="bg-white/[0.08] text-foreground">
                                                {getInitials(creator.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                                                {creator.name}
                                            </p>
                                            {creator.specialization ? (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {creator.specialization}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                        {project.name}
                                    </h1>
                                    <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                                        {project.description ??
                                            'A published project from this CreativeHub portfolio.'}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        {authenticatedUser ? (
                                            <SaveProjectButton
                                                creatorId={creator.id}
                                                projectSlug={project.slug}
                                                isSaved={
                                                    project.is_saved_by_auth_user ??
                                                    false
                                                }
                                                only={['project']}
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Sign in to save this project and
                                                join the comments.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Badge variant="outline">
                                        {project.category}
                                    </Badge>
                                    <Badge className="capitalize">
                                        {project.visibility}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="grid gap-4 md:grid-cols-2">
                        {(project.assets ?? []).map((asset) => (
                            <figure
                                key={asset.id}
                                className="overflow-hidden rounded-xl border bg-card/85 shadow-sm"
                            >
                                <img
                                    src={asset.url}
                                    alt={
                                        asset.analysis?.alt_text ??
                                        `${project.name} image`
                                    }
                                    className="aspect-[4/3] w-full object-cover"
                                />
                                <figcaption className="space-y-2 p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(asset.analysis?.tags ?? [])
                                            .slice(0, 4)
                                            .map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="outline"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {asset.analysis?.critique ??
                                            asset.filename}
                                    </p>
                                </figcaption>
                            </figure>
                        ))}
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                        <Card className="border-white/10 bg-card/85 shadow-sm backdrop-blur">
                            <CardHeader>
                                <CardTitle>Comments</CardTitle>
                                <CardDescription>
                                    Short public notes from people who want to
                                    bookmark or discuss this project.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {comments.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-white/10 bg-background/35 px-4 py-5 text-sm text-muted-foreground">
                                        No comments yet. The first good note can
                                        help the creator understand what is
                                        resonating.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="rounded-xl border border-white/10 bg-background/45 px-4 py-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="size-10 rounded-xl border border-white/10">
                                                        <AvatarImage
                                                            src={
                                                                comment.author
                                                                    .avatar ??
                                                                undefined
                                                            }
                                                            alt={
                                                                comment.author
                                                                    .name
                                                            }
                                                        />
                                                        <AvatarFallback className="bg-white/[0.08] text-foreground">
                                                            {getInitials(
                                                                comment.author
                                                                    .name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0 flex-1 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium">
                                                                {
                                                                    comment
                                                                        .author
                                                                        .name
                                                                }
                                                            </p>
                                                            {comment.created_at ? (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {commentDateFormatter.format(
                                                                        new Date(
                                                                            comment.created_at,
                                                                        ),
                                                                    )}
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        <p className="text-sm leading-6 text-muted-foreground">
                                                            {comment.body}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-white/10 bg-card/85 shadow-sm backdrop-blur">
                            <CardHeader>
                                <CardTitle>Leave a note</CardTitle>
                                <CardDescription>
                                    Keep it short and specific so the creator
                                    knows what stood out.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {authenticatedUser ? (
                                    <>
                                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-background/45 px-3 py-3">
                                            <Avatar className="size-10 rounded-xl border border-white/10">
                                                <AvatarImage
                                                    src={
                                                        authenticatedUser.avatar ??
                                                        undefined
                                                    }
                                                    alt={authenticatedUser.name}
                                                />
                                                <AvatarFallback className="bg-white/[0.08] text-foreground">
                                                    {getInitials(
                                                        authenticatedUser.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {authenticatedUser.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Your note stays attached to
                                                    this project and updates if
                                                    you post again.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <label
                                                htmlFor="body"
                                                className="text-sm font-medium"
                                            >
                                                Comment
                                            </label>
                                            <Textarea
                                                id="body"
                                                value={commentForm.data.body}
                                                onChange={(event) =>
                                                    commentForm.setData(
                                                        'body',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={5}
                                                placeholder="What feels strongest about this project?"
                                                className="rounded-xl border-white/10 bg-background/45 px-4 py-3 text-sm leading-6"
                                            />
                                            {commentForm.errors.body ? (
                                                <p className="text-sm text-rose-300">
                                                    {commentForm.errors.body}
                                                </p>
                                            ) : null}
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={submitComment}
                                            disabled={commentForm.processing}
                                        >
                                            {commentForm.processing
                                                ? 'Saving comment...'
                                                : existingComment
                                                  ? 'Update comment'
                                                  : 'Post comment'}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-white/10 bg-background/35 px-4 py-5 text-sm text-muted-foreground">
                                        Sign in to save this project or leave a
                                        short public comment for the creator.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </>
    );
}
