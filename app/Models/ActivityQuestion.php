<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Hidden(['answer_key', 'grading_config'])]
class ActivityQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'learning_activity_id',
        'question_type',
        'prompt',
        'question_config',
        'answer_key',
        'grading_config',
        'explanation',
        'points',
        'position',
        'is_required',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'prompt' => 'array',
            'question_config' => 'array',
            'answer_key' => 'array',
            'grading_config' => 'array',
            'explanation' => 'array',
            'points' => 'decimal:2',
            'position' => 'integer',
            'is_required' => 'boolean',
        ];
    }

    /**
     * The parent learning activity.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(LearningActivity::class, 'learning_activity_id');
    }

    /**
     * Learner submitted responses for this question.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ActivityResponse::class);
    }

    /**
     * Scope to filter questions by question type.
     */
    public function scopeOfType(Builder $query, string $questionType): Builder
    {
        return $query->where('question_type', $questionType);
    }
}
