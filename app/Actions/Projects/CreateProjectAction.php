<?php

namespace App\Actions\Projects;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Str;

class CreateProjectAction
{
    /**
     * @param  array{name: string, category: string, description?: string|null}  $attributes
     */
    public function handle(User $user, array $attributes): Project
    {
        $slug = Str::slug($attributes['name']);
        $originalSlug = $slug;
        $suffix = 2;

        while (Project::query()->where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$suffix;
            $suffix++;
        }

        return $user->projects()->create([
            'name' => $attributes['name'],
            'slug' => $slug,
            'category' => $attributes['category'],
            'description' => $attributes['description'] ?? null,
        ]);
    }
}
