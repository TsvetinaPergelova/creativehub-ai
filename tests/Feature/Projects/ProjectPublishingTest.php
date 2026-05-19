<?php

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\ClientSelection;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectShare;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a creator can publish a project and receive share links', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'status' => ProjectStatus::Draft,
        'visibility' => ProjectVisibility::Private,
        'published_at' => null,
    ]);

    $this->actingAs($user)
        ->post(route('projects.publish.store', $project), [
            'visibility' => ProjectVisibility::Public->value,
        ])
        ->assertRedirect(route('projects.show', $project));

    $project->refresh();

    expect($project->status)->toBe(ProjectStatus::Published)
        ->and($project->visibility)->toBe(ProjectVisibility::Public)
        ->and($project->published_at)->not->toBeNull();

    $this->assertDatabaseCount('project_shares', 2);
    $this->assertDatabaseHas('project_shares', [
        'project_id' => $project->id,
        'type' => 'public',
    ]);
    $this->assertDatabaseHas('project_shares', [
        'project_id' => $project->id,
        'type' => 'client',
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('sharePanel.visibility', ProjectVisibility::Public->value)
            ->where('sharePanel.public_url', route('portfolio.project.show', [$user, $project]))
            ->where('sharePanel.client_url', fn (?string $url) => filled($url))
        );
});

test('a creator can publish a project for client-only visibility', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('projects.publish.store', $project), [
            'visibility' => ProjectVisibility::Client->value,
        ])
        ->assertRedirect(route('projects.show', $project));

    $project->refresh();

    expect($project->status)->toBe(ProjectStatus::Published)
        ->and($project->visibility)->toBe(ProjectVisibility::Client);
});

test('a creator cannot publish another creators project', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->post(route('projects.publish.store', $project), [
            'visibility' => ProjectVisibility::Public->value,
        ])
        ->assertForbidden();
});

test('project workspace shows client approval details when a shortlist is approved', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->published()->create([
        'visibility' => ProjectVisibility::Client,
    ]);
    $asset = ProjectAsset::factory()->for($project)->create();
    $share = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
        'reviewer_name' => 'Maya Client',
        'reviewer_comment' => 'Please keep this final shortlist for the delivery.',
        'approved_at' => now(),
    ]);

    ClientSelection::query()->create([
        'project_share_id' => $share->id,
        'project_asset_id' => $asset->id,
        'session_id' => 'approved-shortlist-session',
        'is_favorite' => true,
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('sharePanel.client_review.reviewer_name', 'Maya Client')
            ->where(
                'sharePanel.client_review.reviewer_comment',
                'Please keep this final shortlist for the delivery.',
            )
            ->where('sharePanel.client_review.favorites_count', 1)
            ->where('sharePanel.client_review.approved_at', fn (?string $value) => filled($value))
        );
});
