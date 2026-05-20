<?php

use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectComment;
use App\Models\SavedProject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated users can save a public project from its public route', function () {
    $creator = User::factory()->create();
    $viewer = User::factory()->create();

    $project = Project::factory()->for($creator)->published()->create([
        'visibility' => ProjectVisibility::Public,
    ]);

    $this->actingAs($viewer)
        ->from(route('explore.index'))
        ->post(route('portfolio.project.save.store', [$creator, $project]))
        ->assertRedirect(route('explore.index'));

    expect(
        SavedProject::query()
            ->where('user_id', $viewer->id)
            ->where('project_id', $project->id)
            ->exists(),
    )->toBeTrue();
});

test('authenticated users can remove a saved public project', function () {
    $creator = User::factory()->create();
    $viewer = User::factory()->create();

    $project = Project::factory()->for($creator)->published()->create([
        'visibility' => ProjectVisibility::Public,
    ]);

    SavedProject::query()->create([
        'user_id' => $viewer->id,
        'project_id' => $project->id,
    ]);

    $this->actingAs($viewer)
        ->from(route('portfolio.show', $creator))
        ->delete(route('portfolio.project.save.destroy', [$creator, $project]))
        ->assertRedirect(route('portfolio.show', $creator));

    expect(
        SavedProject::query()
            ->where('user_id', $viewer->id)
            ->where('project_id', $project->id)
            ->exists(),
    )->toBeFalse();
});

test('authenticated users can add or update a public project comment', function () {
    $creator = User::factory()->create();
    $viewer = User::factory()->create([
        'name' => 'Saved Notes User',
    ]);

    $project = Project::factory()->for($creator)->published()->create([
        'visibility' => ProjectVisibility::Public,
    ]);

    $this->actingAs($viewer)
        ->from(route('portfolio.project.show', [$creator, $project]))
        ->post(route('portfolio.project.comments.store', [$creator, $project]), [
            'body' => 'The sequencing feels calm and intentional.',
        ])
        ->assertRedirect(route('portfolio.project.show', [$creator, $project]));

    $comment = ProjectComment::query()
        ->where('user_id', $viewer->id)
        ->where('project_id', $project->id)
        ->first();

    expect($comment)->not->toBeNull()
        ->and($comment?->body)->toBe('The sequencing feels calm and intentional.');

    $this->actingAs($viewer)
        ->post(route('portfolio.project.comments.store', [$creator, $project]), [
            'body' => 'Updated note after a second look.',
        ]);

    expect(
        ProjectComment::query()
            ->where('user_id', $viewer->id)
            ->where('project_id', $project->id)
            ->count(),
    )->toBe(1);
});

test('public project page exposes save state and public comments', function () {
    $creator = User::factory()->create([
        'name' => 'Milena',
    ]);
    $viewer = User::factory()->create([
        'name' => 'Anton',
    ]);

    $project = Project::factory()->for($creator)->published()->create([
        'name' => 'Editorial Motion',
        'visibility' => ProjectVisibility::Public,
    ]);

    SavedProject::query()->create([
        'user_id' => $viewer->id,
        'project_id' => $project->id,
    ]);

    ProjectComment::query()->create([
        'user_id' => $viewer->id,
        'project_id' => $project->id,
        'body' => 'Strong pacing and a clear point of view.',
    ]);

    $this->actingAs($viewer)
        ->get(route('portfolio.project.show', [$creator, $project]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/project')
            ->where('project.name', 'Editorial Motion')
            ->where('project.is_saved_by_auth_user', true)
            ->where('project.comments.0.author.name', 'Anton')
            ->where('project.comments.0.body', 'Strong pacing and a clear point of view.')
        );
});

test('explore and public profile expose save state for authenticated viewers', function () {
    $creator = User::factory()->create([
        'name' => 'Nora',
    ]);
    $viewer = User::factory()->create();

    $project = Project::factory()->for($creator)->published()->create([
        'name' => 'Portfolio Save State',
        'visibility' => ProjectVisibility::Public,
    ]);

    SavedProject::query()->create([
        'user_id' => $viewer->id,
        'project_id' => $project->id,
    ]);

    $this->actingAs($viewer)
        ->get(route('explore.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->where('projects.0.name', 'Portfolio Save State')
            ->where('projects.0.is_saved_by_auth_user', true)
        );

    $this->actingAs($viewer)
        ->get(route('portfolio.show', $creator))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/profile')
            ->where('projects.0.name', 'Portfolio Save State')
            ->where('projects.0.is_saved_by_auth_user', true)
        );
});
