<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();
    Storage::fake('public');

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'specialization' => 'Portrait Photographer',
            'location' => 'Sofia, Bulgaria',
            'bio' => 'Calm, editorial portrait sessions for modern brands.',
            'website_url' => 'https://studio.example',
            'instagram_url' => 'https://instagram.com/studio',
            'contact_email' => 'hello@studio.example',
            'profile_cover_style' => 'aurora',
            'avatar' => UploadedFile::fake()->image('avatar.jpg', 600, 600),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->specialization)->toBe('Portrait Photographer');
    expect($user->location)->toBe('Sofia, Bulgaria');
    expect($user->bio)->toBe('Calm, editorial portrait sessions for modern brands.');
    expect($user->website_url)->toBe('https://studio.example');
    expect($user->instagram_url)->toBe('https://instagram.com/studio');
    expect($user->contact_email)->toBe('hello@studio.example');
    expect($user->profile_cover_style->value)->toBe('aurora');
    expect($user->avatar_path)->not->toBeNull();
    expect($user->email_verified_at)->toBeNull();

    Storage::disk('public')->assertExists($user->avatar_path);
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
