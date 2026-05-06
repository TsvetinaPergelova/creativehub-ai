<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectShare;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProjectShare>
 */
class ProjectShareFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'type' => fake()->randomElement(['public', 'client']),
            'token' => (string) Str::uuid(),
            'password' => null,
            'expires_at' => null,
        ];
    }
}
