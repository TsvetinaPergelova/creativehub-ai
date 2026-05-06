<?php

namespace App\Jobs\Ai;

use App\Actions\Ai\GenerateProjectHighlightsAction;
use App\Models\Project;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RefreshProjectHighlightsJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $projectId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GenerateProjectHighlightsAction $generateProjectHighlights): void
    {
        $project = Project::query()->findOrFail($this->projectId);

        $generateProjectHighlights->handle($project);
    }
}
