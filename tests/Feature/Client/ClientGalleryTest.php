<?php

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectAsset;
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
        'filename' => 'client-proof.jpg',
        'path' => 'projects/'.$project->id.'/client-proof.jpg',
    ]);

    $this->post(route('client-galleries.access.store', $share->token), [
        'password' => 'secret-pass',
    ])->assertRedirect(route('client-galleries.show', $share->token));

    $this->get(route('client-galleries.show', $share->token))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/client')
            ->where('access.requires_password', false)
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
