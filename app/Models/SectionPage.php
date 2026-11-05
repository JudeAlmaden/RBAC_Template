<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SectionPage extends Model
{
    use HasFactory;

    public const VALID_LAYOUT_TYPES = [
        'single_column',
        'split_two_column',
        'cinema_focus',
        'tabbed_stepper',
    ];

    protected $fillable = [
        'topic_section_id',
        'title',
        'layout_type',
        'position',
        'is_visible',
        'settings',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_visible' => 'boolean',
            'settings' => 'array',
        ];
    }

    /**
     * Parent topic section (stage).
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(TopicSection::class, 'topic_section_id');
    }

    /**
     * Content blocks (components) within this container page.
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(ContentBlock::class, 'section_page_id')->orderBy('position');
    }

    /**
     * Scope for visible pages.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope to filter by layout type.
     */
    public function scopeWithLayout(Builder $query, string $layoutType): Builder
    {
        return $query->where('layout_type', $layoutType);
    }
}
