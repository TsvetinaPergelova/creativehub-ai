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
            ->with(['user', 'coverAsset', 'assets.analysis'])
            ->withCount('assets')
            ->published()
            ->where('visibility', ProjectVisibility::Public)
            ->latest('published_at');

        if (request()->user() !== null) {
            $projects->withExists([
                'savedProjects as is_saved_by_auth_user' => fn ($query) => $query->where(
                    'user_id',
                    request()->user()->id,
                ),
            ]);
        }

        $projects = $projects->get();

        return Inertia::render('explore/index', [
            'projects' => $projects->map(function (Project $project): array {
                $displayCoverAsset = $project->resolveDisplayCoverAsset();

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'category' => $project->category,
                    'description' => $project->description,
                    'status' => $project->status->value,
                    'visibility' => $project->visibility->value,
                    'published_at' => $project->published_at?->toISOString(),
                    'asset_count' => $project->assets_count,
                    'creator_id' => $project->user->id,
                    'cover_image_url' => $displayCoverAsset
                        ? asset('storage/'.$displayCoverAsset->path)
                        : null,
                    'public_url' => route('portfolio.project.show', [$project->user, $project]),
                    'creator_name' => $project->user->name,
                    'creator_profile_url' => route('portfolio.show', $project->user),
                    'is_saved_by_auth_user' => (bool) ($project->is_saved_by_auth_user ?? false),
                ];
            })->values(),
        ]);
    }
}
