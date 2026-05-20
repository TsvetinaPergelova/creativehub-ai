<?php

use App\Enums\ProjectMode;
use App\Enums\ProjectStatus;
use App\Http\Controllers\ClientGalleryController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\Projects\ProjectAssetController;
use App\Http\Controllers\Projects\ProjectBriefAssistantController;
use App\Http\Controllers\Projects\ProjectController;
use App\Http\Controllers\Projects\ProjectCoverController;
use App\Http\Controllers\Projects\ProjectPublishController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\PublicProjectCommentController;
use App\Http\Controllers\PublicProjectController;
use App\Http\Controllers\PublicProjectSaveController;
use App\Models\Project;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = request()->user();

        $projects = $user->projects()
            ->with(['coverAsset', 'assets.analysis'])
            ->withCount([
                'assets',
                'assets as analyzed_assets_count' => fn ($query) => $query->has('analysis'),
                'assets as pending_assets_count' => fn ($query) => $query->doesntHave('analysis'),
                'assets as unnamed_assets_count' => fn ($query) => $query->whereNull('title'),
            ])
            ->latest('updated_at')
            ->get([
                'id',
                'name',
                'slug',
                'category',
                'mode',
                'description',
                'status',
                'visibility',
                'cover_asset_id',
                'created_at',
                'updated_at',
                'published_at',
            ]);

        $mapProject = function (Project $project): array {
            $displayCoverAsset = $project->resolveDisplayCoverAsset();

            return [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'category' => $project->category,
                'mode' => $project->mode->value,
                'description' => $project->description,
                'status' => $project->status->value,
                'visibility' => $project->visibility->value,
                'cover_asset_id' => $project->cover_asset_id,
                'cover_image_url' => $displayCoverAsset
                    ? asset('storage/'.$displayCoverAsset->path)
                    : null,
                'asset_count' => $project->assets_count,
                'created_at' => $project->created_at?->toISOString(),
                'published_at' => $project->published_at?->toISOString(),
            ];
        };

        $draftCountsByCategory = $projects
            ->filter(fn (Project $project) => $project->status === ProjectStatus::Draft)
            ->countBy(fn (Project $project) => $project->category);
        $publishedCountsByCategory = $projects
            ->filter(fn (Project $project) => $project->status === ProjectStatus::Published)
            ->countBy(fn (Project $project) => $project->category);
        $adviceCategory = $draftCountsByCategory
            ->sortDesc()
            ->keys()
            ->first();

        $readyLabel = fn (ProjectMode $mode): string => match ($mode) {
            ProjectMode::Photography => 'Ready to publish',
            ProjectMode::DesignCaseStudy => 'Ready as a case study',
            ProjectMode::ArtSeries => 'Ready as a series',
            ProjectMode::MixedExperimental => 'Ready to publish',
        };
        $draftLabel = fn (ProjectMode $mode): string => match ($mode) {
            ProjectMode::Photography => 'Draft set',
            ProjectMode::DesignCaseStudy => 'Draft case study',
            ProjectMode::ArtSeries => 'Draft series',
            ProjectMode::MixedExperimental => 'Draft',
        };
        $publishActionLabel = fn (ProjectMode $mode): string => match ($mode) {
            ProjectMode::Photography => 'Publish set',
            ProjectMode::DesignCaseStudy => 'Publish case study',
            ProjectMode::ArtSeries => 'Publish series',
            ProjectMode::MixedExperimental => 'Publish project',
        };
        $projectModeSummary = fn (ProjectMode $mode): string => match ($mode) {
            ProjectMode::Photography => 'selection strength and consistency',
            ProjectMode::DesignCaseStudy => 'a clear hero and supporting story',
            ProjectMode::ArtSeries => 'cohesion, title, and concept framing',
            ProjectMode::MixedExperimental => 'a balanced, neutral workflow',
        };

        $projectInsights = $projects
            ->map(function (Project $project) use (
                $mapProject,
                $draftLabel,
                $projectModeSummary,
                $publishActionLabel,
                $readyLabel,
            ): array {
                $mode = $project->mode;
                $isInReview = $project->pending_assets_count > 0;
                $isReadyToPublish = $project->status === ProjectStatus::Draft
                    && $project->cover_asset_id !== null
                    && $project->analyzed_assets_count >= $mode->readyAnalyzedAssetThreshold()
                    && $project->pending_assets_count === 0
                    && (! $mode->requiresDescriptionForReadiness() || filled($project->description));
                $needsCover = $project->cover_asset_id === null && $project->assets_count > 0;
                $hasUnnamedUploads = $project->unnamed_assets_count > 0;
                $modeProjectLabel = $mode->dashboardProjectLabel();

                if ($isInReview) {
                    $dashboardStatus = 'In review';
                    $dashboardTone = 'review';
                    $dashboardActionLabel = 'Continue review';
                    $dashboardActionNote = sprintf(
                        '%d upload%s still waiting on Curator.',
                        $project->pending_assets_count,
                        $project->pending_assets_count === 1 ? '' : 's',
                    );
                    $priority = 500;
                    $actionType = 'review';
                } elseif ($isReadyToPublish) {
                    $dashboardStatus = $readyLabel($mode);
                    $dashboardTone = 'ready';
                    $dashboardActionLabel = $publishActionLabel($mode);
                    $dashboardActionNote = sprintf(
                        '%d analyzed asset%s, a cover, and the right structure for this %s are already in place.',
                        $project->analyzed_assets_count,
                        $project->analyzed_assets_count === 1 ? '' : 's',
                        $modeProjectLabel,
                    );
                    $priority = 400;
                    $actionType = 'publish';
                } elseif ($hasUnnamedUploads) {
                    $dashboardStatus = 'Needs titles';
                    $dashboardTone = 'naming';
                    $dashboardActionLabel = 'Name uploads';
                    $dashboardActionNote = sprintf(
                        '%d upload%s still use the original filename.',
                        $project->unnamed_assets_count,
                        $project->unnamed_assets_count === 1 ? '' : 's',
                    );
                    $priority = 200;
                    $actionType = 'naming';
                } elseif ($project->status === ProjectStatus::Draft) {
                    $dashboardStatus = $draftLabel($mode);
                    $dashboardTone = 'draft';
                    $dashboardActionLabel = $mode === ProjectMode::DesignCaseStudy
                        ? 'Open case study'
                        : ($mode === ProjectMode::ArtSeries ? 'Open series' : 'Open draft');
                    $dashboardActionNote = match ($mode) {
                        ProjectMode::Photography => $needsCover
                            ? 'Curator is using one of the uploaded frames as a preview for now. Open the project to refine the set and lock in a cover when you want.'
                            : 'Keep shaping this set until the selects and sequence feel tight enough to publish.',
                        ProjectMode::DesignCaseStudy => $needsCover
                            ? 'The case study already has a smart preview from your uploads. Open it to refine the narrative and choose a hero when you want tighter control.'
                            : 'Keep sharpening the narrative and supporting frames until the case study reads clearly.',
                        ProjectMode::ArtSeries => $needsCover
                            ? 'A smart preview is carrying the series for now. Open it to refine the statement and lock in a dedicated cover when the tone feels right.'
                            : 'Keep refining the statement and sequence so the series feels intentional.',
                        ProjectMode::MixedExperimental => 'Keep shaping this collection and move it closer to publishing.',
                    };
                    $priority = 100;
                    $actionType = 'draft';
                } else {
                    $dashboardStatus = 'Published';
                    $dashboardTone = 'published';
                    $dashboardActionLabel = 'Open project';
                    $dashboardActionNote = 'Live on your portfolio and ready for another refinement pass whenever you want.';
                    $priority = 50;
                    $actionType = 'published';
                }

                return [
                    ...$mapProject($project),
                    'pending_assets_count' => $project->pending_assets_count,
                    'analyzed_assets_count' => $project->analyzed_assets_count,
                    'unnamed_assets_count' => $project->unnamed_assets_count,
                    'dashboard_status' => $dashboardStatus,
                    'dashboard_tone' => $dashboardTone,
                    'dashboard_action_label' => $dashboardActionLabel,
                    'dashboard_action_note' => $dashboardActionNote,
                    'dashboard_action_type' => $actionType,
                    'dashboard_priority' => $priority,
                    'dashboard_mode_label' => $mode->label(),
                    'dashboard_mode_summary' => $projectModeSummary($mode),
                ];
            })
            ->sortByDesc('dashboard_priority')
            ->values();

        $projectsInReview = $projectInsights->filter(
            fn (array $project) => $project['dashboard_action_type'] === 'review',
        )->values();
        $projectsReadyToPublish = $projectInsights->filter(
            fn (array $project) => $project['dashboard_action_type'] === 'publish',
        )->values();
        $projectsNeedingTitles = $projectInsights->filter(
            fn (array $project) => $project['dashboard_action_type'] === 'naming',
        )->values();
        $draftProjects = $projectInsights->filter(
            fn (array $project) => $project['status'] === ProjectStatus::Draft->value,
        )->values();
        $publishedProjects = $projectInsights->filter(
            fn (array $project) => $project['status'] === ProjectStatus::Published->value,
        )->values();

        $primaryProject = $projectInsights->first();

        if ($primaryProject === null) {
            $primaryAction = [
                'eyebrow' => 'Next best action',
                'title' => 'Start your first project',
                'description' => 'Create a project, upload a few strong frames, and let Curator begin shaping the set with you.',
                'cta_label' => 'Create project',
                'target' => 'create',
                'project_id' => null,
            ];
        } elseif ($primaryProject['dashboard_action_type'] === 'review') {
            $primaryAction = [
                'eyebrow' => 'Next best action',
                'title' => 'Check back on fresh Curator analysis',
                'description' => sprintf(
                    '"%s" still has %d upload%s in review. Jump back in as soon as the notes land and keep the set moving.',
                    $primaryProject['name'],
                    $primaryProject['pending_assets_count'],
                    $primaryProject['pending_assets_count'] === 1 ? '' : 's',
                ),
                'cta_label' => 'Open review workspace',
                'target' => 'project',
                'project_id' => $primaryProject['id'],
            ];
        } elseif ($primaryProject['dashboard_action_type'] === 'publish') {
            $primaryAction = [
                'eyebrow' => 'Next best action',
                'title' => match ($primaryProject['mode']) {
                    ProjectMode::Photography->value => 'Publish your next photography set',
                    ProjectMode::DesignCaseStudy->value => 'Publish your next case study',
                    ProjectMode::ArtSeries->value => 'Publish your next art series',
                    default => 'Publish your next strong project',
                },
                'description' => sprintf(
                    '"%s" already has a cover and enough analyzed work to go live in its chosen format. Shipping it now would strengthen your public portfolio immediately.',
                    $primaryProject['name'],
                ),
                'cta_label' => 'Open publish-ready project',
                'target' => 'project',
                'project_id' => $primaryProject['id'],
            ];
        } elseif ($primaryProject['dashboard_action_type'] === 'naming') {
            $primaryAction = [
                'eyebrow' => 'Next best action',
                'title' => 'Give your latest uploads clear titles',
                'description' => sprintf(
                    '"%s" still has uploads using the original filenames. Naming them now will make the library easier to scan later.',
                    $primaryProject['name'],
                ),
                'cta_label' => 'Open naming flow',
                'target' => 'project',
                'project_id' => $primaryProject['id'],
            ];
        } else {
            $primaryAction = [
                'eyebrow' => 'Next best action',
                'title' => 'Continue your latest draft',
                'description' => sprintf(
                    '"%s" is the best place to keep momentum right now. Open it and keep shaping the set.',
                    $primaryProject['name'],
                ),
                'cta_label' => 'Open project',
                'target' => 'project',
                'project_id' => $primaryProject['id'],
            ];
        }

        $makeAssistantRecommendation = function (
            string $eyebrow,
            string $title,
            string $reason,
            string $ctaLabel,
            string $target,
            ?int $projectId = null,
            string $tone = 'strategy',
        ): array {
            return [
                'eyebrow' => $eyebrow,
                'title' => $title,
                'reason' => $reason,
                'cta_label' => $ctaLabel,
                'target' => $target,
                'project_id' => $projectId,
                'tone' => $tone,
            ];
        };

        $attentionItems = [
            [
                'label' => 'In review',
                'count' => $projectsInReview->count(),
                'hint' => $projectsInReview->isNotEmpty()
                    ? 'Projects with fresh uploads still waiting on Curator.'
                    : 'No projects are waiting on Curator right now.',
                'cta_label' => $projectsInReview->isNotEmpty() ? 'Open next review' : 'Upload more work',
                'target' => $projectsInReview->isNotEmpty() ? 'project' : 'projects',
                'project_id' => $projectsInReview->first()['id'] ?? null,
            ],
            [
                'label' => 'Ready',
                'count' => $projectsReadyToPublish->count(),
                'hint' => $projectsReadyToPublish->isNotEmpty()
                    ? 'Drafts that already look strong enough to publish.'
                    : 'Nothing is fully publish-ready yet.',
                'cta_label' => $projectsReadyToPublish->isNotEmpty() ? 'Open publish-ready project' : 'Review drafts',
                'target' => $projectsReadyToPublish->isNotEmpty() ? 'project' : 'projects',
                'project_id' => $projectsReadyToPublish->first()['id'] ?? null,
            ],
            [
                'label' => 'Need titles',
                'count' => $projectsNeedingTitles->count(),
                'hint' => $projectsNeedingTitles->isNotEmpty()
                    ? 'Uploads that still use their original filenames.'
                    : 'Recent uploads already have clean names, or can wait.',
                'cta_label' => $projectsNeedingTitles->isNotEmpty() ? 'Open naming flow' : 'Open library',
                'target' => $projectsNeedingTitles->isNotEmpty() ? 'project' : 'projects',
                'project_id' => $projectsNeedingTitles->first()['id'] ?? null,
            ],
        ];

        if ($projectsReadyToPublish->isNotEmpty()) {
            $assistantPrimary = $makeAssistantRecommendation(
                'Best move now',
                sprintf('Publish "%s" next', $projectsReadyToPublish->first()['name']),
                sprintf(
                    'It already has a cover, enough analyzed work, and the right shape for a %s.',
                    match ($projectsReadyToPublish->first()['mode']) {
                        ProjectMode::Photography->value => 'photography set',
                        ProjectMode::DesignCaseStudy->value => 'case study',
                        ProjectMode::ArtSeries->value => 'series',
                        default => 'project',
                    },
                ),
                'Open publish-ready project',
                'project',
                $projectsReadyToPublish->first()['id'],
                'ready',
            );
            $assistantSummary = 'The fastest momentum gain is usually shipping a strong project that already looks finished.';
        } elseif ($projectsInReview->isNotEmpty()) {
            $assistantPrimary = $makeAssistantRecommendation(
                'Best move now',
                sprintf('Watch "%s" for fresh notes', $projectsInReview->first()['name']),
                'Curator is still working through the latest uploads, so that project is closest to your next real decision point.',
                'Open review workspace',
                'project',
                $projectsInReview->first()['id'],
                'review',
            );
            $assistantSummary = 'When analysis is about to land, the best use of attention is staying close to the project that will change soonest.';
        } elseif ($projectsNeedingTitles->isNotEmpty()) {
            $assistantPrimary = $makeAssistantRecommendation(
                'Best move now',
                sprintf('Name the latest uploads in "%s"', $projectsNeedingTitles->first()['name']),
                'Clear titles make the library easier to scan later and make feedback loops much less noisy.',
                'Open naming flow',
                'project',
                $projectsNeedingTitles->first()['id'],
                'naming',
            );
            $assistantSummary = 'Small cleanup tasks are worth doing once the main review pressure is gone, because they compound across the whole library.';
        } elseif ($adviceCategory) {
            $assistantPrimary = $makeAssistantRecommendation(
                'Best move now',
                sprintf('Deepen your %s story', $adviceCategory),
                (($publishedCountsByCategory[$adviceCategory] ?? 0) > 0)
                    ? 'You already have public traction there, so one more polished project would strengthen that signal.'
                    : 'You already have draft momentum there, so publishing one project would make that strength visible.',
                'Review matching projects',
                'projects',
                null,
                'strategy',
            );
            $assistantSummary = 'Once the day-to-day workflow is calm, the next best move is usually shaping a clearer portfolio narrative.';
        } else {
            $assistantPrimary = $makeAssistantRecommendation(
                'Best move now',
                'Start a focused new project',
                'A small but clear project gives Curator enough material to generate useful feedback and momentum quickly.',
                'Create project',
                'create',
                null,
                'strategy',
            );
            $assistantSummary = 'The assistant is most useful once there is a real set to react to, so the first project is the highest-leverage step.';
        }

        $assistantFollowUps = collect([
            $projectsInReview->isNotEmpty() && $assistantPrimary['tone'] !== 'review'
                ? $makeAssistantRecommendation(
                    'Also worth doing',
                    sprintf('Keep "%s" in view', $projectsInReview->first()['name']),
                    sprintf(
                        '%d upload%s are still under review there.',
                        $projectsInReview->first()['pending_assets_count'],
                        $projectsInReview->first()['pending_assets_count'] === 1 ? '' : 's',
                    ),
                    'Open review',
                    'project',
                    $projectsInReview->first()['id'],
                    'review',
                )
                : null,
            $projectsNeedingTitles->isNotEmpty() && $assistantPrimary['tone'] !== 'naming'
                ? $makeAssistantRecommendation(
                    'Also worth doing',
                    sprintf('Clean up titles in "%s"', $projectsNeedingTitles->first()['name']),
                    sprintf(
                        '%d upload%s still use the original filename.',
                        $projectsNeedingTitles->first()['unnamed_assets_count'],
                        $projectsNeedingTitles->first()['unnamed_assets_count'] === 1 ? '' : 's',
                    ),
                    'Name uploads',
                    'project',
                    $projectsNeedingTitles->first()['id'],
                    'naming',
                )
                : null,
            $projectsReadyToPublish->isNotEmpty() && $assistantPrimary['tone'] !== 'ready'
                ? $makeAssistantRecommendation(
                    'Also worth doing',
                    sprintf('Ship "%s" when ready', $projectsReadyToPublish->first()['name']),
                    'It already looks close enough to public-ready that publishing would be a meaningful win.',
                    'Open project',
                    'project',
                    $projectsReadyToPublish->first()['id'],
                    'ready',
                )
                : null,
        ])->filter()->take(2)->values()->all();

        if ($projectsReadyToPublish->isNotEmpty()) {
            $adviceTitle = 'Curator recommends';
            $adviceMessage = sprintf(
                'You have %d project%s that already satisfy the chosen project mode. Shipping one now would strengthen your public portfolio immediately.',
                $projectsReadyToPublish->count(),
                $projectsReadyToPublish->count() === 1 ? '' : 's',
            );
        } elseif ($projectsInReview->isNotEmpty()) {
            $adviceTitle = 'Curator recommends';
            $adviceMessage = sprintf(
                'Keep an eye on "%s". New upload analysis should land soon, and that project is your clearest next decision point.',
                $projectsInReview->first()['name'],
            );
        } elseif ($adviceCategory) {
            $adviceTitle = 'Curator recommends';
            $adviceMessage = (($publishedCountsByCategory[$adviceCategory] ?? 0) > 0)
                ? sprintf(
                    'You already have traction in %s. One more published project there would deepen that story.',
                    $adviceCategory,
                )
                : sprintf(
                    'You have strong draft momentum in %s. Publish one project there to round out your public portfolio.',
                    $adviceCategory,
                );
        } else {
            $adviceTitle = 'Curator recommends';
            $adviceMessage = 'Create or publish one focused project to start building a clearer public signal for your portfolio.';
        }

        return Inertia::render('dashboard', [
            'primaryAction' => $primaryAction,
            'stats' => [
                [
                    'label' => 'Drafts',
                    'value' => $draftProjects->count(),
                    'hint' => 'Projects still being shaped',
                ],
                [
                    'label' => 'Published',
                    'value' => $publishedProjects->count(),
                    'hint' => 'Visible on your public portfolio',
                ],
                [
                    'label' => 'In review',
                    'value' => $projectsInReview->count(),
                    'hint' => 'Projects currently waiting on Curator',
                ],
                [
                    'label' => 'Ready',
                    'value' => $projectsReadyToPublish->count(),
                    'hint' => 'Strong drafts that can likely go live next',
                ],
            ],
            'attentionItems' => $attentionItems,
            'workflowProjects' => $projectInsights
                ->take(3)
                ->values()
                ->all(),
            'assistantPanel' => [
                'title' => 'Curator recommends',
                'summary' => $assistantSummary,
                'primary' => $assistantPrimary,
                'follow_ups' => $assistantFollowUps,
            ],
            'portfolioAdvice' => [
                'title' => $adviceTitle,
                'message' => $adviceMessage,
            ],
        ]);
    })->name('dashboard');

    Route::resource('projects', ProjectController::class)->except(['destroy']);
    Route::post('projects/assistant/brief', [ProjectBriefAssistantController::class, 'store'])
        ->name('projects.assistant.store');
    Route::post('projects/{project}/assets', [ProjectAssetController::class, 'store'])
        ->name('projects.assets.store');
    Route::patch('projects/{project}/assets/{asset}', [ProjectAssetController::class, 'update'])
        ->name('projects.assets.update');
    Route::delete('projects/{project}/assets/{asset}', [ProjectAssetController::class, 'destroy'])
        ->name('projects.assets.destroy');
    Route::patch('projects/{project}/cover', [ProjectCoverController::class, 'update'])
        ->name('projects.cover.update');
    Route::post('projects/{project}/publish', [ProjectPublishController::class, 'store'])
        ->name('projects.publish.store');
});

Route::get('/portfolio/{user}', PublicProfileController::class)
    ->name('portfolio.show');
Route::get('/portfolio/{user}/{project:slug}', PublicProjectController::class)
    ->name('portfolio.project.show');
Route::get('/explore', ExploreController::class)
    ->name('explore.index');
Route::middleware('auth')->group(function () {
    Route::post('/portfolio/{user}/{project:slug}/save', [PublicProjectSaveController::class, 'store'])
        ->name('portfolio.project.save.store');
    Route::delete('/portfolio/{user}/{project:slug}/save', [PublicProjectSaveController::class, 'destroy'])
        ->name('portfolio.project.save.destroy');
    Route::post('/portfolio/{user}/{project:slug}/comments', [PublicProjectCommentController::class, 'store'])
        ->name('portfolio.project.comments.store');
});
Route::get('/galleries/{share:token}', [ClientGalleryController::class, 'show'])
    ->name('client-galleries.show');
Route::post('/galleries/{share:token}/access', [ClientGalleryController::class, 'storeAccess'])
    ->name('client-galleries.access.store');
Route::post('/galleries/{share:token}/favorites', [ClientGalleryController::class, 'toggleFavorite'])
    ->name('client-galleries.favorites.toggle');
Route::post('/galleries/{share:token}/review', [ClientGalleryController::class, 'submitReview'])
    ->name('client-galleries.review.store');

require __DIR__.'/settings.php';
