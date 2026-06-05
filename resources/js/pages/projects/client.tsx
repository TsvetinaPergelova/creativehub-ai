import { Form, Head, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CircleHelp, Expand, Heart, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import {
    storeAccess,
    submitReview as submitReviewRoute,
    toggleFavorite as toggleFavoriteRoute,
} from '@/actions/App/Http/Controllers/ClientGalleryController';
import ClientFavoritesPanel from '@/components/client/client-favorites-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { ProjectAsset } from '@/types';

type GalleryAccess = {
    requires_password: boolean;
    is_unlocked: boolean;
};

type GalleryData = {
    token: string;
    project_name: string;
    project_description: string | null;
    cover_image_url: string | null;
    assets: (ProjectAsset & { is_favorite?: boolean })[];
    favorites_count: number;
    review: {
        reviewer_name: string | null;
        reviewer_comment: string | null;
        approved_at: string | null;
    } | null;
};

export default function ClientGallery({
    access,
    gallery,
}: {
    access: GalleryAccess;
    gallery: GalleryData;
}) {
    const page = usePage<{ errors?: Record<string, string> }>();
    const [assets, setAssets] = useState(gallery.assets);
    const [pendingFavoriteAssetId, setPendingFavoriteAssetId] = useState<number | null>(null);
    const [favoriteError, setFavoriteError] = useState<string | null>(null);
    const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(true);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
    const reviewForm = useForm({
        reviewer_name: gallery.review?.reviewer_name ?? '',
        reviewer_comment: gallery.review?.reviewer_comment ?? '',
    });
    const favoritesCount = assets.filter((asset) => asset.is_favorite).length;
    const highlightedAssets = assets.filter((asset) => asset.analysis?.is_highlight).length;
    const selectedAsset = selectedAssetIndex === null ? null : assets[selectedAssetIndex] ?? null;
    const shortlistApproved = gallery.review?.approved_at ?? null;
    const reviewSubmissionError = page.props.errors?.review ?? null;

    const toggleFavorite = async (
        asset: ProjectAsset & { is_favorite?: boolean },
    ) => {
        if (pendingFavoriteAssetId === asset.id) {
            return;
        }

        setPendingFavoriteAssetId(asset.id);
        setFavoriteError(null);

        try {
            const response = await fetch(toggleFavoriteRoute.url(gallery.token), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    asset_id: asset.id,
                    is_favorite: !asset.is_favorite,
                }),
            });

            if (!response.ok) {
                setFavoriteError('We could not save that selection. Please try again.');

                return;
            }

            setAssets((currentAssets) =>
                currentAssets.map((currentAsset) =>
                    currentAsset.id === asset.id
                        ? {
                              ...currentAsset,
                              is_favorite: !currentAsset.is_favorite,
                          }
                        : currentAsset,
                ),
            );
        } catch {
            setFavoriteError('We could not save that selection. Please try again.');
        } finally {
            setPendingFavoriteAssetId(null);
        }
    };

    function openAsset(index: number): void {
        setSelectedAssetIndex(index);
    }

    function closeAsset(open: boolean): void {
        if (!open) {
            setSelectedAssetIndex(null);
        }
    }

    function showPreviousAsset(): void {
        if (selectedAssetIndex === null) {
            return;
        }

        setSelectedAssetIndex((selectedAssetIndex - 1 + assets.length) % assets.length);
    }

    function showNextAsset(): void {
        if (selectedAssetIndex === null) {
            return;
        }

        setSelectedAssetIndex((selectedAssetIndex + 1) % assets.length);
    }

    function submitReview(): void {
        reviewForm.post(submitReviewRoute(gallery.token).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={gallery.project_name} />

            <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.08),transparent_34%),#ffffff] px-3 py-6 text-foreground sm:px-6 sm:py-10 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_34%),rgba(255,255,255,0.03)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.08),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.06))] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_34%)]" />

                <div className="relative mx-auto max-w-7xl space-y-6 sm:space-y-8">
                    <section className="relative overflow-hidden rounded-[1.75rem] border border-primary/18 bg-[#faf7ff] p-0 shadow-none sm:rounded-[2rem] sm:p-10 dark:border-white/10 dark:bg-white/[0.03]">
                        {gallery.cover_image_url && (
                            <>
                                <img
                                    src={gallery.cover_image_url}
                                    alt={`${gallery.project_name} cover`}
                                    className="pointer-events-none absolute inset-0 size-full object-cover"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(250,247,255,0.82)_0%,rgba(250,247,255,0.72)_28%,rgba(250,247,255,0.36)_54%,rgba(250,247,255,0.18)_74%,rgba(250,247,255,0.12)_100%)] dark:bg-[linear-gradient(110deg,rgba(7,9,20,0.92)_0%,rgba(7,9,20,0.82)_38%,rgba(7,9,20,0.72)_58%,rgba(7,9,20,0.82)_100%)]" />
                            </>
                        )}

                        <div className="relative lg:hidden">
                            <div className="relative overflow-hidden bg-white/72 backdrop-blur-sm">
                                {gallery.cover_image_url ? (
                                    <>
                                        <img
                                            src={gallery.cover_image_url}
                                            alt={`${gallery.project_name} cover`}
                                            className="size-full aspect-[4/5] object-cover"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(250,247,255,0.72),rgba(250,247,255,0.34),rgba(250,247,255,0.94))]" />
                                    </>
                                ) : (
                                    <div className="aspect-[4/5] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.08),transparent_38%),#ffffff]" />
                                )}

                                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                                    <Badge variant="outline">Shared review</Badge>
                                    <Badge variant="outline" className="bg-black/60 backdrop-blur-md">
                                        {assets.length} proof{assets.length === 1 ? '' : 's'}
                                    </Badge>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 space-y-4 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                                        Client gallery
                                    </p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-foreground">
                                        {gallery.project_name}
                                    </h1>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge
                                            variant="outline"
                                            className="border-primary/20 bg-white/80 text-primary backdrop-blur-md"
                                        >
                                            {favoritesCount} favorite{favoritesCount === 1 ? '' : 's'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded-xl border border-slate-200 bg-white/85 p-3 shadow-none backdrop-blur-md">
                                            <p className="text-[9px] leading-tight uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.22em]">
                                                Available
                                            </p>
                                            <p className="mt-3 text-2xl font-semibold text-slate-950">
                                                {assets.length}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white/85 p-3 shadow-none backdrop-blur-md">
                                            <p className="text-[9px] leading-tight uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.22em]">
                                                Shortlist
                                            </p>
                                            <p className="mt-3 text-2xl font-semibold text-slate-950">
                                                {favoritesCount}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white/85 p-3 shadow-none backdrop-blur-md">
                                            <p className="text-[9px] leading-tight uppercase tracking-[0.14em] text-slate-500 sm:text-[10px] sm:tracking-[0.22em]">
                                                Highlights
                                            </p>
                                            <p className="mt-3 text-2xl font-semibold text-slate-950">
                                                {highlightedAssets}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
                            <div className="space-y-4 sm:space-y-5">
                                <div className="rounded-[1.5rem] border border-white/55 bg-white/82 p-5 shadow-none backdrop-blur-md sm:p-6 dark:border-white/10 dark:bg-background/55">
                                    <p className="text-sm uppercase tracking-[0.3em] text-primary/70">
                                        Client gallery
                                    </p>
                                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-foreground sm:text-5xl">
                                        {gallery.project_name}
                                    </h1>
                                    <p className="max-w-3xl text-sm leading-6 text-slate-700 sm:text-lg sm:leading-7 dark:text-muted-foreground">
                                        {gallery.project_description ??
                                            'Review the gallery, save the strongest frames, and keep the conversation focused on what should move forward.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-primary text-primary-foreground">Shared review</Badge>
                                    <Badge variant="outline">
                                        {assets.length} proof{assets.length === 1 ? '' : 's'}
                                    </Badge>
                                    <Badge variant="outline">
                                        {favoritesCount} favorite{favoritesCount === 1 ? '' : 's'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
                                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-none sm:p-4 dark:border-white/10 dark:bg-background/55">
                                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-muted-foreground">
                                        Available
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-foreground">{assets.length}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-none sm:p-4 dark:border-white/10 dark:bg-background/55">
                                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-muted-foreground">
                                        Shortlist
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-foreground">{favoritesCount}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-none sm:p-4 dark:border-white/10 dark:bg-background/55">
                                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-muted-foreground">
                                        Highlights
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-foreground">{highlightedAssets}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {access.requires_password ? (
                        <Card className="mx-auto max-w-xl border-slate-200 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/60 dark:shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LockKeyhole className="size-4" />
                                    Unlock the gallery
                                </CardTitle>
                                <CardDescription>
                                    Enter the password shared with you to review the proofs and build a shortlist.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form
                                    action={storeAccess(gallery.token)}
                                    method="post"
                                    className="space-y-4"
                                >
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Gallery password"
                                        className="bg-background/60"
                                    />
                                    <Button type="submit">Unlock gallery</Button>
                                </Form>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
                            <section className="space-y-5">
                                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-card/60">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                                                Review flow
                                            </p>
                                            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                                                Pick the frames worth keeping
                                            </h2>
                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                                Use the heart on any proof you want to keep in focus. The shortlist updates instantly as you review.
                                            </p>
                                        </div>

                                        <Badge variant="outline">
                                            {favoritesCount} saved for follow-up
                                        </Badge>
                                    </div>
                                </div>

                                {favoriteError && (
                                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                        {favoriteError}
                                    </div>
                                )}

                                <div className="grid gap-4 md:grid-cols-2">
                                    {assets.map((asset, index) => {
                                        const assetLabel = asset.title ?? asset.filename;

                                        return (
                                            <figure
                                                key={asset.id}
                                                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none transition-transform duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-card/70 dark:shadow-none"
                                            >
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => openAsset(index)}
                                                        className="block w-full text-left focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                                                    >
                                                        <img
                                                            src={asset.url}
                                                            alt={
                                                                asset.analysis?.alt_text ??
                                                                assetLabel
                                                            }
                                                            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                                        />
                                                    </button>
                                                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {asset.analysis?.is_highlight && (
                                                                <Badge>Highlight</Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                className="border-white/10 bg-background/80 shadow-none backdrop-blur"
                                                                onClick={() => openAsset(index)}
                                                            >
                                                                <Expand className="size-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant={asset.is_favorite ? 'default' : 'outline'}
                                                                size="icon"
                                                                className="border-white/10 bg-background/80 shadow-none backdrop-blur"
                                                                onClick={() => toggleFavorite(asset)}
                                                            >
                                                                <Heart
                                                                    className={`size-4 ${asset.is_favorite ? 'fill-current text-rose-500' : 'text-slate-700'}`}
                                                                />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <figcaption className="space-y-3 p-4 sm:space-y-4 sm:p-5">
                                                    <div className="space-y-2">
                                                        <p className="text-base font-semibold tracking-tight sm:text-lg">
                                                            {assetLabel}
                                                        </p>
                                                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                                                            {asset.analysis?.critique ??
                                                                'Proof ready for review and client selection.'}
                                                        </p>
                                                    </div>

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
                                                </figcaption>
                                            </figure>
                                        );
                                    })}
                                </div>
                            </section>

                            <aside className="space-y-3 sm:space-y-4 xl:sticky xl:top-6">
                                <div className="sm:hidden">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-none backdrop-blur dark:border-white/10 dark:bg-card/60 dark:shadow-none"
                                        onClick={() => setIsGuideDialogOpen(true)}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <CircleHelp className="size-4" />
                                            Guide
                                        </span>
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                    </Button>
                                </div>

                                <ClientFavoritesPanel
                                    favoritesCount={favoritesCount}
                                    totalAssets={assets.length}
                                    approvedAt={shortlistApproved}
                                />

                                <Collapsible
                                    open={isFinalizeOpen}
                                    onOpenChange={setIsFinalizeOpen}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/60 dark:shadow-none"
                                >
                                    <Card className="border-0 bg-transparent shadow-none">
                                        <CollapsibleTrigger asChild>
                                            <button
                                                type="button"
                                                className="w-full text-left transition hover:bg-slate-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none dark:hover:bg-white/[0.03]"
                                            >
                                                <CardHeader className="px-5 py-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1.5">
                                                            <CardTitle>
                                                                Finalize shortlist
                                                            </CardTitle>
                                                            <CardDescription className="text-sm leading-6">
                                                                Save one overall note for the creator and confirm the shortlist when you are ready.
                                                            </CardDescription>
                                                        </div>
                                                        <ChevronRight
                                                            className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${isFinalizeOpen ? 'rotate-90' : ''}`}
                                                        />
                                                    </div>
                                                </CardHeader>
                                            </button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4 border-t border-slate-200 px-5 py-4 dark:border-white/10">
                                                <div className="grid gap-2">
                                                    <label
                                                        htmlFor="reviewer_name"
                                                        className="text-sm font-medium"
                                                    >
                                                        Your name
                                                    </label>
                                                    <Input
                                                        id="reviewer_name"
                                                        value={reviewForm.data.reviewer_name}
                                                        onChange={(event) =>
                                                            reviewForm.setData(
                                                                'reviewer_name',
                                                                event.target.value,
                                                            )
                                                        }
                                                        placeholder="Optional"
                                                    />
                                                    {reviewForm.errors.reviewer_name ? (
                                                        <p className="text-sm text-rose-300">
                                                            {reviewForm.errors.reviewer_name}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                <div className="grid gap-2">
                                                    <label
                                                        htmlFor="reviewer_comment"
                                                        className="text-sm font-medium"
                                                    >
                                                        Project note
                                                    </label>
                                                    <textarea
                                                        id="reviewer_comment"
                                                        value={reviewForm.data.reviewer_comment}
                                                        onChange={(event) =>
                                                            reviewForm.setData(
                                                                'reviewer_comment',
                                                                event.target.value,
                                                            )
                                                        }
                                                        rows={4}
                                                        placeholder="Optional overall feedback for the creator."
                                                        className="flex min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-background/60"
                                                    />
                                                    {reviewForm.errors.reviewer_comment ? (
                                                        <p className="text-sm text-rose-300">
                                                            {reviewForm.errors.reviewer_comment}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                {reviewSubmissionError ? (
                                                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                                        {reviewSubmissionError}
                                                    </div>
                                                ) : null}

                                                {shortlistApproved ? (
                                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                                        This shortlist has already been approved. You can update the note and submit it again if needed.
                                                    </div>
                                                ) : null}

                                                <Button
                                                    type="button"
                                                    className="w-full"
                                                    disabled={favoritesCount === 0 || reviewForm.processing}
                                                    onClick={submitReview}
                                                >
                                                    {reviewForm.processing
                                                        ? 'Saving shortlist...'
                                                        : 'Approve shortlist'}
                                                </Button>

                                                <p className="text-xs leading-5 text-muted-foreground">
                                                    The creator will use your saved favorites and note as the final review direction for this gallery.
                                                </p>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>

                                <div className="hidden sm:block">
                                    <Collapsible
                                        open={isGuideOpen}
                                        onOpenChange={setIsGuideOpen}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none backdrop-blur dark:border-white/10 dark:bg-card/60 dark:shadow-none"
                                    >
                                        <Card className="border-0 bg-transparent shadow-none">
                                            <CollapsibleTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="w-full text-left transition hover:bg-white/[0.03] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                                >
                                                    <CardHeader className="px-5 py-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <CardTitle>How to use this gallery</CardTitle>
                                                            <ChevronRight
                                                                className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${isGuideOpen ? 'rotate-90' : ''}`}
                                                            />
                                                        </div>
                                                    </CardHeader>
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <CardContent className="space-y-3 border-t px-5 py-4 text-sm text-muted-foreground">
                                                    <p>Scan the proofs, heart the ones you want to keep in focus, and use that shortlist as the basis for feedback.</p>
                                                    <p>Your saved picks stay attached to this private gallery link, so the next review can start from the same shortlist.</p>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isGuideDialogOpen} onOpenChange={setIsGuideDialogOpen}>
                <DialogContent className="sm:hidden">
                    <DialogTitle>How to use this gallery</DialogTitle>
                    <DialogDescription>
                        Keep the shortlist focused and easy to pass back to the creator.
                    </DialogDescription>
                    <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                        <p>Scan the proofs, heart the ones you want to keep in focus, and use that shortlist as the basis for feedback.</p>
                        <p>Your saved picks stay attached to this private gallery link, so the next review can start from the same shortlist.</p>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={selectedAsset !== null} onOpenChange={closeAsset}>
                {selectedAsset && (
                    <DialogContent className="inset-0 h-dvh w-screen max-h-none max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-0 p-0 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-auto sm:w-full sm:max-h-[92vh] sm:max-w-6xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border lg:overflow-hidden">
                        <DialogTitle className="sr-only">
                            {selectedAsset.title ?? selectedAsset.filename}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Large proof preview for client review.
                        </DialogDescription>

                        <div className="grid min-h-0 lg:max-h-[92vh] lg:grid-cols-[minmax(0,1fr)_22rem]">
                            <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden bg-black/95 p-4 sm:p-6">
                                <img
                                    src={selectedAsset.url}
                                    alt={
                                        selectedAsset.analysis?.alt_text ??
                                        selectedAsset.title ??
                                        selectedAsset.filename
                                    }
                                    className="max-h-[74vh] w-auto max-w-full rounded-lg object-contain"
                                />

                                {assets.length > 1 && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={showPreviousAsset}
                                            className="absolute left-4 top-1/2 size-9 -translate-y-1/2 rounded-full border-white/25 bg-black/65 text-white shadow-none backdrop-blur-md hover:bg-black/80"
                                        >
                                            <ChevronLeft className="size-4" />
                                            <span className="sr-only">Previous proof</span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={showNextAsset}
                                            className="absolute right-4 top-1/2 size-9 -translate-y-1/2 rounded-full border-white/25 bg-black/65 text-white shadow-none backdrop-blur-md hover:bg-black/80"
                                        >
                                            <ChevronRight className="size-4" />
                                            <span className="sr-only">Next proof</span>
                                        </Button>
                                    </>
                                )}

                                <div className="absolute bottom-4 left-4 rounded-md bg-background/85 px-3 py-2 text-xs text-foreground shadow-none backdrop-blur-sm">
                                    {selectedAssetIndex !== null
                                        ? `${selectedAssetIndex + 1} of ${assets.length}`
                                        : null}
                                </div>
                            </div>

                            <div className="flex flex-col border-t bg-background lg:max-h-[92vh] lg:border-l lg:border-t-0">
                                <div className="space-y-5 p-6 lg:overflow-y-auto">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAsset.analysis?.is_highlight && (
                                                <Badge>Highlight</Badge>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-semibold tracking-tight">
                                                {selectedAsset.title ?? selectedAsset.filename}
                                            </h3>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {selectedAsset.analysis?.alt_text ??
                                                    'Proof ready for closer review.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-white/10 bg-card/70 p-4">
                                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                            Client note
                                        </p>
                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                            {selectedAsset.analysis?.critique ??
                                                'Use the shortlist to keep track of the proofs you want to discuss or move forward with.'}
                                        </p>
                                    </div>

                                    {(selectedAsset.analysis?.tags?.length ?? 0) > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">Tags</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAsset.analysis?.tags.map((tag) => (
                                                    <Badge key={tag} variant="outline">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-white/10 bg-card/70 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                                File
                                            </p>
                                            <p className="mt-2 text-sm text-foreground">
                                                {selectedAsset.filename}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-card/70 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                                Size
                                            </p>
                                            <p className="mt-2 text-sm text-foreground">
                                                {selectedAsset.width && selectedAsset.height
                                                    ? `${selectedAsset.width} x ${selectedAsset.height}`
                                                    : 'Original dimensions'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button
                                            type="button"
                                            onClick={() => toggleFavorite(selectedAsset)}
                                        >
                                            <Heart
                                                className={`mr-2 size-4 ${selectedAsset.is_favorite ? 'fill-current text-rose-500' : 'text-slate-700'}`}
                                            />
                                            {selectedAsset.is_favorite
                                                ? 'Remove from shortlist'
                                                : 'Save to shortlist'}
                                        </Button>
                                        {assets.length > 1 && (
                                            <Button type="button" variant="outline" onClick={showNextAsset}>
                                                Next proof
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}

ClientGallery.layout = null;
