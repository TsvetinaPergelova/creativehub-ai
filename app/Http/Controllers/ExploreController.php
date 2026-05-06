<?php

namespace App\Http\Controllers;

use App\Enums\ProjectVisibility;
use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __invoke(): Response
    {
        $projects = Project::query()
            ->with(['user', 'coverAsset', 'assets'])
            ->published()
            ->where('visibility', ProjectVisibility::Public)
            ->latest('published_at')
            ->get();

        return Inertia::render('explore/index', [
            'projects' => $projects->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'category' => $project->category,
                'description' => $project->description,
                'status' => $project->status->value,
                'visibility' => $project->visibility->value,
                'published_at' => $project->published_at?->toISOString(),
                'cover_image_url' => $project->coverAsset
                    ? asset('storage/'.$project->coverAsset->path)
                    : ($project->assets->first()
                        ? asset('storage/'.$project->assets->first()->path)
                        : null),
                'public_url' => route('portfolio.project.show', [$project->user, $project]),
                'creator_name' => $project->user->name,
                'creator_profile_url' => route('portfolio.show', $project->user),
            ])->values(),
        ]);
    }
}
