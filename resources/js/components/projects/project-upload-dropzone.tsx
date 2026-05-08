import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, LoaderCircle } from 'lucide-react';
import ProjectAssetController from '@/actions/App/Http/Controllers/Projects/ProjectAssetController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';

export default function ProjectUploadDropzone({
    projectId,
}: {
    projectId: number;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [lastUploadSummary, setLastUploadSummary] = useState<{
        count: number;
        filenames: string[];
    } | null>(null);
    const form = useForm<{
        files: File[];
    }>({
        files: [],
    });
    const selectedFiles = form.data.files;
    const selectedBytes = useMemo(
        () => selectedFiles.reduce((total, file) => total + file.size, 0),
        [selectedFiles],
    );
    const uploadPercentage = form.progress?.percentage ?? 0;
    const uploadLabel = form.processing
        ? form.progress
            ? `Uploading ${uploadPercentage}%`
            : 'Preparing upload...'
        : selectedFiles.length > 0
          ? 'Upload starting...'
          : 'Drop images here or browse';

    function submit(files: File[]) {
        if (files.length === 0) {
            return;
        }

        const filesForSummary = [...files];

        form.transform(() => ({ files }));
        form.post(ProjectAssetController.store(projectId).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setLastUploadSummary({
                    count: filesForSummary.length,
                    filenames: filesForSummary.map((file) => file.name),
                });
                form.reset();

                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
            onError: () => {
                setLastUploadSummary(null);
            },
        });
    }

    function handleFilesSelection(files: File[]) {
        setLastUploadSummary(null);
        form.setData('files', files);
        submit(files);
    }

    return (
        <div className="rounded-xl border border-dashed bg-card/60 p-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/12 text-primary">
                                <ImagePlus className="size-4" />
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-2">
                                    Step 1
                                </Badge>
                                <h2 className="text-lg font-semibold">
                                    Add images
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Pick the frames you want in this project.
                                    CreativeHub uploads them and starts AI
                                    analysis automatically.
                                </p>
                            </div>
                        </div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                            {selectedFiles.length === 0
                                ? 'Choose a set to begin curation'
                                : `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} selected`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                                handleFilesSelection(
                                    Array.from(event.target.files ?? []),
                                )
                            }
                        />

                        <Button
                            type="button"
                            variant="secondary"
                            disabled={form.processing}
                            onClick={() => inputRef.current?.click()}
                        >
                            {form.processing ? (
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                            ) : (
                                <ImagePlus className="mr-2 size-4" />
                            )}
                            {form.processing ? 'Uploading...' : 'Choose files'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="space-y-4 rounded-lg border bg-background/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium">
                                    Status
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {uploadLabel}
                                </p>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                {form.processing ? `${uploadPercentage}%` : ''}
                            </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{
                                    width: `${form.processing ? Math.max(uploadPercentage, 8) : selectedFiles.length > 0 ? 18 : 0}%`,
                                }}
                            />
                        </div>

                        {form.processing && selectedFiles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedFiles.slice(0, 4).map((file) => (
                                    <span
                                        key={`${file.name}-${file.size}`}
                                        className="rounded-md border bg-background px-3 py-1 text-xs text-muted-foreground"
                                    >
                                        {file.name}
                                    </span>
                                ))}
                                {selectedFiles.length > 4 && (
                                    <span className="rounded-md border bg-background px-3 py-1 text-xs text-muted-foreground">
                                        +{selectedFiles.length - 4} more
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                The queue will appear here as soon as you pick
                                files.
                            </p>
                        )}

                        {lastUploadSummary && !form.processing && !form.hasErrors && (
                            <div className="rounded-lg border border-primary/20 bg-primary/8 p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            {lastUploadSummary.count === 1
                                                ? 'Upload complete'
                                                : 'Uploads complete'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {lastUploadSummary.count} file
                                            {lastUploadSummary.count === 1
                                                ? ''
                                                : 's'}{' '}
                                            accepted. AI analysis has started.
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {lastUploadSummary.filenames
                                                .slice(0, 2)
                                                .join(', ')}
                                            {lastUploadSummary.filenames.length > 2
                                                ? ` +${lastUploadSummary.filenames.length - 2} more`
                                                : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border bg-background/50 p-4">
                        <p className="text-sm font-medium">Queue</p>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Files
                                </dt>
                                <dd>{selectedFiles.length}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Size
                                </dt>
                                <dd>
                                    {selectedBytes === 0
                                        ? '0 MB'
                                        : `${(selectedBytes / (1024 * 1024)).toFixed(1)} MB`}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Destination
                                </dt>
                                <dd className="font-mono text-xs">
                                    project/{projectId}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <InputError className="mt-3" message={form.errors.files} />
        </div>
    );
}
