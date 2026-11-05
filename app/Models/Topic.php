<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Topic extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'slug',
        'description',
        'position',
        'estimated_minutes',
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
            'position' => 'integer',
            'estimated_minutes' => 'integer',
            'is_published' => 'boolean',
            'settings' => 'array',
        ];
    }

    /**
     * The parent module.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * The instructional stages / sections inside this topic.
     */
    public function sections(): HasMany
    {
        return $this->hasMany(TopicSection::class)->orderBy('position');
    }

    /**
     * Learner progress records for this topic.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(TopicProgress::class);
    }

    /**
     * Media associated with this topic (header image, thumbnail).
     */
    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    /**
     * Scope for published topics.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
