import { router } from '@inertiajs/react';
import { Bookmark, BookmarkCheck, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicProjectSaveController from '@/actions/App/Http/Controllers/PublicProjectSaveController';
import { Button } from '@/components/ui/button';

export default function SaveProjectButton({
    creatorId,
    projectSlug,
    isSaved,
    only,
    className,
    compact = false,
}: {
    creatorId: number;
    projectSlug: string;
    isSaved: boolean;
    only?: string[];
    className?: string;
    compact?: boolean;
}) {
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setProcessing(false);
    }, [isSaved]);

    function toggleSavedProject(): void {
        setProcessing(true);

        if (isSaved) {
            router.delete(
                PublicProjectSaveController.destroy({
                    user: creatorId,
                    project: projectSlug,
                }),
                {
                    preserveScroll: true,
                    preserveState: true,
                    only,
                    onFinish: () => setProcessing(false),
                },
            );

            return;
        }

        router.post(
            PublicProjectSaveController.store({
                user: creatorId,
                project: projectSlug,
            }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only,
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <Button
            type="button"
            variant={isSaved ? 'secondary' : 'outline'}
            className={className}
            size={compact ? 'sm' : 'default'}
            onClick={toggleSavedProject}
            disabled={processing}
        >
            {processing ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : isSaved ? (
                <BookmarkCheck className="mr-2 size-4" />
            ) : (
                <Bookmark className="mr-2 size-4" />
            )}
            {isSaved ? 'Saved' : 'Save project'}
        </Button>
    );
}
