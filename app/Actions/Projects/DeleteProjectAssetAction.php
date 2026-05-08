<?php

namespace App\Actions\Projects;

use App\Models\Project;
use App\Models\ProjectAsset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteProjectAssetAction
{
    public function handle(Project $project, ProjectAsset $asset): void
    {
        $disk = $asset->disk;
        $path = $asset->path;

        DB::transaction(function () use ($project, $asset): void {
            if ($project->cover_asset_id === $asset->id) {
                $project->forceFill([
                    'cover_asset_id' => null,
                ])->save();
            }

            $asset->delete();
        });

        Storage::disk($disk)->delete($path);
    }
}
