<?php

namespace App\Jobs\Ai;

use App\Actions\Ai\AnalyzeProjectAssetAction;
use App\Models\ProjectAsset;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AnalyzeProjectAssetJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $projectAssetId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AnalyzeProjectAssetAction $analyzeProjectAsset): void
    {
        $asset = ProjectAsset::query()
            ->with('project')
            ->findOrFail($this->projectAssetId);

        $analyzeProjectAsset->handle($asset);
    }
}
