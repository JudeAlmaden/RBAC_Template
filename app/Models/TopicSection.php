<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TopicSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_id',
        'section_type',
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
     * Container pages within this stage.
     */
    public function pages(): HasMany
    {
        return $this->hasMany(SectionPage::class, 'topic_section_id')->orderBy('position');
    }

    /**
     * Normalized display content blocks across all pages within this section.
     */
    public function blocks(): HasManyThrough
    {
        return $this->hasManyThrough(ContentBlock::class, SectionPage::class, 'topic_section_id', 'section_page_id');
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
