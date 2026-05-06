<?php

namespace App\Models;

use App\Enums\ProjectAssetMood;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'project_asset_id',
    'tags',
    'alt_text',
    'composition_score',
    'focus_score',
    'lighting_score',
    'critique',
    'mood',
    'is_highlight',
    'is_near_duplicate',
    'meta',
])]
class ProjectAssetAnalysis extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'meta' => 'array',
            'mood' => ProjectAssetMood::class,
            'composition_score' => 'integer',
            'focus_score' => 'integer',
            'lighting_score' => 'integer',
            'is_highlight' => 'boolean',
            'is_near_duplicate' => 'boolean',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(ProjectAsset::class, 'project_asset_id');
    }
}
