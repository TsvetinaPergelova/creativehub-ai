<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'project_share_id',
    'project_asset_id',
    'session_id',
    'client_name',
    'is_favorite',
    'notes',
])]
class ClientSelection extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_favorite' => 'boolean',
        ];
    }

    public function share(): BelongsTo
    {
        return $this->belongsTo(ProjectShare::class, 'project_share_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(ProjectAsset::class, 'project_asset_id');
    }
}
