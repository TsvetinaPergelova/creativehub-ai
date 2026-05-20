<?php

namespace App\Models;

use App\Enums\ProjectMode;
use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'name',
    'slug',
    'category',
    'mode',
    'description',
    'status',
    'visibility',
    'cover_asset_id',
    'published_at',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'mode' => ProjectMode::class,
            'status' => ProjectStatus::class,
            'visibility' => ProjectVisibility::class,
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(ProjectAsset::class);
    }

    public function coverAsset(): BelongsTo
    {
        return $this->belongsTo(ProjectAsset::class, 'cover_asset_id');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(ProjectShare::class);
    }

    public function savedProjects(): HasMany
    {
        return $this->hasMany(SavedProject::class);
    }

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_projects')
            ->withTimestamps();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ProjectComment::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ProjectStatus::Published);
    }

    public function resolveDisplayCoverAsset(): ?ProjectAsset
    {
        if ($this->coverAsset instanceof ProjectAsset) {
            return $this->coverAsset;
        }

        if ($this->cover_asset_id !== null) {
            $this->loadMissing('coverAsset');

            return $this->coverAsset;
        }

        if ($this->relationLoaded('assets')) {
            /** @var Collection<int, ProjectAsset> $assets */
            $assets = $this->assets;
            $assets->loadMissing('analysis');

            return $this->selectFallbackCoverAsset($assets);
        }

        return $this->assets()
            ->select('project_assets.*')
            ->leftJoin(
                'project_asset_analyses',
                'project_asset_analyses.project_asset_id',
                '=',
                'project_assets.id',
            )
            ->orderByDesc('project_asset_analyses.is_highlight')
            ->orderByRaw(
                'COALESCE(project_asset_analyses.composition_score, 0) + COALESCE(project_asset_analyses.focus_score, 0) + COALESCE(project_asset_analyses.lighting_score, 0) DESC',
            )
            ->orderBy('project_assets.sort_order')
            ->orderBy('project_assets.id')
            ->first();
    }

    /**
     * @param  Collection<int, ProjectAsset>  $assets
     */
    private function selectFallbackCoverAsset(Collection $assets): ?ProjectAsset
    {
        if ($assets->isEmpty()) {
            return null;
        }

        /** @var Collection<int, ProjectAsset> $sortedAssets */
        $sortedAssets = $assets->sort(function (
            ProjectAsset $leftAsset,
            ProjectAsset $rightAsset,
        ): int {
            $rightScore = $this->coverPreferenceScore($rightAsset);
            $leftScore = $this->coverPreferenceScore($leftAsset);

            if ($rightScore !== $leftScore) {
                return $rightScore <=> $leftScore;
            }

            if ($leftAsset->sort_order !== $rightAsset->sort_order) {
                return $leftAsset->sort_order <=> $rightAsset->sort_order;
            }

            return $leftAsset->id <=> $rightAsset->id;
        });

        return $sortedAssets->first();
    }

    private function coverPreferenceScore(ProjectAsset $asset): int
    {
        $analysis = $asset->analysis;

        if ($analysis === null) {
            return 0;
        }

        return ($analysis->is_highlight ? 1_000 : 0)
            + ($analysis->composition_score ?? 0)
            + ($analysis->focus_score ?? 0)
            + ($analysis->lighting_score ?? 0);
    }
}
