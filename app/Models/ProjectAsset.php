<?php

namespace App\Models;

use Database\Factories\ProjectAssetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'project_id',
    'disk',
    'path',
    'filename',
    'mime_type',
    'size',
    'width',
    'height',
    'sort_order',
])]
class ProjectAsset extends Model
{
    /** @use HasFactory<ProjectAssetFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function analysis(): HasOne
    {
        return $this->hasOne(ProjectAssetAnalysis::class);
    }

    public function clientSelections(): HasMany
    {
        return $this->hasMany(ClientSelection::class);
    }
}
