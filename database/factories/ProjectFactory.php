<?php

namespace Database\Factories;

use App\Enums\ProjectMode;
use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'user_id' => User::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name.'-'.fake()->unique()->numberBetween(100, 999)),
            'category' => fake()->randomElement(['Weddings', 'Portraits', 'Events', 'Travel']),
            'mode' => ProjectMode::MixedExperimental,
            'description' => fake()->sentence(),
            'status' => ProjectStatus::Draft,
            'visibility' => ProjectVisibility::Private,
            'cover_asset_id' => null,
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::Published,
            'visibility' => ProjectVisibility::Public,
            'published_at' => now(),
        ]);
    }
}
