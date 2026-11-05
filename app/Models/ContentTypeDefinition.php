<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentTypeDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'scope',
        'type_key',
        'label',
        'config_schema',
        'default_config',
        'renderer_key',
        'version',
        'is_enabled',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'config_schema' => 'array',
            'default_config' => 'array',
            'version' => 'integer',
            'is_enabled' => 'boolean',
        ];
    }

    /**
     * Scope for active/enabled content type definitions.
     */
    public function scopeEnabled(Builder $query): Builder
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope to filter by scope level (section, activity, question).
     */
    public function scopeForScope(Builder $query, string $scope): Builder
    {
        return $query->where('scope', $scope);
    }
}
