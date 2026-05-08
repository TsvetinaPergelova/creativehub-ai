<?php

namespace App\Jobs\Ai;

use App\Actions\Ai\AnalyzeProjectAssetAction;
use App\Actions\Ai\GenerateProjectHighlightsAction;
use App\Models\ProjectAsset;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AnalyzeProjectAssetJob implements ShouldQueue
{
    use Queueable;

    /**
     * Determine the number of times the job may be attempted.
     */
    public function tries(): int
    {
        return 5;
    }

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $projectAssetId,
    ) {}

    /**
     * Calculate the number of seconds to wait before retrying the job.
     *
     * @return list<int>
     */
    public function backoff(): array
    {
        return [60, 180, 600, 1800];
    }

    /**
     * Execute the job.
     */
    public function handle(
        AnalyzeProjectAssetAction $analyzeProjectAsset,
        GenerateProjectHighlightsAction $generateProjectHighlights,
    ): void {
        $asset = ProjectAsset::query()
            ->with('project')
            ->findOrFail($this->projectAssetId);

        $analyzeProjectAsset->handle($asset);
        $generateProjectHighlights->handle($asset->project);
    }
}
