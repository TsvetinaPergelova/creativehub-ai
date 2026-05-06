<?php

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('public profile shows only published public projects for a creator', function () {
    $user = User::factory()->create([
        'name' => 'Elena Petrova',
    ]);

    $visibleProject = Project::factory()->for($user)->create([
        'name' => 'Spring Wedding',
        'status' => ProjectStatus::Published,
        'visibility' => ProjectVisibility::Public,
        'published_at' => now(),
    ]);

    ProjectAsset::factory()->for($visibleProject)->create([
        'path' => 'projects/'.$visibleProject->id.'/cover.jpg',
        'filename' => 'cover.jpg',
    ]);

    Project::factory()->for($user)->create([
        'name' => 'Private Draft',
        'status' => ProjectStatus::Draft,
        'visibility' => ProjectVisibility::Private,
        'published_at' => null,
    ]);

    $this->get(route('portfolio.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/profile')
            ->where('creator.name', 'Elena Petrova')
            ->where('projects.0.name', 'Spring Wedding')
            ->missing('projects.1')
        );
});

test('public project page resolves a published public project by slug', function () {
    $user = User::factory()->create([
        'name' => 'Mila Stoyanova',
    ]);

    $project = Project::factory()->for($user)->create([
        'name' => 'Editorial Light Study',
        'status' => ProjectStatus::Published,
        'visibility' => ProjectVisibility::Public,
        'published_at' => now(),
    ]);

    $asset = ProjectAsset::factory()->for($project)->create([
        'filename' => 'editorial-1.jpg',
        'path' => 'projects/'.$project->id.'/editorial-1.jpg',
    ]);

    $this->get(route('portfolio.project.show', [$user, $project]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/project')
            ->where('creator.name', 'Mila Stoyanova')
            ->where('project.name', 'Editorial Light Study')
            ->where('project.assets.0.filename', $asset->filename)
        );
});

test('explore shows published public projects', function () {
    $project = Project::factory()->published()->create([
        'name' => 'Mountain Storytelling',
        'visibility' => ProjectVisibility::Public,
    ]);

    $this->get(route('explore.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->where('projects.0.slug', $project->slug)
            ->where('projects.0.name', 'Mountain Storytelling')
        );
});
