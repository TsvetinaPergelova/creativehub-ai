<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\ProjectShare;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $creator = User::factory()->create([
            'name' => 'Creative Demo',
            'email' => 'creator@example.com',
        ]);

        Project::factory()->for($testUser)->create([
            'name' => 'Draft Wedding Story',
            'category' => 'Weddings',
            'status' => ProjectStatus::Draft,
            'visibility' => ProjectVisibility::Private,
            'published_at' => null,
        ]);

        $publicProject = Project::factory()->for($creator)->create([
            'name' => 'Sofia Rooftop Portraits',
            'category' => 'Portraits',
            'status' => ProjectStatus::Published,
            'visibility' => ProjectVisibility::Public,
            'published_at' => now()->subDays(3),
        ]);

        $clientProject = Project::factory()->for($creator)->create([
            'name' => 'Autumn Family Selects',
            'category' => 'Family',
            'status' => ProjectStatus::Published,
            'visibility' => ProjectVisibility::Client,
            'published_at' => now()->subDay(),
        ]);

        ProjectShare::factory()->for($publicProject)->create([
            'type' => 'public',
        ]);

        ProjectShare::factory()->for($clientProject)->create([
            'type' => 'client',
            'password' => bcrypt('secret-pass'),
        ]);
    }
}
