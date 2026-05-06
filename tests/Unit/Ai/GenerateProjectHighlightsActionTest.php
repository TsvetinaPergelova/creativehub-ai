<?php

use App\Actions\Ai\GenerateProjectHighlightsAction;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectAssetAnalysis;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('generate project highlights keeps only the top five highlight flags', function () {
    $project = Project::factory()->create();

    $assets = ProjectAsset::factory()
        ->count(6)
        ->for($project)
        ->create();

    foreach ($assets as $index => $asset) {
        ProjectAssetAnalysis::query()->create([
            'project_asset_id' => $asset->id,
            'tags' => ['set-'.$index],
            'alt_text' => 'Asset '.$index,
            'composition_score' => 10 - $index,
            'focus_score' => 9 - min($index, 4),
            'lighting_score' => 8 - min($index, 3),
            'critique' => 'Critique '.$index,
            'mood' => 'warm',
            'is_highlight' => false,
            'is_near_duplicate' => false,
        ]);
    }

    app(GenerateProjectHighlightsAction::class)->handle($project);

    expect(
        ProjectAssetAnalysis::query()
            ->whereIn('project_asset_id', $assets->pluck('id'))
            ->where('is_highlight', true)
            ->count()
    )->toBe(5);
});
