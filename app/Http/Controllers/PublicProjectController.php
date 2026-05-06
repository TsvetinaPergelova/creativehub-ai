<?php

namespace App\Http\Controllers;

use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PublicProjectController extends Controller
{
    public function __invoke(User $user, Project $project): Response
    {
        $project = $user->projects()
            ->with('assets.analysis')
            ->whereKey($project->getKey())
            ->published()
            ->where('visibility', ProjectVisibility::Public)
            ->firstOrFail();

        return Inertia::render('public/project', [
            'creator' => [
                'id' => $user->id,
                'name' => $user->name,
                'profile_url' => route('portfolio.show', $user),
            ],
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'category' => $project->category,
                'description' => $project->description,
                'status' => $project->status->value,
                'visibility' => $project->visibility->value,
                'published_at' => $project->published_at?->toISOString(),
                'assets' => $project->assets
                    ->sortBy('sort_order')
                    ->values()
                    ->map(fn (ProjectAsset $asset) => [
                        'id' => $asset->id,
                        'filename' => $asset->filename,
                        'path' => $asset->path,
                        'url' => asset('storage/'.$asset->path),
                        'mime_type' => $asset->mime_type,
                        'size' => $asset->size,
                        'width' => $asset->width,
                        'height' => $asset->height,
                        'sort_order' => $asset->sort_order,
                        'analysis' => $asset->analysis ? [
                            'tags' => $asset->analysis->tags ?? [],
                            'alt_text' => $asset->analysis->alt_text,
                            'composition_score' => $asset->analysis->composition_score,
                            'focus_score' => $asset->analysis->focus_score,
                            'lighting_score' => $asset->analysis->lighting_score,
                            'critique' => $asset->analysis->critique,
                            'mood' => $asset->analysis->mood?->value ?? $asset->analysis->mood,
                            'is_highlight' => $asset->analysis->is_highlight,
                            'is_near_duplicate' => $asset->analysis->is_near_duplicate,
                        ] : null,
                    ]),
            ],
        ]);
    }
}
