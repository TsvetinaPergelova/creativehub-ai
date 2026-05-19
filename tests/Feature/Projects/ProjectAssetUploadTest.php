<?php

use App\Ai\Agents\AnalyzeProjectAssetAgent;
use App\Models\ClientSelection;
use App\Models\Project;
use App\Models\ProjectAsset;
use App\Models\ProjectAssetAnalysis;
use App\Models\ProjectShare;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('an authenticated creator can upload images to a project', function () {
    $this->withoutDefer();
    Storage::fake('public');

    AnalyzeProjectAssetAgent::fake([
        [
            'tags' => ['hero', 'ui'],
            'alt_text' => 'A hero frame for the project.',
            'composition_score' => 8,
            'focus_score' => 8,
            'lighting_score' => 8,
            'critique' => 'Balanced composition.',
            'mood' => 'minimalist',
            'is_highlight' => true,
            'is_near_duplicate' => false,
        ],
        [
            'tags' => ['detail', 'ux'],
            'alt_text' => 'A detail frame for the project.',
            'composition_score' => 7,
            'focus_score' => 8,
            'lighting_score' => 7,
            'critique' => 'Useful supporting frame.',
            'mood' => 'warm',
            'is_highlight' => false,
            'is_near_duplicate' => false,
        ],
    ])->preventStrayPrompts();

    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    $response = $this
        ->actingAs($user)
        ->post(route('projects.assets.store', $project), [
            'files' => [
                UploadedFile::fake()->image('frame-1.jpg', 2400, 1600),
                UploadedFile::fake()->image('frame-2.jpg', 2400, 1600),
            ],
        ]);

    $response
        ->assertRedirect(route('projects.show', $project))
        ->assertInertiaFlashMissing('toast');

    expect($project->fresh()->assets)->toHaveCount(2);
    expect(ProjectAssetAnalysis::query()->whereIn(
        'project_asset_id',
        $project->assets()->pluck('id')
    )->count())->toBe(2);

    Storage::disk('public')->assertCount('projects/'.$project->id, 2);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->has('recentlyUploadedAssetIds', 2)
            ->where('project.assets.0.title', null)
            ->where('processing.is_reviewing', false)
            ->where('processing.pending_count', 0)
        );
});

test('an authenticated creator can view ai analysis insights on the project page', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Sunset Portrait Session',
    ]);

    $asset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Sunset hero frame',
        'filename' => 'portrait.jpg',
        'path' => 'projects/'.$project->id.'/portrait.jpg',
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $asset->id,
        'tags' => ['portrait', 'warm', 'sunset'],
        'alt_text' => 'Portrait during sunset with warm golden light.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'critique' => 'Strong composition with flattering natural light.',
        'mood' => 'warm',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('project.assets.0.title', 'Sunset hero frame')
            ->where('project.assets.0.analysis.alt_text', 'Portrait during sunset with warm golden light.')
            ->where('highlights.0.filename', 'portrait.jpg')
            ->where('curator.assistant_name', 'Curator')
        );
});

test('the project page exposes a human-friendly processing snapshot while review is pending', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Launch Campaign',
    ]);

    $reviewedAsset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Approved hero frame',
        'filename' => 'hero.jpg',
        'path' => 'projects/'.$project->id.'/hero.jpg',
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $reviewedAsset->id,
        'tags' => ['hero', 'campaign'],
        'alt_text' => 'Approved hero frame.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'critique' => 'Strong cover image.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    ProjectAsset::factory()->for($project)->create([
        'title' => 'Banknote concept',
        'filename' => 'banknote.jpg',
        'path' => 'projects/'.$project->id.'/banknote.jpg',
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('processing.is_reviewing', true)
            ->where('processing.current_asset_label', 'Banknote concept')
            ->where('processing.pending_asset_labels.0', 'Banknote concept')
            ->where('processing.pending_count', 1)
            ->where('processing.reviewed_count', 1)
            ->where('processing.total_count', 2)
            ->where('processing.coverage_percent', 50)
            ->where('processing.headline', 'Curator is reviewing your latest image')
            ->where(
                'processing.expectation',
                'Most uploads finish in under a minute. If this takes longer, Gemini may be busy and we will keep retrying automatically.',
            )
        );
});

test('the project page exposes sharing and curator summary data for the mobile workflow sections', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Mobile Workflow Review',
    ]);

    $asset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Hero detail frame',
        'filename' => 'mobile-workflow-review-hero-detail-frame.jpg',
        'path' => 'projects/'.$project->id.'/mobile-workflow-review-hero-detail-frame.jpg',
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $asset->id,
        'tags' => ['detail', 'mobile', 'workflow'],
        'alt_text' => 'Detailed frame used for mobile workflow review coverage.',
        'composition_score' => 8,
        'focus_score' => 8,
        'lighting_score' => 7,
        'critique' => 'Useful supporting frame for the mobile workflow sections.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $publicShare = ProjectShare::factory()->for($project)->create([
        'type' => 'public',
    ]);

    $clientShare = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('curator.assistant_name', 'Curator')
            ->where(
                'curator.summary',
                'Curator finished reviewing "Mobile Workflow Review". 1 highlight suggestions are ready.',
            )
            ->where('sharePanel.visibility', $project->visibility->value)
            ->where('sharePanel.public_url', route('portfolio.project.show', [$project->user, $project]))
            ->where('sharePanel.client_url', url('/galleries/'.$clientShare->token))
            ->where('project.assets.0.title', 'Hero detail frame')
            ->where('highlights.0.filename', 'mobile-workflow-review-hero-detail-frame.jpg')
            ->where('processing.is_reviewing', false)
            ->where('processing.coverage_percent', 100)
        );

    expect($publicShare->type)->toBe('public');
});

test('the project page exposes rich asset detail payload for the mobile image viewer modal', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    $asset = ProjectAsset::factory()->for($project)->create([
        'title' => null,
        'filename' => 'very-long-mobile-viewer-frame-reference-file.jpg',
        'path' => 'projects/'.$project->id.'/very-long-mobile-viewer-frame-reference-file.jpg',
        'size' => 87040,
        'width' => 2015,
        'height' => 2048,
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $asset->id,
        'tags' => ['uml', 'class diagram', 'software engineering'],
        'alt_text' => 'UML class diagram prepared for mobile modal review.',
        'composition_score' => 7,
        'focus_score' => 8,
        'lighting_score' => 6,
        'critique' => 'Dense technical frame that benefits from a larger mobile preview.',
        'mood' => 'minimalist',
        'is_highlight' => false,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('project.assets.0.title', null)
            ->where('project.assets.0.filename', 'very-long-mobile-viewer-frame-reference-file.jpg')
            ->where('project.assets.0.width', 2015)
            ->where('project.assets.0.height', 2048)
            ->where('project.assets.0.size', 87040)
            ->where('project.assets.0.analysis.alt_text', 'UML class diagram prepared for mobile modal review.')
            ->where('project.assets.0.analysis.tags.0', 'uml')
            ->where('project.assets.0.analysis.tags.1', 'class diagram')
            ->where('project.assets.0.analysis.tags.2', 'software engineering')
        );
});

test('the project page exposes the data needed by the compact mobile workspace panels', function () {
    Storage::fake('public');
    Bus::fake();

    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Mobile Workspace Panels',
    ]);

    $highlightAsset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Approved mobile hero',
        'filename' => 'approved-mobile-hero.jpg',
        'path' => 'projects/'.$project->id.'/approved-mobile-hero.jpg',
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $highlightAsset->id,
        'tags' => ['hero', 'mobile'],
        'alt_text' => 'Approved mobile hero frame.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 8,
        'critique' => 'Strong reviewed frame for the compact mobile results panel.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $clientShare = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
    ]);

    $uploadResponse = $this
        ->actingAs($user)
        ->post(route('projects.assets.store', $project), [
            'files' => [
                UploadedFile::fake()->image('recent-upload-to-name.jpg', 1800, 1200),
            ],
        ]);

    $uploadResponse->assertRedirect(route('projects.show', $project));

    $recentUpload = $project->fresh()
        ->assets()
        ->where('filename', 'recent-upload-to-name.jpg')
        ->firstOrFail();

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->has('recentlyUploadedAssetIds', 1)
            ->where('recentlyUploadedAssetIds.0', $recentUpload->id)
            ->where('project.assets.0.title', 'Approved mobile hero')
            ->where('project.assets.1.title', null)
            ->where('project.assets.1.filename', 'recent-upload-to-name.jpg')
            ->where('sharePanel.client_url', url('/galleries/'.$clientShare->token))
            ->where('highlights.0.filename', 'approved-mobile-hero.jpg')
            ->where('curator.summary', 'Curator is reviewing the latest uploads for "Mobile Workspace Panels". New insights will appear here automatically.')
            ->where('processing.is_reviewing', true)
            ->where('processing.current_asset_label', 'recent-upload-to-name.jpg')
            ->where('processing.pending_count', 1)
        );

    Storage::disk('public')->assertExists($recentUpload->path);
});

test('an authenticated creator can update an asset title', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $asset = ProjectAsset::factory()->for($project)->create([
        'title' => null,
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('projects.assets.update', [$project, $asset]), [
            'title' => 'Homepage concept',
        ]);

    $response->assertRedirect(route('projects.show', $project));

    expect($asset->fresh()->title)->toBe('Homepage concept');
});

test('an authenticated creator can set a project cover from an existing asset', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $asset = ProjectAsset::factory()->for($project)->create([
        'path' => 'projects/'.$project->id.'/cover-frame.jpg',
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('projects.cover.update', $project), [
            'cover_asset_id' => $asset->id,
        ]);

    $response->assertRedirect(route('projects.show', $project));

    expect($project->fresh()->cover_asset_id)->toBe($asset->id);
});

test('an authenticated creator can delete a project asset and clear related state', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $asset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Hero frame',
        'path' => 'projects/'.$project->id.'/hero-frame.jpg',
        'disk' => 'public',
    ]);

    Storage::disk('public')->put($asset->path, 'image-bytes');

    $project->update([
        'cover_asset_id' => $asset->id,
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $asset->id,
        'tags' => ['hero'],
        'alt_text' => 'Hero frame',
        'composition_score' => 9,
        'focus_score' => 9,
        'lighting_score' => 9,
        'critique' => 'Strong hero frame.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $share = ProjectShare::factory()->for($project)->create([
        'type' => 'client',
    ]);

    ClientSelection::query()->create([
        'project_share_id' => $share->id,
        'project_asset_id' => $asset->id,
        'session_id' => 'test-session',
        'is_favorite' => true,
    ]);

    $response = $this
        ->actingAs($user)
        ->delete(route('projects.assets.destroy', [$project, $asset]));

    $response->assertRedirect(route('projects.show', $project));

    expect($project->fresh()->cover_asset_id)->toBeNull();
    expect(ProjectAsset::query()->whereKey($asset->id)->exists())->toBeFalse();
    expect(ProjectAssetAnalysis::query()->where('project_asset_id', $asset->id)->exists())->toBeFalse();
    expect(ClientSelection::query()->where('project_asset_id', $asset->id)->exists())->toBeFalse();

    Storage::disk('public')->assertMissing($asset->path);
});

test('the project page exposes the selected cover image and cover asset state', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Cover Story',
    ]);
    $coverAsset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Hero frame',
        'path' => 'projects/'.$project->id.'/hero-frame.jpg',
    ]);
    $secondaryAsset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Detail frame',
        'path' => 'projects/'.$project->id.'/detail-frame.jpg',
    ]);

    $project->update([
        'cover_asset_id' => $coverAsset->id,
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('project.name', 'Cover Story')
            ->where('project.cover_asset_id', $coverAsset->id)
            ->where('project.has_explicit_cover', true)
            ->where('project.cover_image_url', asset('storage/'.$coverAsset->path))
            ->where('project.assets.0.is_cover', true)
            ->where('project.assets.1.is_cover', false)
            ->where('project.assets.0.title', 'Hero frame')
            ->where('project.assets.1.title', 'Detail frame')
        );
});

test('the project page uses a smart fallback hero image when uploaded assets exist without an explicit cover', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create([
        'name' => 'Fallback Hero Story',
        'cover_asset_id' => null,
    ]);

    ProjectAsset::factory()->for($project)->create([
        'title' => 'Supporting frame',
        'path' => 'projects/'.$project->id.'/supporting-frame.jpg',
        'sort_order' => 1,
    ]);

    $highlightAsset = ProjectAsset::factory()->for($project)->create([
        'title' => 'Highlight frame',
        'path' => 'projects/'.$project->id.'/highlight-frame.jpg',
        'sort_order' => 2,
    ]);

    ProjectAssetAnalysis::query()->create([
        'project_asset_id' => $highlightAsset->id,
        'tags' => ['hero', 'portrait'],
        'alt_text' => 'Highlight frame selected as a fallback hero image.',
        'composition_score' => 9,
        'focus_score' => 8,
        'lighting_score' => 9,
        'critique' => 'Strong fallback hero candidate.',
        'mood' => 'minimalist',
        'is_highlight' => true,
        'is_near_duplicate' => false,
        'meta' => [],
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('project.name', 'Fallback Hero Story')
            ->where('project.cover_asset_id', null)
            ->where('project.has_explicit_cover', false)
            ->where(
                'project.cover_image_url',
                asset('storage/'.$highlightAsset->path),
            )
        );
});

test('a creator cannot upload images to another creators project', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->post(route('projects.assets.store', $project), [
            'files' => [
                UploadedFile::fake()->image('intrusion.jpg', 2400, 1600),
            ],
        ])
        ->assertForbidden();
});

test('a creator cannot set a project cover from another projects asset', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();
    $otherProject = Project::factory()->for($user)->create();
    $foreignAsset = ProjectAsset::factory()->for($otherProject)->create();

    $this->actingAs($user)
        ->patch(route('projects.cover.update', $project), [
            'cover_asset_id' => $foreignAsset->id,
        ])
        ->assertInvalid(['cover_asset_id']);
});

test('a creator cannot delete another creators asset', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();
    $asset = ProjectAsset::factory()->for($project)->create();

    $this->actingAs($intruder)
        ->delete(route('projects.assets.destroy', [$project, $asset]))
        ->assertForbidden();
});

test('a creator cannot update another creators asset title', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();
    $asset = ProjectAsset::factory()->for($project)->create();

    $this->actingAs($intruder)
        ->patch(route('projects.assets.update', [$project, $asset]), [
            'title' => 'Do not allow',
        ])
        ->assertForbidden();
});
