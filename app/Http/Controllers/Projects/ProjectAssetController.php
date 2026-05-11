<?php

namespace App\Http\Controllers\Projects;

use App\Actions\Projects\DeleteProjectAssetAction;
use App\Actions\Projects\UploadProjectAssetsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\StoreProjectAssetRequest;
use App\Http\Requests\Projects\UpdateProjectAssetRequest;
use App\Jobs\Ai\AnalyzeProjectAssetJob;
use App\Models\Project;
use App\Models\ProjectAsset;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProjectAssetController extends Controller
{
    public function store(
        StoreProjectAssetRequest $request,
        Project $project,
        UploadProjectAssetsAction $uploadProjectAssets,
        Dispatcher $dispatcher,
    ): RedirectResponse {
        $assets = $uploadProjectAssets->handle($project, $request->file('files', []));
        $uploadedCount = $assets->count();

        $assets->each(function (ProjectAsset $asset) use ($dispatcher): void {
            $job = new AnalyzeProjectAssetJob($asset->id);

            if (app()->runningUnitTests()) {
                $job->onConnection('sync');
            }

            $dispatcher->dispatch($job);
        });

        Inertia::flash([
            'toast' => [
                'type' => 'success',
                'message' => trans_choice(
                    '{1} :count image uploaded and queued for analysis.|[2,*] :count images uploaded and queued for analysis.',
                    $uploadedCount,
                    ['count' => $uploadedCount],
                ),
            ],
            'uploaded_asset_ids' => $assets->pluck('id')->all(),
        ]);

        return to_route('projects.show', $project);
    }

    public function update(
        UpdateProjectAssetRequest $request,
        Project $project,
        ProjectAsset $asset,
    ): RedirectResponse {
        $this->authorize('update', $project);
        abort_unless($asset->project_id === $project->id, 404);

        $validated = $request->validated();
        $asset->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => filled($validated['title'] ?? null)
                ? __('Saved title: :title', ['title' => $validated['title']])
                : __('Asset title cleared.'),
        ]);

        return to_route('projects.show', $project);
    }

    public function destroy(
        Project $project,
        ProjectAsset $asset,
        DeleteProjectAssetAction $deleteProjectAsset,
    ): RedirectResponse {
        $this->authorize('update', $project);
        abort_unless($asset->project_id === $project->id, 404);

        $assetLabel = $asset->title ?: $asset->filename;
        $deleteProjectAsset->handle($project, $asset);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Deleted image: :asset', ['asset' => $assetLabel]),
        ]);

        return to_route('projects.show', $project);
    }
}
