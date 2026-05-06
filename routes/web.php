<?php

use App\Http\Controllers\ClientGalleryController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\Projects\ProjectAssetController;
use App\Http\Controllers\Projects\ProjectController;
use App\Http\Controllers\Projects\ProjectPublishController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\PublicProjectController;
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
            ->latest()
            ->take(3)
            ->get(['id', 'name', 'slug', 'category', 'status', 'visibility', 'created_at']);
        $draftCountsByCategory = $user->projects()
            ->selectRaw('category, count(*) as aggregate')
            ->where('status', 'draft')
            ->groupBy('category')
            ->pluck('aggregate', 'category');
        $publishedCountsByCategory = $user->projects()
            ->selectRaw('category, count(*) as aggregate')
            ->where('status', 'published')
            ->groupBy('category')
            ->pluck('aggregate', 'category');
        $adviceCategory = $draftCountsByCategory
            ->sortDesc()
            ->keys()
            ->first();
        $adviceMessage = $adviceCategory
            ? sprintf(
                'You have strong draft momentum in %s. Publish one more project there to round out your public portfolio.',
                $adviceCategory,
            )
            : 'Publish a finished project to start training your public portfolio signal.';

        return Inertia::render('dashboard', [
            'stats' => [
                [
                    'label' => 'Projects',
                    'value' => $user->projects()->count(),
                    'hint' => 'Total active and draft collections',
                ],
                [
                    'label' => 'Published',
                    'value' => $user->projects()->where('status', 'published')->count(),
                    'hint' => 'Visible on your public portfolio',
                ],
                [
                    'label' => 'Categories',
                    'value' => $user->projects()->distinct('category')->count('category'),
                    'hint' => 'Unique creative areas in your library',
                ],
            ],
            'recentProjects' => $projects,
            'portfolioAdvice' => [
                'title' => 'AI Portfolio Advice',
                'message' => $adviceCategory && (($publishedCountsByCategory[$adviceCategory] ?? 0) > 0)
                    ? sprintf(
                        'You already have traction in %s. A fresh published project there would deepen that story.',
                        $adviceCategory,
                    )
                    : $adviceMessage,
            ],
        ]);
    })->name('dashboard');

    Route::resource('projects', ProjectController::class)->except(['destroy']);
    Route::post('projects/{project}/assets', [ProjectAssetController::class, 'store'])
        ->name('projects.assets.store');
    Route::post('projects/{project}/publish', [ProjectPublishController::class, 'store'])
        ->name('projects.publish.store');
});

Route::get('/portfolio/{user}', PublicProfileController::class)
    ->name('portfolio.show');
Route::get('/portfolio/{user}/{project:slug}', PublicProjectController::class)
    ->name('portfolio.project.show');
Route::get('/explore', ExploreController::class)
    ->name('explore.index');
Route::get('/galleries/{share:token}', [ClientGalleryController::class, 'show'])
    ->name('client-galleries.show');
Route::post('/galleries/{share:token}/access', [ClientGalleryController::class, 'storeAccess'])
    ->name('client-galleries.access.store');
Route::post('/galleries/{share:token}/favorites', [ClientGalleryController::class, 'toggleFavorite'])
    ->name('client-galleries.favorites.toggle');

require __DIR__.'/settings.php';
