<?php

use App\Actions\Projects\GenerateProjectShareAction;
use App\Models\Project;
use App\Models\ProjectShare;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it creates a stable share token per project and share type', function () {
    $project = Project::factory()->create();
    $action = app(GenerateProjectShareAction::class);

    $firstShare = $action->handle($project, 'public');
    $secondShare = $action->handle($project, 'public');
    $clientShare = $action->handle($project, 'client');

    expect($firstShare)->toBeInstanceOf(ProjectShare::class)
        ->and($firstShare->token)->toBeString()
        ->and($firstShare->token)->toBe($secondShare->token)
        ->and($clientShare->token)->not->toBe($firstShare->token);

    $this->assertDatabaseCount('project_shares', 2);
});
