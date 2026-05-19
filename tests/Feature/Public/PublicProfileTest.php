<?php

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectAssetAnalysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('public profile shows only published public projects for a creator', function () {
    $user = User::factory()->create([
        'name' => 'Elena Petrova',
        'specialization' => 'Documentary Photographer',
        'location' => 'Sofia, Bulgaria',
        'bio' => 'Visual stories centered on natural light and human connection.',
        'website_url' => 'https://elena.example',
        'instagram_url' => 'https://instagram.com/elena',
        'contact_email' => 'hello@elena.example',
        'profile_cover_style' => 'editorial',
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
            ->where('creator.specialization', 'Documentary Photographer')
            ->where('creator.location', 'Sofia, Bulgaria')
            ->where('creator.bio', 'Visual stories centered on natural light and human connection.')
            ->where('creator.website_url', 'https://elena.example')
            ->where('creator.instagram_url', 'https://instagram.com/elena')
            ->where('creator.contact_email', 'hello@elena.example')
            ->where('creator.profile_cover_style', 'editorial')
            ->where('projects.0.name', 'Spring Wedding')
            ->where('projects.0.asset_count', 1)
            ->missing('projects.1')
        );
});

test('public project page resolves a published public project by slug', function () {
    $user = User::factory()->create([
        'name' => 'Mila Stoyanova',
        'specialization' => 'Visual Designer',
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
            ->where('creator.specialization', 'Visual Designer')
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

test('public profile and explore use a highlight asset as fallback cover when no explicit cover is set', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->published()->create([
        'name' => 'Fallback Portfolio Story',
        'visibility' => ProjectVisibility::Public,
        'cover_asset_id' => null,
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
        'alt_text' => 'Highlight frame for public fallback cover.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'critique' => 'Strong visual first impression.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->get(route('portfolio.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/profile')
            ->where('projects.0.name', 'Fallback Portfolio Story')
            ->where(
                'projects.0.cover_image_url',
                asset('storage/'.$highlightAsset->path),
            )
        );

    $this->get(route('explore.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->where('projects.0.name', 'Fallback Portfolio Story')
            ->where(
                'projects.0.cover_image_url',
                asset('storage/'.$highlightAsset->path),
            )
        );
});
