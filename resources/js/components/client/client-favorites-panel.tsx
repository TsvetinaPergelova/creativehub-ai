import { Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientFavoritesPanel({
    favoritesCount,
}: {
    favoritesCount: number;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="size-4 text-rose-500" />
                    Favorites
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                    {favoritesCount}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Images marked for follow-up in this gallery.
                </p>
            </CardContent>
        </Card>
    );
}
