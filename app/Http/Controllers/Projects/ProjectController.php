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
                ->latest()
                ->get()
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'category' => $project->category,
                    'description' => $project->description,
                    'status' => $project->status->value,
                    'visibility' => $project->visibility->value,
                    'created_at' => $project->created_at?->toISOString(),
                    'published_at' => $project->published_at?->toISOString(),
                ]),
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

        $project->load(['assets.analysis', 'shares']);
        $highlights = $project->assets
            ->filter(fn (ProjectAsset $asset) => $asset->analysis?->is_highlight)
            ->sortBy('sort_order')
            ->values();
        $publicShare = $project->shares->firstWhere('type', 'public');
        $clientShare = $project->shares->firstWhere('type', 'client');

        return Inertia::render('projects/show', [
            'curator' => [
                'assistant_name' => 'Curator',
                'summary' => sprintf(
                    'Hey, анализирах снимките ти. Имаш %d силни кадъра в акцентите за проекта "%s".',
                    $highlights->count(),
                    $project->name,
                ),
            ],
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
                'created_at' => $project->created_at?->toISOString(),
                'published_at' => $project->published_at?->toISOString(),
                'assets' => $project->assets
                    ->sortBy('sort_order')
                    ->values()
                    ->map(fn (ProjectAsset $asset) => $this->mapAsset($asset)),
            ],
            'highlights' => $highlights
                ->map(fn (ProjectAsset $asset) => $this->mapAsset($asset))
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
    private function mapAsset(ProjectAsset $asset): array
    {
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
        ];
    }
}
