<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Notification extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'recipient_id',
        'sender_id',
        'sender_name',
        'type',
        'title',
        'body',
        'action_url',
        'action_label',
        'icon',
        'severity',
        'read_at',
        'dismissed_at',
        'metadata',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'dismissed_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Notification $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    /* ─── Relationships ───────────────────────────────────────────────── */

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /* ─── Scopes ──────────────────────────────────────────────────────── */

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeVisible($query)
    {
        return $query->whereNull('dismissed_at');
    }

    /**
     * Notifications visible to a given user:
     * either addressed to them or broadcast (recipient_id = null).
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('recipient_id', $userId)
                ->orWhereNull('recipient_id');
        });
    }

    /* ─── Factory helper ──────────────────────────────────────────────── */

    /**
     * Create and persist a notification in one call.
     *
     * @param  User|null  $recipient  null = broadcast
     * @param  User|null  $sender  null = system
     * @param  string  $type  machine-readable type slug
     * @param  string  $title  short headline
     * @param  array  $options  {
     *                          string|null $body,
     *                          string|null $action_url,
     *                          string|null $action_label,
     *                          string|null $icon,          lucide icon name
     *                          string      $severity,      info|success|warning|danger
     *                          array|null  $metadata,
     *                          }
     */
    public static function send(
        ?User $recipient,
        ?User $sender,
        string $type,
        string $title,
        array $options = []
    ): static {
        return static::create([
            'recipient_id' => $recipient?->id,
            'sender_id' => $sender?->id,
            'sender_name' => $sender?->name,
            'type' => $type,
            'title' => $title,
            'body' => $options['body'] ?? null,
            'action_url' => $options['action_url'] ?? null,
            'action_label' => $options['action_label'] ?? null,
            'icon' => $options['icon'] ?? null,
            'severity' => $options['severity'] ?? 'info',
            'metadata' => $options['metadata'] ?? null,
        ]);
    }

    /* ─── State helpers ───────────────────────────────────────────────── */

    public function markRead(): void
    {
        if (! $this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function dismiss(): void
    {
        $this->update(['dismissed_at' => now(), 'read_at' => $this->read_at ?? now()]);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function isDismissed(): bool
    {
        return $this->dismissed_at !== null;
    }
}
