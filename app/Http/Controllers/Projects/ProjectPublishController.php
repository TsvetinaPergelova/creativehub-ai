<?php

namespace App\Http\Controllers\Projects;

use App\Actions\Projects\GenerateProjectShareAction;
use App\Enums\ProjectStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\PublishProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProjectPublishController extends Controller
{
    public function store(
        PublishProjectRequest $request,
        Project $project,
        GenerateProjectShareAction $generateProjectShare,
    ): RedirectResponse {
        $project->update([
            'status' => ProjectStatus::Published,
            'visibility' => $request->validated('visibility'),
            'published_at' => now(),
        ]);

        $generateProjectShare->handle($project, 'public');
        $generateProjectShare->handle($project, 'client');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project published.'),
        ]);

        return to_route('projects.show', $project);
    }
}
