<?php

use App\Ai\Agents\AnalyzeProjectAssetAgent;
use App\Jobs\Ai\AnalyzeProjectAssetJob;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectAssetAnalysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Prompts\AgentPrompt;

uses(RefreshDatabase::class);

test('uploading project assets dispatches ai analysis jobs', function () {
    $this->withoutDefer();
    Storage::fake('public');

    AnalyzeProjectAssetAgent::fake([
        [
            'tags' => ['hero', 'warm'],
            'alt_text' => 'Hero image analyzed by Curator.',
            'composition_score' => 9,
            'focus_score' => 8,
            'lighting_score' => 8,
            'critique' => 'Strong opening frame.',
            'mood' => 'warm',
            'is_highlight' => true,
            'is_near_duplicate' => false,
        ],
        [
            'tags' => ['detail', 'product'],
            'alt_text' => 'Detail image analyzed by Curator.',
            'composition_score' => 7,
            'focus_score' => 7,
            'lighting_score' => 8,
            'critique' => 'Useful supporting frame.',
            'mood' => 'minimalist',
            'is_highlight' => false,
            'is_near_duplicate' => false,
        ],
    ])->preventStrayPrompts();

    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    $this->actingAs($user)->post(route('projects.assets.store', $project), [
        'files' => [
            UploadedFile::fake()->image('hero.jpg', 2400, 1600),
            UploadedFile::fake()->image('detail.jpg', 2400, 1600),
        ],
    ])->assertRedirect(route('projects.show', $project));

    expect(ProjectAssetAnalysis::query()->whereIn(
        'project_asset_id',
        $project->assets()->pluck('id')
    )->count())->toBe(2);
});

test('analyze project asset job stores structured ai results', function () {
    Storage::fake('public');

    AnalyzeProjectAssetAgent::fake([
        [
            'tags' => ['portrait', 'warm', 'sunset'],
            'alt_text' => 'Portrait captured at sunset with warm tones.',
            'composition_score' => 9,
            'focus_score' => 8,
            'lighting_score' => 9,
            'critique' => 'Strong composition and flattering natural light.',
            'mood' => 'warm',
            'is_highlight' => true,
            'is_near_duplicate' => false,
        ],
    ])->preventStrayPrompts();

    $project = Project::factory()->create();
    $asset = ProjectAsset::factory()->for($project)->create([
        'path' => UploadedFile::fake()
            ->image('analysis-source.jpg', 2400, 1600)
            ->store('projects/'.$project->id, 'public'),
        'filename' => 'analysis-source.jpg',
    ]);

    app()->call([(new AnalyzeProjectAssetJob($asset->id)), 'handle']);

    $this->assertDatabaseHas('project_asset_analyses', [
        'project_asset_id' => $asset->id,
        'alt_text' => 'Portrait captured at sunset with warm tones.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'mood' => 'warm',
        'is_highlight' => true,
        'is_near_duplicate' => false,
    ]);

    expect($asset->fresh()->analysis?->is_highlight)->toBeTrue();

    AnalyzeProjectAssetAgent::assertPrompted(
        fn (AgentPrompt $prompt) => str($prompt->prompt)->contains('analysis-source.jpg')
    );
});

test('analyze project asset job retries transient ai provider overloads', function () {
    $job = new AnalyzeProjectAssetJob(123);

    expect($job->tries())
        ->toBe(5)
        ->and($job->backoff())
        ->toBe([60, 180, 600, 1800]);
});
