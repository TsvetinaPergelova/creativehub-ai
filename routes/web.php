<?php

use App\Http\Controllers\Projects\ProjectController;
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
        ]);
    })->name('dashboard');

    Route::resource('projects', ProjectController::class)->except(['destroy']);
});

require __DIR__.'/settings.php';
