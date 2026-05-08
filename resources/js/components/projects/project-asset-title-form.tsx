import { type FormEvent, useEffect } from 'react';
import ProjectAssetController from '@/actions/App/Http/Controllers/Projects/ProjectAssetController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProjectAsset } from '@/types';
import { useForm } from '@inertiajs/react';

export default function ProjectAssetTitleForm({
    asset,
    projectId,
    onSaved,
    mode = 'compact',
}: {
    asset: ProjectAsset;
    projectId: number;
    onSaved?: (title: string | null) => void;
    mode?: 'compact' | 'panel';
}) {
    const form = useForm({
        title: asset.title ?? '',
    });

    useEffect(() => {
        form.setData('title', asset.title ?? '');
        form.clearErrors();
    }, [asset.id, asset.title]);

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        form.transform((data) => ({
            title: data.title.trim(),
        }));
        const trimmedTitle = form.data.title.trim();

        form.patch(ProjectAssetController.update([projectId, asset.id]).url, {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults('title', trimmedTitle);
                onSaved?.(trimmedTitle === '' ? null : trimmedTitle);
            },
        });
    }

    if (mode === 'panel') {
        return (
            <form className="space-y-3" onSubmit={submit}>
                <div className="space-y-2">
                    <p className="text-sm font-medium">Title</p>
                    <Input
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                        placeholder="Give this image a clear title"
                        maxLength={120}
                    />
                    <p className="text-xs text-muted-foreground">
                        File: {asset.filename}
                    </p>
                    <InputError message={form.errors.title} />
                </div>

                <Button
                    type="submit"
                    size="sm"
                    disabled={form.processing || !form.isDirty}
                >
                    {form.processing
                        ? 'Saving...'
                        : form.recentlySuccessful
                          ? 'Saved'
                          : asset.title
                            ? 'Update title'
                            : 'Save title'}
                </Button>
            </form>
        );
    }

    return (
        <form className="space-y-2" onSubmit={submit}>
            <Input
                value={form.data.title}
                onChange={(event) => form.setData('title', event.target.value)}
                placeholder="Add a title for this image"
                maxLength={120}
            />
            <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs text-muted-foreground">
                    {asset.filename}
                </p>
                <Button
                    type="submit"
                    size="sm"
                    disabled={form.processing || !form.isDirty}
                >
                    {form.processing
                        ? 'Saving...'
                        : form.recentlySuccessful
                          ? 'Saved'
                          : 'Save'}
                </Button>
            </div>
            {form.recentlySuccessful && (
                <p className="text-xs font-medium text-primary">
                    Title saved. The asset card below updates automatically.
                </p>
            )}
            <InputError message={form.errors.title} />
        </form>
    );
}
