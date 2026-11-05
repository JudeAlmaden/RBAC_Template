<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActivityAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'learning_activity_id',
        'user_id',
        'attempt_number',
        'status',
        'score',
        'max_score',
        'started_at',
        'submitted_at',
        'graded_at',
        'grading_summary',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'score' => 'decimal:2',
            'max_score' => 'decimal:2',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'graded_at' => 'datetime',
            'grading_summary' => 'array',
        ];
    }

    /**
     * The activity being attempted.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(LearningActivity::class, 'learning_activity_id');
    }

    /**
     * The learner who made the attempt.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The individual question responses recorded in this attempt.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ActivityResponse::class);
    }

    /**
     * Scope for in-progress attempts.
     */
    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope for submitted attempts.
     */
    public function scopeSubmitted(Builder $query): Builder
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope for graded attempts.
     */
    public function scopeGraded(Builder $query): Builder
    {
        return $query->where('status', 'graded');
    }
}
