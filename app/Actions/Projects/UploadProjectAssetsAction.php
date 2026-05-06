<?php

namespace App\Actions\Projects;

use App\Models\Project;
use App\Models\ProjectAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

class UploadProjectAssetsAction
{
    /**
     * @param  array<int, UploadedFile>  $files
     * @return Collection<int, ProjectAsset>
     */
    public function handle(Project $project, array $files): Collection
    {
        $sortOrder = ((int) $project->assets()->max('sort_order')) + 1;

        return collect($files)->map(function (UploadedFile $file) use ($project, &$sortOrder): ProjectAsset {
            $path = $file->store('projects/'.$project->id, 'public');
            $dimensions = @getimagesize($file->getRealPath()) ?: [null, null];

            return $project->assets()->create([
                'disk' => 'public',
                'path' => $path,
                'filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                'size' => $file->getSize(),
                'width' => $dimensions[0],
                'height' => $dimensions[1],
                'sort_order' => $sortOrder++,
            ]);
        });
    }
}
