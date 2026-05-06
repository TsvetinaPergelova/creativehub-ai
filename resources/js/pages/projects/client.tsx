import { Form, Head } from '@inertiajs/react';
import { Heart, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import {
    storeAccess,
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
    assets: (ProjectAsset & { is_favorite?: boolean })[];
    favorites_count: number;
};

export default function ClientGallery({
    access,
    gallery,
}: {
    access: GalleryAccess;
    gallery: GalleryData;
}) {
    const [assets, setAssets] = useState(gallery.assets);
    const [isSubmittingFavorite, setIsSubmittingFavorite] = useState(false);
    const favoritesCount = assets.filter((asset) => asset.is_favorite).length;

    const toggleFavorite = async (
        asset: ProjectAsset & { is_favorite?: boolean },
    ) => {
        setIsSubmittingFavorite(true);

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
            body: JSON.stringify({
                asset_id: asset.id,
                is_favorite: !asset.is_favorite,
            }),
        });

        if (response.ok) {
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
        }

        setIsSubmittingFavorite(false);
    };

    return (
        <>
            <Head title={gallery.project_name} />

            <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#ffffff_42%,#f6efe8_100%)] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <section className="rounded-[2rem] border bg-white/80 p-8 shadow-sm backdrop-blur">
                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                            Client Gallery
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                            {gallery.project_name}
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
                            {gallery.project_description ??
                                'Review the gallery and mark your favorite frames for delivery.'}
                        </p>
                    </section>

                    {access.requires_password ? (
                        <Card className="mx-auto max-w-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LockKeyhole className="size-4" />
                                    Protected gallery
                                </CardTitle>
                                <CardDescription>
                                    Enter the password shared with you to view
                                    the gallery and choose favorites.
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
                                    />
                                    <Button type="submit">Unlock gallery</Button>
                                </Form>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-semibold">
                                            Available proofs
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Tap the heart on any frame you want
                                            to keep in focus.
                                        </p>
                                    </div>
                                    <Badge variant="outline">
                                        {assets.length} images
                                    </Badge>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {assets.map((asset) => (
                                        <figure
                                            key={asset.id}
                                            className="overflow-hidden rounded-[1.5rem] border bg-white shadow-sm"
                                        >
                                            <img
                                                src={asset.url}
                                                alt={
                                                    asset.analysis?.alt_text ??
                                                    asset.filename
                                                }
                                                className="aspect-[4/3] w-full object-cover"
                                            />
                                            <figcaption className="space-y-3 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {asset.filename}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {asset.analysis
                                                                ?.critique ??
                                                                'Gallery proof ready for review.'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant={
                                                            asset.is_favorite
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="icon"
                                                        onClick={() =>
                                                            toggleFavorite(
                                                                asset,
                                                            )
                                                        }
                                                        disabled={isSubmittingFavorite}
                                                    >
                                                        <Heart
                                                            className={`size-4 ${asset.is_favorite ? 'fill-current' : ''}`}
                                                        />
                                                    </Button>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {(asset.analysis?.tags ??
                                                        [])
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
                                    ))}
                                </div>
                            </section>

                            <aside className="space-y-4 xl:sticky xl:top-6">
                                <ClientFavoritesPanel
                                    favoritesCount={favoritesCount}
                                />
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
