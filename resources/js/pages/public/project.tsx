import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import { type PointerEvent, useEffect, useRef, useState } from 'react';
import PublicProjectCommentController from '@/actions/App/Http/Controllers/PublicProjectCommentController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import SaveProjectButton from '@/components/public/save-project-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
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
    const [selectedAsset, setSelectedAsset] = useState<NonNullable<Project['assets']>[number] | null>(null);
    const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const imageViewportRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const dragStateRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
        startPanX: number;
        startPanY: number;
        moved: boolean;
    } | null>(null);
    const suppressToggleRef = useRef(false);
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

    useEffect(() => {
        setSelectedAsset(
            selectedAssetIndex === null
                ? null
                : project.assets?.[selectedAssetIndex] ?? null,
        );
    }, [project.assets, selectedAssetIndex]);

    useEffect(() => {
        setIsZoomed(false);
        setIsDragging(false);
        setPan({ x: 0, y: 0 });
        dragStateRef.current = null;
        suppressToggleRef.current = false;
    }, [selectedAssetIndex]);

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

    function closeAssetDialog(): void {
        setSelectedAsset(null);
        setSelectedAssetIndex(null);
    }

    function openAssetDialog(index: number): void {
        setSelectedAssetIndex(index);
        setSelectedAsset(project.assets?.[index] ?? null);
    }

    function toggleZoom(): void {
        setIsZoomed((current) => {
            const nextZoomed = !current;

            if (!nextZoomed) {
                setPan({ x: 0, y: 0 });
                setIsDragging(false);
            }

            return nextZoomed;
        });
    }

    function clampPan(nextX: number, nextY: number): { x: number; y: number } {
        const viewport = imageViewportRef.current;
        const image = imageRef.current;

        if (!viewport || !image || !isZoomed) {
            return { x: 0, y: 0 };
        }

        const zoomScale = 2;
        const horizontalOverflow = Math.max((image.clientWidth * zoomScale - viewport.clientWidth) / 2, 0);
        const verticalOverflow = Math.max((image.clientHeight * zoomScale - viewport.clientHeight) / 2, 0);

        return {
            x: Math.min(Math.max(nextX, -horizontalOverflow), horizontalOverflow),
            y: Math.min(Math.max(nextY, -verticalOverflow), verticalOverflow),
        };
    }

    function handlePreviewPointerDown(event: PointerEvent<HTMLButtonElement>): void {
        if (!isZoomed) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startPanX: pan.x,
            startPanY: pan.y,
            moved: false,
        };
        setIsDragging(true);
    }

    function handlePreviewPointerMove(event: PointerEvent<HTMLButtonElement>): void {
        const dragState = dragStateRef.current;

        if (!isZoomed || !dragState || dragState.pointerId !== event.pointerId) {
            return;
        }

        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;

        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            dragState.moved = true;
            suppressToggleRef.current = true;
        }

        setPan(clampPan(dragState.startPanX + deltaX, dragState.startPanY + deltaY));
    }

    function handlePreviewPointerEnd(event: PointerEvent<HTMLButtonElement>): void {
        const dragState = dragStateRef.current;

        if (dragState?.pointerId !== event.pointerId) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        dragStateRef.current = null;
        setIsDragging(false);
    }

    function handlePreviewClick(): void {
        if (suppressToggleRef.current) {
            suppressToggleRef.current = false;

            return;
        }

        toggleZoom();
    }

    return (
        <>
            <Head title={project.name} />

            <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] px-4 py-10 text-foreground sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.08),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.06))] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_34%)]" />
                <div className="relative mx-auto max-w-6xl space-y-8">
                    <div className="space-y-4">
                        <Link
                            href={creator.profile_url}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Back to portfolio
                        </Link>

                        <div className="relative rounded-xl border border-slate-200/80 bg-white/95 p-8 shadow-none backdrop-blur dark:border-white/10 dark:bg-card/85 dark:shadow-sm">
                            <div className="flex flex-col gap-4 lg:pr-40">
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
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                            {project.name}
                                        </h1>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant="outline"
                                                className="border-primary/35 text-primary"
                                            >
                                                {project.category}
                                            </Badge>
                                            <Badge className="capitalize">
                                                {project.visibility}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                                        {project.description ??
                                            'A published project from this CreativeHub portfolio.'}
                                    </p>

                                </div>

                                <div className="flex flex-col items-start gap-3 lg:absolute lg:top-8 lg:right-8 lg:items-end">
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
                                        <p className="text-sm text-muted-foreground lg:text-right">
                                            Sign in to save this project and
                                            join the comments.
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="grid gap-4 md:grid-cols-2">
                        {(project.assets ?? []).map((asset, index) => (
                            <figure key={asset.id}>
                                <button
                                    type="button"
                                    onClick={() => openAssetDialog(index)}
                                    className="block w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white text-left shadow-none transition hover:border-primary/25 hover:bg-white focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:border-white/10 dark:bg-card/85 dark:shadow-sm dark:hover:border-primary/20 dark:hover:bg-card"
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
                                                    className="border-primary/35 text-primary"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-muted-foreground">
                                        {asset.analysis?.critique ??
                                            asset.filename}
                                    </p>
                                </figcaption>
                                </button>
                            </figure>
                        ))}
                    </section>

                    <Dialog open={selectedAsset !== null} onOpenChange={(open) => !open && closeAssetDialog()}>
                        {selectedAsset ? (
                            <DialogContent className="top-0 right-0 bottom-0 left-0 z-[60] h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 bg-background p-0 sm:top-[50%] sm:left-[50%] sm:h-[96vh] sm:max-h-[96vh] sm:w-full sm:max-w-[min(84vw,78rem)] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:border-white/10">
                                <DialogTitle className="sr-only">
                                    {selectedAsset.analysis?.alt_text ?? `${project.name} image`}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    Full image preview with tags and description.
                                </DialogDescription>

                                <div className="flex h-full min-h-0 flex-col lg:grid lg:h-full lg:max-h-[96vh] lg:grid-cols-[minmax(0,1fr)_27rem] xl:grid-cols-[minmax(0,1.02fr)_31rem]">
                                    <div
                                        ref={imageViewportRef}
                                        className={cn(
                                            'relative h-[42svh] shrink-0 items-center justify-center overflow-hidden bg-black/95 px-3 pt-12 pb-3 sm:min-h-[18rem] sm:h-auto sm:p-6 lg:flex lg:min-h-[88vh] lg:flex-1 lg:px-5 lg:py-4 xl:min-h-[90vh] xl:px-6 xl:py-5',
                                            isZoomed ? 'select-none' : '',
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={handlePreviewClick}
                                            onPointerDown={handlePreviewPointerDown}
                                            onPointerMove={handlePreviewPointerMove}
                                            onPointerUp={handlePreviewPointerEnd}
                                            onPointerCancel={handlePreviewPointerEnd}
                                            className={cn(
                                                'flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                                isZoomed
                                                    ? isDragging
                                                        ? 'cursor-grabbing touch-none'
                                                        : 'cursor-grab touch-none'
                                                    : 'cursor-zoom-in',
                                            )}
                                        >
                                            <img
                                                ref={imageRef}
                                                src={selectedAsset.url}
                                                draggable={false}
                                                alt={selectedAsset.analysis?.alt_text ?? `${project.name} image`}
                                                className={cn(
                                                    'pointer-events-none max-h-[min(46svh,30rem)] w-auto max-w-full rounded-[1.15rem] object-contain transition duration-300 will-change-transform select-none sm:max-h-[82vh] lg:max-h-[88vh] sm:rounded-lg xl:max-h-[90vh]',
                                                    isZoomed ? 'cursor-grab' : '',
                                                )}
                                                style={{
                                                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${isZoomed ? 2 : 1})`,
                                                }}
                                            />
                                        </button>

                                        <div className="absolute top-3 left-3 rounded-full bg-background/85 px-3 py-1.5 text-xs font-medium text-foreground shadow-none backdrop-blur-sm sm:top-auto sm:bottom-4 sm:left-4 sm:rounded-md sm:px-3 sm:py-2">
                                            {selectedAssetIndex !== null ? `${selectedAssetIndex + 1} of ${(project.assets ?? []).length}` : null}
                                        </div>
                                        <div className="absolute right-3 bottom-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-[11px] text-foreground shadow-none backdrop-blur-sm sm:right-4 sm:bottom-4 sm:max-w-none sm:rounded-md sm:px-3 sm:py-2 sm:text-xs">
                                            <Search className="size-3.5" />
                                            <span className="sm:hidden">{isZoomed ? 'Drag to pan' : 'Tap to zoom'}</span>
                                            <span className="hidden sm:inline">{isZoomed ? 'Drag to pan, click to zoom out' : 'Click image to zoom in'}</span>
                                        </div>
                                    </div>

                                    <div className="flex min-h-0 flex-1 flex-col border-t bg-background lg:h-full lg:max-h-[96vh] lg:border-t-0 lg:border-l">
                                        <div className="border-b bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-5">
                                            <div className="mx-auto w-full max-w-[22rem] space-y-2.5 pr-10 sm:max-w-none sm:space-y-3">
                                                <div className="flex min-w-0 items-start gap-2">
                                                    <h3 className="min-w-0 flex-1 truncate pt-0.5 text-base leading-tight font-semibold tracking-tight sm:line-clamp-3 sm:truncate-none sm:whitespace-normal sm:pt-0 sm:text-2xl">
                                                        {selectedAsset.analysis?.alt_text ?? selectedAsset.filename}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            <div className="mx-auto w-full max-w-[22rem] space-y-4 py-4 pb-8 sm:max-w-none sm:px-6 sm:py-5 sm:pb-5">
                                                <div className="rounded-2xl border bg-card/45 shadow-none">
                                                    <div className="border-b px-3 py-3 sm:px-4 sm:py-4">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium">
                                                                Image details
                                                            </p>
                                                            <p className="text-xs leading-5 text-muted-foreground">
                                                                File info, AI notes and scores.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#f5f1ff] px-2 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 dark:bg-background/50">
                                                        <div className="space-y-5">
                                                            <section className="space-y-3 px-1 py-1 sm:px-0 sm:py-0">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-medium">
                                                                        Tags
                                                                    </p>
                                                                    <p className="text-xs leading-5 text-muted-foreground">
                                                                        Keywords attached to the selected image.
                                                                    </p>
                                                                </div>

                                                                <div className="flex flex-wrap gap-2">
                                                                    {(selectedAsset.analysis?.tags ?? []).slice(0, 6).map((tag) => (
                                                                        <Badge key={tag} variant="outline" className="border-primary/35 text-primary">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </section>

                                                            <section className="space-y-3">
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-medium">
                                                                        Description
                                                                    </p>
                                                                    <p className="text-xs leading-5 text-muted-foreground">
                                                                        Public-facing summary for this image.
                                                                    </p>
                                                                </div>

                                                                <div className="rounded-xl border bg-white p-4 shadow-none dark:border-white/10 dark:bg-background/70">
                                                                    <p className="text-sm leading-6 text-slate-700 dark:text-muted-foreground">
                                                                        {selectedAsset.analysis?.critique ?? 'No description is available for this image yet.'}
                                                                    </p>
                                                                </div>
                                                            </section>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        ) : null}
                    </Dialog>

                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                        <Card className="border-slate-200/80 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/85 dark:shadow-sm">
                            <CardHeader>
                                <CardTitle>Comments</CardTitle>
                                <CardDescription>
                                    Short public notes from people who want to
                                    bookmark or discuss this project.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {comments.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-background/35">
                                        No comments yet. The first good note can
                                        help the creator understand what is
                                        resonating.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-background/45"
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

                        <Card className="border-slate-200/80 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/85 dark:shadow-sm">
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
                                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-background/45">
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
                                                className="rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 dark:border-white/10 dark:bg-background/45"
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
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-background/35">
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
