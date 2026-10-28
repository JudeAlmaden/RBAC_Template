<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use MassPrunable;

    protected $fillable = [
        'actor_id',
        'actor_name',
        'action',
        'subject_type',
        'subject_id',
        'subject_name',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the prunable model query (retains critical security logs indefinitely).
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subDays(90))
            ->whereNotIn('action', [
                'promoted_super_admin',
                'demoted_super_admin',
                'transferred_super_admin',
                'deleted_user',
                'deleted_role',
            ]);
    }

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
        array $metadata = [],
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): static {
        return static::create([
            'actor_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'action' => $action,
            'subject_type' => $subject ? class_basename($subject) : null,
            'subject_id' => $subject?->getKey(),
            'subject_name' => $subject?->name ?? null,
            'ip_address' => $ipAddress ?? request()?->ip(),
            'user_agent' => $userAgent ?? (request() ? substr((string) request()->userAgent(), 0, 500) : null),
            'metadata' => $metadata ?: null,
        ]);
    }
}
