<?php

namespace App\Http\Controllers\Projects;

use App\Actions\Projects\CreateProjectAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Requests\Projects\UpdateProjectRequest;
use App\Models\Project;
use App\Models\ProjectAsset;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('projects/index', [
            'projects' => auth()->user()
                ->projects()
                ->with('coverAsset')
                ->withCount('assets')
                ->latest()
                ->get()
                ->map(fn (Project $project) => $this->mapProjectSummary($project)),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('projects/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreProjectRequest $request,
        CreateProjectAction $createProject,
    ): RedirectResponse {
        $project = $createProject->handle($request->user(), $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project created.'),
        ]);

        return to_route('projects.show', $project);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load(['assets.analysis', 'shares', 'coverAsset']);
        $highlights = $project->assets
            ->filter(fn (ProjectAsset $asset) => $asset->analysis?->is_highlight)
            ->sortBy('sort_order')
            ->values();
        $publicShare = $project->shares->firstWhere('type', 'public');
        $clientShare = $project->shares->firstWhere('type', 'client');
        $reviewedAssetCount = $project->assets->filter(
            fn (ProjectAsset $asset) => $asset->analysis !== null,
        )->count();
        $pendingAssetCount = $project->assets->filter(
            fn (ProjectAsset $asset) => $asset->analysis === null,
        )->count();
        $hasPendingAnalysis = $pendingAssetCount > 0;

        return Inertia::render('projects/show', [
            'recentlyUploadedAssetIds' => Inertia::getFlashed(request())['uploaded_asset_ids'] ?? [],
            'curator' => [
                'assistant_name' => 'Curator',
                'summary' => $hasPendingAnalysis
                    ? sprintf(
                        'Curator is reviewing the latest uploads for "%s". New insights will appear here automatically.',
                        $project->name,
                    )
                    : sprintf(
                        'Curator finished reviewing "%s". %d highlight suggestions are ready.',
                        $project->name,
                        $highlights->count(),
                    ),
            ],
            'processing' => $this->mapProcessing(
                $project,
                $reviewedAssetCount,
                $pendingAssetCount,
            ),
            'sharePanel' => [
                'visibility' => $project->visibility->value,
                'public_url' => $publicShare
                    ? route('portfolio.project.show', [$project->user, $project])
                    : null,
                'client_url' => $clientShare
                    ? url('/galleries/'.$clientShare->token)
                    : null,
            ],
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'category' => $project->category,
                'description' => $project->description,
                'status' => $project->status->value,
                'visibility' => $project->visibility->value,
                'cover_asset_id' => $project->cover_asset_id,
                'cover_image_url' => $project->coverAsset
                    ? asset('storage/'.$project->coverAsset->path)
                    : null,
                'created_at' => $project->created_at?->toISOString(),
                'published_at' => $project->published_at?->toISOString(),
                'assets' => $project->assets
                    ->sortBy('sort_order')
                    ->values()
                    ->map(fn (ProjectAsset $asset) => $this->mapAsset($asset, $project->cover_asset_id)),
            ],
            'highlights' => $highlights
                ->map(fn (ProjectAsset $asset) => $this->mapAsset($asset, $project->cover_asset_id))
                ->values(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('projects/create', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'category' => $project->category,
                'description' => $project->description,
                'status' => $project->status->value,
                'visibility' => $project->visibility->value,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdateProjectRequest $request,
        Project $project,
    ): RedirectResponse {
        $project->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project updated.'),
        ]);

        return to_route('projects.show', $project);
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProcessing(
        Project $project,
        int $reviewedAssetCount,
        int $pendingAssetCount,
    ): array {
        $pendingAssets = $project->assets
            ->filter(fn (ProjectAsset $asset) => $asset->analysis === null)
            ->sortByDesc(fn (ProjectAsset $asset) => $asset->created_at?->getTimestamp() ?? 0)
            ->values();
        $currentAsset = $pendingAssets->first();
        $currentAssetLabel = $currentAsset
            ? $this->assetDisplayLabel($currentAsset)
            : null;
        $coveragePercent = $project->assets->isEmpty()
            ? 0
            : (int) round(($reviewedAssetCount / $project->assets->count()) * 100);

        if ($pendingAssetCount === 0) {
            return [
                'is_reviewing' => false,
                'headline' => 'Curator has finished the current review',
                'description' => 'Everything uploaded so far has been analyzed and synced into the workspace.',
                'expectation' => 'Upload another image whenever you are ready to kick off a fresh review cycle.',
                'current_asset_label' => null,
                'pending_asset_labels' => [],
                'reviewed_count' => $reviewedAssetCount,
                'pending_count' => 0,
                'total_count' => $project->assets->count(),
                'coverage_percent' => $coveragePercent,
            ];
        }

        return [
            'is_reviewing' => true,
            'headline' => $pendingAssetCount === 1
                ? 'Curator is reviewing your latest image'
                : 'Curator is reviewing the latest uploads',
            'description' => $currentAssetLabel
                ? sprintf(
                    'Currently looking at "%s". New notes and highlights will appear here as soon as the review finishes.',
                    $currentAssetLabel,
                )
                : 'Curator is still working through the latest uploads. New notes and highlights will appear here as soon as the review finishes.',
            'expectation' => 'Most uploads finish in under a minute. If this takes longer, Gemini may be busy and we will keep retrying automatically.',
            'current_asset_label' => $currentAssetLabel,
            'pending_asset_labels' => $pendingAssets
                ->take(3)
                ->map(fn (ProjectAsset $asset) => $this->assetDisplayLabel($asset))
                ->values()
                ->all(),
            'reviewed_count' => $reviewedAssetCount,
            'pending_count' => $pendingAssetCount,
            'total_count' => $project->assets->count(),
            'coverage_percent' => $coveragePercent,
        ];
    }

    private function assetDisplayLabel(ProjectAsset $asset): string
    {
        return $asset->title ?: $asset->filename;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapAsset(ProjectAsset $asset, ?int $coverAssetId = null): array
    {
        return [
            'id' => $asset->id,
            'filename' => $asset->filename,
            'title' => $asset->title,
            'path' => $asset->path,
            'url' => asset('storage/'.$asset->path),
            'mime_type' => $asset->mime_type,
            'size' => $asset->size,
            'width' => $asset->width,
            'height' => $asset->height,
            'sort_order' => $asset->sort_order,
            'is_cover' => $coverAssetId === $asset->id,
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
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapProjectSummary(Project $project): array
    {
        return [
            'id' => $project->id,
            'name' => $project->name,
            'slug' => $project->slug,
            'category' => $project->category,
            'description' => $project->description,
            'status' => $project->status->value,
            'visibility' => $project->visibility->value,
            'cover_asset_id' => $project->cover_asset_id,
            'cover_image_url' => $project->coverAsset
                ? asset('storage/'.$project->coverAsset->path)
                : null,
            'asset_count' => $project->assets_count ?? null,
            'created_at' => $project->created_at?->toISOString(),
            'published_at' => $project->published_at?->toISOString(),
        ];
    }
}
