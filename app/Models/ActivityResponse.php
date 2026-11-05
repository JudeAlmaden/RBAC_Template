<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_attempt_id',
        'activity_question_id',
        'response',
        'is_correct',
        'score',
        'feedback',
        'answered_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'response' => 'array',
            'is_correct' => 'boolean',
            'score' => 'decimal:2',
            'feedback' => 'array',
            'answered_at' => 'datetime',
        ];
    }

    /**
     * The parent activity attempt.
     */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ActivityAttempt::class, 'activity_attempt_id');
    }

    /**
     * The question this response belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(ActivityQuestion::class, 'activity_question_id');
    }
}
