<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TopicSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'section_type',
        'layout_type',
        'title',
        'instructions',
        'content',
        'presentation_config',
        'position',
        'is_required',
        'is_published',
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
            'content' => 'array',
            'presentation_config' => 'array',
            'settings' => 'array',
            'position' => 'integer',
            'is_required' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    /**
     * The parent topic.
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    /**
     * Normalized display content blocks within this section.
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(ContentBlock::class)->orderBy('position');
    }

    /**
     * Learning activities within this section.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(LearningActivity::class)->orderBy('position');
    }

    /**
     * Media associated with this section (diagrams, audio, video embeds).
     */
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    /**
     * Scope to filter by section type (activate, encode, retrieve, anchor, deepen, lab, assessment).
     */
    public function scopeOfType(Builder $query, string $sectionType): Builder
    {
        return $query->where('section_type', $sectionType);
    }

    /**
     * Scope to filter by layout type.
     */
    public function scopeWithLayout(Builder $query, string $layoutType): Builder
    {
        return $query->where('layout_type', $layoutType);
    }

    /**
     * Scope for published sections.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope for required sections.
     */
    public function scopeRequired(Builder $query): Builder
    {
        return $query->where('is_required', true);
    }
}
