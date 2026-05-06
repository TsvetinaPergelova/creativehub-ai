<?php

namespace App\Actions\Ai;

use App\Models\Project;
use App\Models\ProjectAssetAnalysis;

class GenerateProjectHighlightsAction
{
    public function handle(Project $project): void
    {
        $project->load('assets.analysis');

        $analyses = $project->assets
            ->pluck('analysis')
            ->filter()
            ->map(function (ProjectAssetAnalysis $analysis) {
                $score = $analysis->composition_score
                    + $analysis->focus_score
                    + $analysis->lighting_score;

                if ($analysis->is_near_duplicate) {
                    $score -= 100;
                }

                return [
                    'analysis_id' => $analysis->id,
                    'score' => $score,
                ];
            })
            ->sortByDesc('score')
            ->values();

        $highlightIds = $analyses
            ->take(5)
            ->pluck('analysis_id')
            ->all();

        ProjectAssetAnalysis::query()
            ->whereIn('project_asset_id', $project->assets->pluck('id'))
            ->update(['is_highlight' => false]);

        if ($highlightIds !== []) {
            ProjectAssetAnalysis::query()
                ->whereIn('id', $highlightIds)
                ->update(['is_highlight' => true]);
        }
    }
}
