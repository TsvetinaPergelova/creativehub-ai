<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\ToggleFavoriteRequest;
use App\Models\ClientSelection;
use App\Models\ProjectAsset;
use App\Models\ProjectShare;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ClientGalleryController extends Controller
{
    public function show(ProjectShare $share): Response
    {
        $share = $share->load(['project.assets.analysis', 'clientSelections']);
        $hasAccess = $this->hasAccess($share);

        return Inertia::render('projects/client', [
            'access' => [
                'requires_password' => filled($share->password) && ! $hasAccess,
                'is_unlocked' => $hasAccess,
            ],
            'gallery' => [
                'token' => $share->token,
                'project_name' => $share->project->name,
                'project_description' => $share->project->description,
                'assets' => $hasAccess
                    ? $share->project->assets
                        ->sortBy('sort_order')
                        ->values()
                        ->map(function (ProjectAsset $asset) use ($share) {
                            $selection = $share->clientSelections
                                ->firstWhere('project_asset_id', $asset->id);

                            return [
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
                                'is_favorite' => $selection?->is_favorite ?? false,
                            ];
                        })
                    : [],
                'favorites_count' => $hasAccess
                    ? $share->clientSelections->where('is_favorite', true)->count()
                    : 0,
            ],
        ]);
    }

    public function storeAccess(Request $request, ProjectShare $share): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'string'],
        ]);

        abort_unless(filled($share->password), 404);

        if (! Hash::check($validated['password'], $share->password)) {
            return back()->withErrors([
                'password' => __('The password is incorrect.'),
            ]);
        }

        $request->session()->put($this->sessionKey($share), true);

        return to_route('client-galleries.show', $share->token);
    }

    public function toggleFavorite(
        ToggleFavoriteRequest $request,
        ProjectShare $share,
    ): JsonResponse {
        abort_unless($this->hasAccess($share), 403);

        $asset = $share->project
            ->assets()
            ->whereKey($request->integer('asset_id'))
            ->firstOrFail();

        $selection = ClientSelection::query()->updateOrCreate(
            [
                'project_share_id' => $share->id,
                'project_asset_id' => $asset->id,
            ],
            [
                'session_id' => $request->session()->getId(),
                'is_favorite' => $request->boolean('is_favorite'),
            ],
        );

        return response()->json([
            'favorite' => [
                'asset_id' => $selection->project_asset_id,
                'is_favorite' => $selection->is_favorite,
            ],
        ]);
    }

    private function hasAccess(ProjectShare $share): bool
    {
        return blank($share->password)
            || session($this->sessionKey($share), false) === true;
    }

    private function sessionKey(ProjectShare $share): string
    {
        return 'client_gallery_access.'.$share->id;
    }
}
