<?php

namespace App\Http\Controllers;

use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class PublicProjectSaveController extends Controller
{
    public function store(User $user, Project $project): RedirectResponse
    {
        $publicProject = $this->resolvePublicProject($user, $project);

        request()
            ->user()
            ->savedProjectEntries()
            ->firstOrCreate([
                'project_id' => $publicProject->id,
            ]);

        return back();
    }

    public function destroy(User $user, Project $project): RedirectResponse
    {
        $publicProject = $this->resolvePublicProject($user, $project);

        request()
            ->user()
            ->savedProjectEntries()
            ->where('project_id', $publicProject->id)
            ->delete();

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
