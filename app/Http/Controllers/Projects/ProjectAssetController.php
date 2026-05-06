<?php

namespace App\Http\Controllers\Projects;

use App\Actions\Projects\UploadProjectAssetsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\StoreProjectAssetRequest;
use App\Jobs\Ai\AnalyzeProjectAssetJob;
use App\Jobs\Ai\RefreshProjectHighlightsJob;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProjectAssetController extends Controller
{
    public function store(
        StoreProjectAssetRequest $request,
        Project $project,
        UploadProjectAssetsAction $uploadProjectAssets,
    ): RedirectResponse {
        $assets = $uploadProjectAssets->handle($project, $request->file('files', []));

        $assets->each(fn ($asset) => AnalyzeProjectAssetJob::dispatch($asset->id));
        RefreshProjectHighlightsJob::dispatch($project->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Images uploaded.'),
        ]);

        return to_route('projects.show', $project);
    }
}
