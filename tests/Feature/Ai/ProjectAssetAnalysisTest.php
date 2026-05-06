<?php

use App\Ai\Agents\AnalyzeProjectAssetAgent;
use App\Jobs\Ai\AnalyzeProjectAssetJob;
use App\Jobs\Ai\RefreshProjectHighlightsJob;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Prompts\AgentPrompt;

uses(RefreshDatabase::class);

test('uploading project assets dispatches ai analysis jobs', function () {
    Queue::fake();
    Storage::fake('public');

    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    $this->actingAs($user)->post(route('projects.assets.store', $project), [
        'files' => [
            UploadedFile::fake()->image('hero.jpg', 2400, 1600),
            UploadedFile::fake()->image('detail.jpg', 2400, 1600),
        ],
    ])->assertRedirect(route('projects.show', $project));

    Queue::assertPushed(AnalyzeProjectAssetJob::class, 2);
    Queue::assertPushed(RefreshProjectHighlightsJob::class);
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

    AnalyzeProjectAssetAgent::assertPrompted(
        fn (AgentPrompt $prompt) => str($prompt->prompt)->contains('analysis-source.jpg')
    );
});
