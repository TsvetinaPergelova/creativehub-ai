<?php

namespace App\Http\Controllers;

use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PublicProfileController extends Controller
{
    public function __invoke(User $user): Response
    {
        $projects = $user->projects()
            ->with(['coverAsset', 'assets.analysis'])
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

        return Inertia::render('public/profile', [
            'creator' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatarUrl(),
                'specialization' => $user->specialization,
                'location' => $user->location,
                'bio' => $user->bio,
                'website_url' => $user->website_url,
                'instagram_url' => $user->instagram_url,
                'contact_email' => $user->contact_email,
                'profile_cover_style' => $user->profile_cover_style?->value,
                'profile_url' => route('portfolio.show', $user),
            ],
            'projects' => $projects->map(function (Project $project) use ($user): array {
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
                    'creator_id' => $user->id,
                    'cover_image_url' => $displayCoverAsset
                        ? asset('storage/'.$displayCoverAsset->path)
                        : null,
                    'public_url' => route('portfolio.project.show', [$user, $project]),
                    'creator_name' => $user->name,
                    'creator_profile_url' => route('portfolio.show', $user),
                    'is_saved_by_auth_user' => (bool) ($project->is_saved_by_auth_user ?? false),
                ];
            })->values(),
        ]);
    }
}
