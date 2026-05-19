<?php

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectAssetAnalysis;
use App\Models\ProjectShare;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('client gallery prompts for a password before showing protected content', function () {
    $project = Project::factory()->create([
        'status' => ProjectStatus::Published,
        'visibility' => ProjectVisibility::Client,
        'published_at' => now(),
    ]);

    $share = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
        'password' => bcrypt('secret-pass'),
    ]);

    $this->get(route('client-galleries.show', $share->token))
        ->assertOk()
        ->assertSee('meta name="csrf-token"', false)
        ->assertInertia(fn ($page) => $page
            ->component('projects/client')
            ->where('access.requires_password', true)
            ->where('gallery.assets', [])
        );
});

test('client can unlock a gallery and mark favorite images', function () {
    $project = Project::factory()->create([
        'status' => ProjectStatus::Published,
        'visibility' => ProjectVisibility::Client,
        'published_at' => now(),
    ]);

    $share = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
        'password' => bcrypt('secret-pass'),
    ]);

    $asset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Client proof hero',
        'filename' => 'client-proof.jpg',
        'path' => 'projects/'.$project->id.'/client-proof.jpg',
    ]);

    $project->update([
        'cover_asset_id' => $asset->id,
    ]);

    $this->post(route('client-galleries.access.store', $share->token), [
        'password' => 'secret-pass',
    ])->assertRedirect(route('client-galleries.show', $share->token));

    $this->get(route('client-galleries.show', $share->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/client')
            ->where('access.requires_password', false)
            ->where('gallery.cover_image_url', asset('storage/'.$asset->path))
            ->where('gallery.assets.0.title', 'Client proof hero')
            ->where('gallery.assets.0.filename', 'client-proof.jpg')
        );

    $this->post(route('client-galleries.favorites.toggle', $share->token), [
        'asset_id' => $asset->id,
        'is_favorite' => true,
    ])->assertOk();

    $this->assertDatabaseHas('client_selections', [
        'project_share_id' => $share->id,
        'project_asset_id' => $asset->id,
        'is_favorite' => true,
    ]);
});

test('client can approve a shortlist with a project note', function () {
    $project = Project::factory()->create([
        'status' => ProjectStatus::Published,
        'visibility' => ProjectVisibility::Client,
        'published_at' => now(),
    ]);

    $share = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
        'password' => bcrypt('secret-pass'),
    ]);

    $asset = ProjectAsset::factory()->for($project)->create();

    $this->post(route('client-galleries.access.store', $share->token), [
        'password' => 'secret-pass',
    ])->assertRedirect(route('client-galleries.show', $share->token));

    $this->post(route('client-galleries.favorites.toggle', $share->token), [
        'asset_id' => $asset->id,
        'is_favorite' => true,
    ])->assertOk();

    $this->post(route('client-galleries.review.store', $share->token), [
        'reviewer_name' => 'Anna Client',
        'reviewer_comment' => 'These are the strongest frames for the final delivery.',
    ])->assertRedirect(route('client-galleries.show', $share->token));

    $this->assertDatabaseHas('project_shares', [
        'id' => $share->id,
        'reviewer_name' => 'Anna Client',
        'reviewer_comment' => 'These are the strongest frames for the final delivery.',
    ]);

    expect($share->fresh()->approved_at)->not->toBeNull();

    $this->get(route('client-galleries.show', $share->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/client')
            ->where('gallery.review.reviewer_name', 'Anna Client')
            ->where(
                'gallery.review.reviewer_comment',
                'These are the strongest frames for the final delivery.',
            )
            ->where('gallery.review.approved_at', fn (?string $value) => filled($value))
        );
});

test('client gallery uses a fallback cover image when the project has uploaded assets but no explicit cover', function () {
    $project = Project::factory()->create([
        'status' => ProjectStatus::Published,
        'visibility' => ProjectVisibility::Client,
        'published_at' => now(),
        'cover_asset_id' => null,
    ]);

    $share = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
        'password' => bcrypt('secret-pass'),
    ]);

    ProjectAsset::factory()->for($project)->create([
        'path' => 'projects/'.$project->id.'/supporting-frame.jpg',
        'sort_order' => 1,
    ]);

    $highlightAsset = ProjectAsset::factory()->for($project)->create([
        'path' => 'projects/'.$project->id.'/highlight-frame.jpg',
        'sort_order' => 2,
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $highlightAsset->id,
        'tags' => ['hero'],
        'alt_text' => 'Highlight frame for client gallery cover.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'critique' => 'Strong client-facing opener.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->post(route('client-galleries.access.store', $share->token), [
        'password' => 'secret-pass',
    ])->assertRedirect(route('client-galleries.show', $share->token));

    $this->get(route('client-galleries.show', $share->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/client')
            ->where(
                'gallery.cover_image_url',
                asset('storage/'.$highlightAsset->path),
            )
        );
});
