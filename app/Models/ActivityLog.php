<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'actor_id',
        'actor_name',
        'action',
        'subject_type',
        'subject_id',
        'subject_name',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * The actor who performed the action (nullable if deleted).
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Log an action on any model (User, Role, etc.).
     */
    public static function record(
        ?User $actor,
        string $action,
        ?Model $subject = null,
        array $metadata = []
    ): static {
        return static::create([
            'actor_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'action' => $action,
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey(),
            'subject_name' => $subject?->name ?? null,
            'metadata' => $metadata ?: null,
        ]);
    }
}
