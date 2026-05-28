import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, LoaderCircle } from 'lucide-react';
import ProjectAssetController from '@/actions/App/Http/Controllers/Projects/ProjectAssetController';
import InputError from '@/components/input-error';
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
        totalBytes: number;
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
    const isUploading = form.processing;
    const hasCompletedUpload = !isUploading && lastUploadSummary !== null;
    const uploadLabel = isUploading
        ? form.progress
            ? `Uploading ${uploadPercentage}%`
            : 'Preparing upload...'
        : hasCompletedUpload
          ? lastUploadSummary.count === 1
              ? 'Upload complete'
              : 'Uploads complete'
          : 'Ready to upload';
    const uploadDescription = isUploading
        ? `CreativeHub is sending ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} and will hand them to Curator next.`
        : hasCompletedUpload
          ? `${lastUploadSummary.count} file${lastUploadSummary.count === 1 ? '' : 's'} accepted. Curator review has started.`
          : 'Choose files to start a new review cycle. The latest upload status will stay here.';
    const statusPercentage = isUploading
        ? `${uploadPercentage}%`
        : hasCompletedUpload
          ? '100%'
          : null;
    const progressWidth = isUploading
        ? Math.max(uploadPercentage, 8)
        : hasCompletedUpload
          ? 100
          : 0;
    const progressToneClass = hasCompletedUpload
        ? 'bg-emerald-500'
        : 'bg-primary';
    const summaryCount = isUploading
        ? selectedFiles.length
        : (lastUploadSummary?.count ?? 0);
    const summaryBytes = isUploading
        ? selectedBytes
        : (lastUploadSummary?.totalBytes ?? 0);
    const latestFilename = isUploading
        ? (selectedFiles.at(-1)?.name ?? null)
        : (lastUploadSummary?.filenames.at(-1) ?? null);

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
                    totalBytes: filesForSummary.reduce(
                        (total, file) => total + file.size,
                        0,
                    ),
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
        <div className="flex min-w-0 flex-col gap-6">
            <div className="flex min-w-0 flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <ImagePlus className="size-4" />
                    </div>
                    <h2 className="text-lg font-semibold">Add images</h2>
                </div>

                <div className="min-w-0 space-y-4">
                    <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-10 xl:gap-14">
                        <div className="min-w-0 lg:max-w-2xl">
                            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                Pick the frames you want in this project.
                                CreativeHub uploads them and starts AI analysis
                                automatically.
                            </p>
                        </div>

                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0 lg:justify-end lg:pl-4 xl:pl-6">
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
                                disabled={form.processing}
                                onClick={() => inputRef.current?.click()}
                                className="h-auto w-full rounded-2xl border-2 border-primary/45 bg-primary/8 px-4 py-3 text-sm text-foreground transition hover:border-primary/70 hover:bg-primary/12 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:w-auto"
                            >
                                <span className="flex items-center justify-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                        {form.processing ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <ImagePlus className="size-4" />
                                        )}
                                    </span>
                                    <span className="text-center font-semibold">
                                        {form.processing
                                            ? 'Uploading...'
                                            : 'Upload images'}
                                    </span>
                                </span>
                            </Button>
                        </div>
                    </div>

                    <p className="max-w-full text-[11px] leading-5 tracking-[0.14em] break-words text-muted-foreground uppercase sm:text-xs sm:tracking-[0.24em]">
                        {selectedFiles.length === 0
                            ? 'Choose a set to begin curation'
                            : `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} selected`}
                    </p>
                </div>
            </div>

            <div className="rounded-lg border bg-background/50 p-5">
                <div className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">Upload status</p>
                            <p className="text-sm text-muted-foreground">
                                {uploadLabel}
                            </p>
                        </div>
                        {statusPercentage && (
                            <p className="text-sm font-medium text-foreground">
                                {statusPercentage}
                            </p>
                        )}
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${progressToneClass}`}
                            style={{
                                width: `${progressWidth}%`,
                            }}
                        />
                    </div>

                    <p className="text-sm break-words text-muted-foreground">
                        {uploadDescription}
                    </p>

                    {hasCompletedUpload && !form.hasErrors && (
                        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                            <div className="min-w-0 space-y-1">
                                <p className="text-sm font-medium">
                                    {lastUploadSummary.count === 1
                                        ? 'Latest upload accepted'
                                        : 'Latest uploads accepted'}
                                </p>
                                <p className="text-xs break-all text-muted-foreground">
                                    {lastUploadSummary.filenames
                                        .slice(0, 2)
                                        .join(', ')}
                                    {lastUploadSummary.filenames.length > 2
                                        ? ` +${lastUploadSummary.filenames.length - 2} more`
                                        : ''}
                                </p>
                            </div>
                        </div>
                    )}

                    <dl className="grid grid-cols-3 gap-3 border-t pt-4 text-sm">
                        <div className="min-w-0 space-y-1">
                            <dt className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                Files
                            </dt>
                            <dd className="font-medium text-foreground">
                                {summaryCount}
                            </dd>
                        </div>
                        <div className="min-w-0 space-y-1">
                            <dt className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                Size
                            </dt>
                            <dd className="font-medium text-foreground">
                                {summaryBytes === 0
                                    ? '0 MB'
                                    : `${(summaryBytes / (1024 * 1024)).toFixed(1)} MB`}
                            </dd>
                        </div>
                        <div className="min-w-0 space-y-1">
                            <dt className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                                Latest
                            </dt>
                            <dd
                                className="truncate font-medium text-foreground"
                                title={latestFilename ?? undefined}
                            >
                                {latestFilename ?? 'No upload yet'}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            <InputError className="mt-3" message={form.errors.files} />
        </div>
    );
}
