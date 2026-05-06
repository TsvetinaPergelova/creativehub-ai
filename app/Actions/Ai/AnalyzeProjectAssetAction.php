<?php

namespace App\Actions\Ai;

use App\Ai\Agents\AnalyzeProjectAssetAgent;
use App\Models\ProjectAsset;
use App\Support\Ai\ProjectAssetAnalysisData;
use Laravel\Ai\Files\Image;

class AnalyzeProjectAssetAction
{
    public function handle(ProjectAsset $asset): ProjectAssetAnalysisData
    {
        $response = AnalyzeProjectAssetAgent::make()->prompt(
            prompt: sprintf(
                'Analyze the uploaded image "%s" from project "%s". Return concise portfolio-oriented feedback.',
                $asset->filename,
                $asset->project->name,
            ),
            attachments: [
                Image::fromStorage($asset->path, $asset->disk),
            ],
        );

        $analysis = ProjectAssetAnalysisData::fromArray([
            'tags' => $response['tags'],
            'alt_text' => $response['alt_text'],
            'composition_score' => $response['composition_score'],
            'focus_score' => $response['focus_score'],
            'lighting_score' => $response['lighting_score'],
            'critique' => $response['critique'],
            'mood' => $response['mood'],
            'is_highlight' => $response['is_highlight'],
            'is_near_duplicate' => $response['is_near_duplicate'],
        ]);

        $asset->analysis()->updateOrCreate([], [
            'tags' => $analysis->tags,
            'alt_text' => $analysis->altText,
            'composition_score' => $analysis->compositionScore,
            'focus_score' => $analysis->focusScore,
            'lighting_score' => $analysis->lightingScore,
            'critique' => $analysis->critique,
            'mood' => $analysis->mood,
            'is_highlight' => $analysis->isHighlight,
            'is_near_duplicate' => $analysis->isNearDuplicate,
            'meta' => [
                'analyzed_at' => now()->toISOString(),
            ],
        ]);

        return $analysis;
    }
}
