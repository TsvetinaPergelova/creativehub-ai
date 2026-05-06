import { useRef } from 'react';
import { Upload } from 'lucide-react';
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
    const form = useForm<{
        files: File[];
    }>({
        files: [],
    });

    function submit() {
        if (form.data.files.length === 0) {
            return;
        }

        form.post(ProjectAssetController.store(projectId).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();

                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        });
    }

    return (
        <div className="rounded-xl border border-dashed p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Upload images</h2>
                    <p className="text-sm text-muted-foreground">
                        Add JPEG or PNG files to start building this project.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-medium"
                        onChange={(event) =>
                            form.setData(
                                'files',
                                Array.from(event.target.files ?? []),
                            )
                        }
                    />

                    <Button
                        type="button"
                        disabled={
                            form.processing || form.data.files.length === 0
                        }
                        onClick={submit}
                    >
                        <Upload className="mr-2 size-4" />
                        Upload
                    </Button>
                </div>
            </div>

            {form.progress && (
                <div className="mt-4 space-y-2">
                    <progress
                        className="h-2 w-full overflow-hidden rounded-full"
                        value={form.progress.percentage}
                        max="100"
                    >
                        {form.progress.percentage}%
                    </progress>
                    <p className="text-sm text-muted-foreground">
                        Uploading {form.progress.percentage}%
                    </p>
                </div>
            )}

            <InputError className="mt-3" message={form.errors.files} />
        </div>
    );
}
