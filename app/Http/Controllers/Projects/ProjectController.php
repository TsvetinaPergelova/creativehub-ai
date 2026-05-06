<?php

namespace App\Http\Controllers\Projects;

use App\Actions\Projects\CreateProjectAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Requests\Projects\UpdateProjectRequest;
use App\Models\Project;
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
        $project = $this->resolveOwnedProject($project);

        return Inertia::render('projects/show', [
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
            ],
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function edit(Project $project): Response
    {
        $project = $this->resolveOwnedProject($project);

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
        $project = $this->resolveOwnedProject($project);

        $project->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Project updated.'),
        ]);

        return to_route('projects.show', $project);
    }

    private function resolveOwnedProject(Project $project): Project
    {
        return auth()->user()
            ->projects()
            ->whereKey($project->getKey())
            ->firstOrFail();
    }
}
