<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an authenticated creator can create a project', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('projects.store'), [
            'name' => 'Spring Wedding',
            'category' => 'Weddings',
            'description' => 'Golden hour ceremony',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'user_id' => $user->id,
        'name' => 'Spring Wedding',
        'category' => 'Weddings',
        'description' => 'Golden hour ceremony',
        'status' => 'draft',
    ]);
});

test('an authenticated creator can view only their own projects', function () {
    $user = User::factory()->create();
    $ownProject = Project::factory()->for($user)->create([
        'name' => 'Own Project',
    ]);

    Project::factory()->create([
        'name' => 'Other Project',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('projects.index'));

    $response
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/index')
            ->where('projects.0.name', $ownProject->name)
            ->missing('projects.1')
        );
});
