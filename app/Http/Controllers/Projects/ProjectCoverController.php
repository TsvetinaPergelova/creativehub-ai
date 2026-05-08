<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\UpdateProjectCoverRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProjectCoverController extends Controller
{
    public function update(
        UpdateProjectCoverRequest $request,
        Project $project,
    ): RedirectResponse {
        $project->update([
            'cover_asset_id' => $request->validated('cover_asset_id'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $request->validated('cover_asset_id')
                ? __('Project cover updated.')
                : __('Project cover removed.'),
        ]);

        return to_route('projects.show', $project);
    }
}
