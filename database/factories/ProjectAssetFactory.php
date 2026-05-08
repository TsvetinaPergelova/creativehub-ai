<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectAsset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectAsset>
 */
class ProjectAssetFactory extends Factory
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
            'disk' => 'public',
            'path' => 'projects/'.fake()->uuid().'.jpg',
            'filename' => fake()->uuid().'.jpg',
            'title' => null,
            'mime_type' => 'image/jpeg',
            'size' => fake()->numberBetween(500_000, 8_000_000),
            'width' => fake()->randomElement([1600, 2000, 2400, 3000]),
            'height' => fake()->randomElement([1067, 1333, 1600, 2000]),
            'sort_order' => 0,
        ];
    }
}
