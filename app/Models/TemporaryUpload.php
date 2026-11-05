<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TemporaryUpload extends Model
{
    use HasFactory, MassPrunable;

    protected $fillable = [
        'token',
        'user_id',
        'disk',
        'file_path',
        'original_name',
        'mime_type',
        'size_bytes',
        'metadata',
        'expires_at',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (TemporaryUpload $upload): void {
            if (empty($upload->token)) {
                $upload->token = (string) Str::uuid();
            }
            if (empty($upload->expires_at)) {
                $upload->expires_at = now()->addHours(24);
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'expires_at' => 'datetime',
            'size_bytes' => 'integer',
        ];
    }

    /**
     * Get the prunable model query.
     */
    public function prunable(): Builder
    {
        return static::where('expires_at', '<', now());
    }

    /**
     * The user who initiated the temporary upload.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active (unexpired) temporary uploads.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('expires_at', '>=', now());
    }

    /**
     * Scope for expired temporary uploads.
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('expires_at', '<', now());
    }

    /**
     * Resolve the public or temporary URL for frontend preview.
     */
    public function getUrl(): string
    {
        return Storage::disk($this->disk)->url($this->file_path);
    }
}
