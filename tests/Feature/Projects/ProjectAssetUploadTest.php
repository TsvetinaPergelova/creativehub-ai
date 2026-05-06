<?php

use App\Jobs\Ai\AnalyzeProjectAssetJob;
use App\Jobs\Ai\RefreshProjectHighlightsJob;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectAssetAnalysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('an authenticated creator can upload images to a project', function () {
    Queue::fake([
        AnalyzeProjectAssetJob::class,
        RefreshProjectHighlightsJob::class,
    ]);
    Storage::fake('public');

    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    $response = $this
        ->actingAs($user)
        ->post(route('projects.assets.store', $project), [
            'files' => [
                UploadedFile::fake()->image('frame-1.jpg', 2400, 1600),
                UploadedFile::fake()->image('frame-2.jpg', 2400, 1600),
            ],
        ]);

    $response->assertRedirect(route('projects.show', $project));

    expect($project->fresh()->assets)->toHaveCount(2);

    Storage::disk('public')->assertCount('projects/'.$project->id, 2);
});

test('an authenticated creator can view ai analysis insights on the project page', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Sunset Portrait Session',
    ]);

    $asset = ProjectAsset::factory()->for($project)->create([
        'filename' => 'portrait.jpg',
        'path' => 'projects/'.$project->id.'/portrait.jpg',
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $asset->id,
        'tags' => ['portrait', 'warm', 'sunset'],
        'alt_text' => 'Portrait during sunset with warm golden light.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'critique' => 'Strong composition with flattering natural light.',
        'mood' => 'warm',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('project.assets.0.analysis.alt_text', 'Portrait during sunset with warm golden light.')
            ->where('highlights.0.filename', 'portrait.jpg')
            ->where('curator.assistant_name', 'Curator')
        );
});

test('a creator cannot upload images to another creators project', function () {
    Queue::fake([
        AnalyzeProjectAssetJob::class,
        RefreshProjectHighlightsJob::class,
    ]);
    Storage::fake('public');

    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->post(route('projects.assets.store', $project), [
            'files' => [
                UploadedFile::fake()->image('intrusion.jpg', 2400, 1600),
            ],
        ])
        ->assertForbidden();
});
