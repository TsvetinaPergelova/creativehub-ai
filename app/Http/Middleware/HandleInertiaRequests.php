<?php

namespace App\Http\Middleware;

use App\Enums\ProjectStatus;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatarUrl(),
                    'specialization' => $user->specialization,
                    'location' => $user->location,
                    'bio' => $user->bio,
                    'website_url' => $user->website_url,
                    'instagram_url' => $user->instagram_url,
                    'contact_email' => $user->contact_email,
                    'profile_cover_style' => $user->profile_cover_style?->value,
                    'email_verified_at' => $user->email_verified_at?->toISOString(),
                    'created_at' => $user->created_at?->toISOString(),
                    'updated_at' => $user->updated_at?->toISOString(),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'workspace' => $user ? [
                'portfolio_url' => route('portfolio.show', $user),
                'project_search' => fn () => $request->user()
                    ->projects()
                    ->withCount([
                        'assets as pending_assets_count' => fn ($query) => $query->doesntHave('analysis'),
                    ])
                    ->latest('updated_at')
                    ->limit(40)
                    ->get([
                        'id',
                        'name',
                        'slug',
                        'category',
                        'status',
                        'updated_at',
                    ])
                    ->map(fn ($project) => [
                        'id' => $project->id,
                        'name' => $project->name,
                        'slug' => $project->slug,
                        'category' => $project->category,
                        'status' => $project->status->value,
                        'updated_at' => $project->updated_at?->toISOString(),
                        'pending_assets_count' => $project->pending_assets_count,
                    ])
                    ->values()
                    ->all(),
                'status' => fn () => [
                    'draft_count' => $request->user()
                        ->projects()
                        ->where('status', ProjectStatus::Draft)
                        ->count(),
                    'in_review_count' => $request->user()
                        ->projects()
                        ->whereHas('assets', fn ($query) => $query->doesntHave('analysis'))
                        ->count(),
                ],
            ] : null,
        ];
    }
}
