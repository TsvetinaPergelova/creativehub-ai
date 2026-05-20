<?php

namespace App\Http\Controllers;

use App\Enums\ProjectVisibility;
use App\Http\Requests\Public\StoreProjectCommentRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class PublicProjectCommentController extends Controller
{
    public function store(
        StoreProjectCommentRequest $request,
        User $user,
        Project $project,
    ): RedirectResponse {
        $publicProject = $this->resolvePublicProject($user, $project);

        $request->user()->projectComments()->updateOrCreate(
            [
                'project_id' => $publicProject->id,
            ],
            [
                'body' => trim($request->string('body')->value()),
            ],
        );

        return back();
    }

    private function resolvePublicProject(User $user, Project $project): Project
    {
        return $user->projects()
            ->published()
            ->where('visibility', ProjectVisibility::Public)
            ->whereKey($project->getKey())
            ->firstOrFail();
    }
}
