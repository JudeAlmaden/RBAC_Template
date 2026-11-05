<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class LearningActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'topic_section_id',
        'activity_type',
        'title',
        'instructions',
        'content',
        'presentation_config',
        'grading_config',
        'is_answerable',
        'is_gradable',
        'max_score',
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
            'grading_config' => 'array',
            'settings' => 'array',
            'is_answerable' => 'boolean',
            'is_gradable' => 'boolean',
            'max_score' => 'decimal:2',
            'position' => 'integer',
            'is_required' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    /**
     * The parent topic section.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(TopicSection::class, 'topic_section_id');
    }

    /**
     * Questions belonging to this activity.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(ActivityQuestion::class)->orderBy('position');
    }

    /**
     * Learner attempts recorded for this activity.
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(ActivityAttempt::class);
    }

    /**
     * Media attached to this activity (attachments, downloadable labs).
     */
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    /**
     * Scope for published activities.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope for answerable activities.
     */
    public function scopeAnswerable(Builder $query): Builder
    {
        return $query->where('is_answerable', true);
    }

    /**
     * Scope for gradable activities.
     */
    public function scopeGradable(Builder $query): Builder
    {
        return $query->where('is_gradable', true);
    }
}
