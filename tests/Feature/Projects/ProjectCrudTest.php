<?php

use App\Enums\ProjectMode;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an authenticated creator can create a project', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('projects.store'), [
            'name' => 'Spring Wedding',
            'category' => 'Weddings',
            'mode' => ProjectMode::Photography->value,
            'description' => 'Golden hour ceremony',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'user_id' => $user->id,
        'name' => 'Spring Wedding',
        'category' => 'Weddings',
        'mode' => ProjectMode::Photography->value,
        'description' => 'Golden hour ceremony',
        'status' => 'draft',
    ]);
});

test('an authenticated creator can create a project with a custom category', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('projects.store'), [
            'name' => 'Quiet Material Study',
            'category' => 'Spatial Installation',
            'mode' => ProjectMode::ArtSeries->value,
            'description' => 'Concept sketches and final installation views.',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'user_id' => $user->id,
        'name' => 'Quiet Material Study',
        'category' => 'Spatial Installation',
        'mode' => ProjectMode::ArtSeries->value,
    ]);
});

test('an authenticated creator can update a project mode', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'mode' => ProjectMode::Photography,
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('projects.update', $project), [
            'name' => $project->name,
            'category' => $project->category,
            'mode' => ProjectMode::ArtSeries->value,
            'description' => 'Conceptual sequence for gallery review.',
        ]);

    $response->assertRedirect(route('projects.show', $project));

    expect($project->fresh()->mode)->toBe(ProjectMode::ArtSeries);
});

test('project create page includes grouped category options', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('projects.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/create')
            ->where('categoryGroups.0.label', 'Photography')
            ->where('categoryGroups.0.options.1', 'Engagements')
            ->where('categoryGroups.0.options.2', 'Baptisms')
            ->where('categoryGroups.2.label', 'Art & Editorial Photography')
            ->where('categoryGroups.2.options.0', 'Landscapes')
        );
});

test('authenticated workspace pages include quick search project data', function () {
    $user = User::factory()->create();

    Project::factory()->for($user)->create([
        'name' => 'Quiet Landscape Study',
        'category' => 'Landscapes',
        'status' => 'draft',
    ]);

    $this->actingAs($user)
        ->get(route('projects.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/create')
            ->where('workspace.status.draft_count', 1)
            ->where('workspace.status.in_review_count', 0)
            ->where('workspace.project_search.0.name', 'Quiet Landscape Study')
            ->where('workspace.project_search.0.category', 'Landscapes')
        );
});

test('an authenticated creator can view only their own projects', function () {
    $user = User::factory()->create();
    $ownProject = Project::factory()->for($user)->create([
        'name' => 'Own Project',
        'mode' => ProjectMode::MixedExperimental,
    ]);

    Project::factory()->create([
        'name' => 'Other Project',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('projects.index'));

    $response
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/index')
            ->where('projects.0.name', $ownProject->name)
            ->where('projects.0.mode', ProjectMode::MixedExperimental->value)
            ->where('projects.0.asset_count', 0)
            ->where('projects.0.cover_image_url', null)
            ->missing('projects.1')
        );
});

test('projects index serializes design case study mode values consistently', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Mobile design',
        'mode' => ProjectMode::DesignCaseStudy,
    ]);

    $this->actingAs($user)
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/index')
            ->where('projects.0.name', $project->name)
            ->where('projects.0.mode', ProjectMode::DesignCaseStudy->value)
        );
});

test('a creator cannot update another creators project', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->patch(route('projects.update', $project), [
            'name' => 'Hijacked',
            'category' => $project->category,
            'mode' => $project->mode->value,
            'description' => $project->description,
        ])
        ->assertForbidden();
});
