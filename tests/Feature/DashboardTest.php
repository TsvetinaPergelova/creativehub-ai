<?php

use App\Enums\ProjectMode;
use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectAssetAnalysis;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('workspace.portfolio_url', route('portfolio.show', $user))
            ->has('primaryAction')
            ->has('attentionItems', 3)
            ->has('assistantPanel.primary')
            ->has('workflowProjects')
        );
});

test('dashboard assistant guidance reflects the strongest portfolio direction', function () {
    $user = User::factory()->create();

    Project::factory()->for($user)->create([
        'category' => 'Weddings',
        'mode' => ProjectMode::Photography,
        'status' => ProjectStatus::Draft,
        'visibility' => ProjectVisibility::Private,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('assistantPanel.title', 'Curator recommends')
            ->where('assistantPanel.primary.title', 'Deepen your Weddings story')
            ->where('assistantPanel.primary.target', 'projects')
            ->where('assistantPanel.summary', fn (string $message) => str($message)->contains('portfolio narrative'))
        );
});

test('dashboard recent projects include cover images when a project cover is selected', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Cover Ready Project',
    ]);
    $asset = ProjectAsset::factory()->for($project)->create([
        'path' => 'projects/'.$project->id.'/cover-ready.jpg',
    ]);
    $project->update([
        'cover_asset_id' => $asset->id,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('workflowProjects.0.name', 'Cover Ready Project')
            ->where('workflowProjects.0.cover_image_url', asset('storage/'.$asset->path))
        );
});

test('dashboard recent projects use a highlight asset as fallback cover when no explicit cover is selected', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Fallback Cover Dashboard Project',
        'cover_asset_id' => null,
    ]);

    ProjectAsset::factory()->for($project)->create([
        'path' => 'projects/'.$project->id.'/supporting-frame.jpg',
        'sort_order' => 1,
    ]);

    $highlightAsset = ProjectAsset::factory()->for($project)->create([
        'path' => 'projects/'.$project->id.'/highlight-frame.jpg',
        'sort_order' => 2,
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $highlightAsset->id,
        'tags' => ['hero'],
        'alt_text' => 'Highlight frame for dashboard fallback cover.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'critique' => 'Strong hero frame.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('workflowProjects.0.name', 'Fallback Cover Dashboard Project')
            ->where('workflowProjects.0.cover_asset_id', null)
            ->where(
                'workflowProjects.0.cover_image_url',
                asset('storage/'.$highlightAsset->path),
            )
        );
});

test('dashboard does not treat missing explicit covers as a primary blocker when assets already exist', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Preview-led Draft',
        'category' => 'Portraits',
        'mode' => ProjectMode::Photography,
        'status' => ProjectStatus::Draft,
        'cover_asset_id' => null,
        'description' => 'A portrait project still being shaped.',
    ]);

    $fallbackAsset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Preview frame',
        'path' => 'projects/'.$project->id.'/preview-led-draft.jpg',
        'sort_order' => 1,
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $fallbackAsset->id,
        'tags' => ['portrait'],
        'alt_text' => 'Preview-led draft frame.',
        'composition_score' => 8,
        'focus_score' => 8,
        'lighting_score' => 8,
        'critique' => 'Strong draft frame.',
        'mood' => 'warm',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('workflowProjects.0.name', 'Preview-led Draft')
            ->where('workflowProjects.0.dashboard_status', 'Draft set')
            ->where('workflowProjects.0.dashboard_action_label', 'Open draft')
            ->where(
                'workflowProjects.0.dashboard_action_note',
                'Curator is using one of the uploaded frames as a preview for now. Open the project to refine the set and lock in a cover when you want.',
            )
            ->where('assistantPanel.primary.title', 'Deepen your Portraits story')
        );
});

test('dashboard prioritizes the next best action and workflow projects', function () {
    $user = User::factory()->create();

    $reviewProject = Project::factory()->for($user)->create([
        'name' => 'Campaign Review Queue',
        'mode' => ProjectMode::Photography,
        'status' => ProjectStatus::Draft,
        'visibility' => ProjectVisibility::Private,
    ]);
    ProjectAsset::factory()->for($reviewProject)->create([
        'title' => null,
        'filename' => 'review-queue.jpg',
        'path' => 'projects/'.$reviewProject->id.'/review-queue.jpg',
    ]);

    $readyProject = Project::factory()->for($user)->create([
        'name' => 'Launch Ready Portfolio',
        'mode' => ProjectMode::DesignCaseStudy,
        'status' => ProjectStatus::Draft,
        'visibility' => ProjectVisibility::Private,
        'description' => 'A concise walkthrough of the launch identity system.',
    ]);
    $coverAsset = ProjectAsset::factory()->for($readyProject)->create([
        'title' => 'Hero frame',
        'path' => 'projects/'.$readyProject->id.'/hero-frame.jpg',
        'sort_order' => 1,
    ]);
    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $coverAsset->id,
        'tags' => ['hero'],
        'alt_text' => 'Hero frame',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 8,
        'critique' => 'Strong hero frame.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);
    $detailAsset = ProjectAsset::factory()->for($readyProject)->create([
        'title' => 'Detail frame',
        'path' => 'projects/'.$readyProject->id.'/detail-frame.jpg',
        'sort_order' => 2,
    ]);
    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $detailAsset->id,
        'tags' => ['detail'],
        'alt_text' => 'Detail frame',
        'composition_score' => 8,
        'focus_score' => 8,
        'lighting_score' => 8,
        'critique' => 'Useful supporting frame.',
        'mood' => 'warm',
        'is_highlight' => false,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);
    $supportingAsset = ProjectAsset::factory()->for($readyProject)->create([
        'title' => 'Supporting frame',
        'path' => 'projects/'.$readyProject->id.'/supporting-frame.jpg',
        'sort_order' => 3,
    ]);
    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $supportingAsset->id,
        'tags' => ['support'],
        'alt_text' => 'Supporting frame',
        'composition_score' => 8,
        'focus_score' => 7,
        'lighting_score' => 8,
        'critique' => 'Supports the set well.',
        'mood' => 'minimalist',
        'is_highlight' => false,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);
    $readyProject->update([
        'cover_asset_id' => $coverAsset->id,
    ]);

    Project::factory()->for($user)->create([
        'name' => 'Naming Backlog',
        'mode' => ProjectMode::MixedExperimental,
        'status' => ProjectStatus::Draft,
        'visibility' => ProjectVisibility::Private,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('workflowProjects', 3)
            ->where('primaryAction.title', 'Check back on fresh Curator analysis')
            ->where('primaryAction.project_id', $reviewProject->id)
            ->where('assistantPanel.primary.title', 'Publish "Launch Ready Portfolio" next')
            ->where('assistantPanel.primary.target', 'project')
            ->where('assistantPanel.primary.project_id', $readyProject->id)
            ->where('assistantPanel.follow_ups.0.title', 'Keep "Campaign Review Queue" in view')
            ->where('stats.0.label', 'Drafts')
            ->where('stats.0.value', 3)
            ->where('stats.2.label', 'In review')
            ->where('stats.2.value', 1)
            ->where('stats.3.label', 'Ready')
            ->where('stats.3.value', 1)
            ->where('attentionItems.0.label', 'In review')
            ->where('attentionItems.0.count', 1)
            ->where('attentionItems.1.label', 'Ready')
            ->where('attentionItems.1.count', 1)
            ->where('workflowProjects.0.name', 'Campaign Review Queue')
            ->where('workflowProjects.0.dashboard_status', 'In review')
            ->where('workflowProjects.1.name', 'Launch Ready Portfolio')
            ->where('workflowProjects.1.dashboard_status', 'Ready as a case study')
            ->where('workflowProjects.2.name', 'Naming Backlog')
        );
});

test('dashboard readiness rules change with the selected project mode', function () {
    $user = User::factory()->create();

    $photographyProject = Project::factory()->for($user)->create([
        'name' => 'Editorial Portrait Set',
        'mode' => ProjectMode::Photography,
        'description' => 'Portrait set for a magazine feature.',
    ]);
    $photographyCover = ProjectAsset::factory()->for($photographyProject)->create([
        'title' => 'Portrait hero',
        'sort_order' => 1,
    ]);
    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $photographyCover->id,
        'tags' => ['portrait'],
        'alt_text' => 'Portrait hero',
        'composition_score' => 8,
        'focus_score' => 8,
        'lighting_score' => 8,
        'critique' => 'Strong portrait.',
        'mood' => 'warm',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);
    $photographySupport = ProjectAsset::factory()->for($photographyProject)->create([
        'title' => 'Portrait detail',
        'sort_order' => 2,
    ]);
    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $photographySupport->id,
        'tags' => ['detail'],
        'alt_text' => 'Portrait detail',
        'composition_score' => 8,
        'focus_score' => 8,
        'lighting_score' => 8,
        'critique' => 'Useful support frame.',
        'mood' => 'minimalist',
        'is_highlight' => false,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);
    $photographyProject->update([
        'cover_asset_id' => $photographyCover->id,
    ]);

    $artProject = Project::factory()->for($user)->create([
        'name' => 'Afterlight Sequence',
        'mode' => ProjectMode::ArtSeries,
        'description' => 'A short conceptual sequence about dusk and memory.',
    ]);
    $artCover = ProjectAsset::factory()->for($artProject)->create([
        'title' => 'Afterlight I',
        'sort_order' => 1,
    ]);
    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $artCover->id,
        'tags' => ['series'],
        'alt_text' => 'Afterlight I',
        'composition_score' => 8,
        'focus_score' => 7,
        'lighting_score' => 8,
        'critique' => 'Strong opener.',
        'mood' => 'moody',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);
    $artSupport = ProjectAsset::factory()->for($artProject)->create([
        'title' => 'Afterlight II',
        'sort_order' => 2,
    ]);
    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $artSupport->id,
        'tags' => ['series'],
        'alt_text' => 'Afterlight II',
        'composition_score' => 8,
        'focus_score' => 7,
        'lighting_score' => 8,
        'critique' => 'Strong second frame.',
        'mood' => 'moody',
        'is_highlight' => false,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);
    $artProject->update([
        'cover_asset_id' => $artCover->id,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('assistantPanel.primary.title', 'Publish "Afterlight Sequence" next')
            ->where('workflowProjects.0.name', 'Afterlight Sequence')
            ->where('workflowProjects.0.dashboard_status', 'Ready as a series')
            ->where('workflowProjects.1.name', 'Editorial Portrait Set')
            ->where('workflowProjects.1.dashboard_status', 'Draft set')
        );
});
