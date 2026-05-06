<?php

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard shows ai portfolio advice based on published work mix', function () {
    $user = User::factory()->create();

    Project::factory()->for($user)->create([
        'category' => 'Weddings',
        'status' => ProjectStatus::Draft,
        'visibility' => ProjectVisibility::Private,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('portfolioAdvice.title', 'AI Portfolio Advice')
            ->where('portfolioAdvice.message', fn (string $message) => str($message)->contains('Weddings'))
        );
});
