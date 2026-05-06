<?php

namespace App\Actions\Projects;

use App\Models\Project;
use App\Models\ProjectShare;
use Illuminate\Support\Str;

class GenerateProjectShareAction
{
    public function handle(Project $project, string $type): ProjectShare
    {
        return $project->shares()->firstOrCreate(
            ['type' => $type],
            [
                'token' => (string) Str::uuid(),
                'password' => null,
                'expires_at' => null,
            ],
        );
    }
}
