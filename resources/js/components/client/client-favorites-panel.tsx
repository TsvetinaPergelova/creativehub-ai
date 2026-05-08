import { Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientFavoritesPanel({
    favoritesCount,
    totalAssets,
}: {
    favoritesCount: number;
    totalAssets: number;
}) {
    const shortlistLabel = favoritesCount === 1 ? '1 proof saved' : `${favoritesCount} proofs saved`;

    return (
        <Card className="border-white/10 bg-card/85 shadow-sm backdrop-blur">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="size-4 text-rose-500" />
                    Selection summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-end justify-between gap-4 rounded-xl border border-white/10 bg-background/50 p-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Favorites
                        </p>
                        <p className="mt-2 text-4xl font-semibold tracking-tight">
                            {favoritesCount}
                        </p>
                    </div>
                    <Badge variant="outline">{shortlistLabel}</Badge>
                </div>

                <div className="rounded-xl border border-white/10 bg-background/40 p-4 text-sm text-muted-foreground">
                    Mark the frames you want to keep in focus. Your shortlist stays attached to this gallery link.
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Available proofs</span>
                    <span>{totalAssets}</span>
                </div>
            </CardContent>
        </Card>
    );
}
