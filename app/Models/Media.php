<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'mediable_type',
        'mediable_id',
        'collection_name',
        'file_name',
        'original_name',
        'mime_type',
        'disk',
        'size_bytes',
        'width',
        'height',
        'custom_properties',
        'conversions',
        'position',
        'uploaded_by',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Media $media): void {
            if (empty($media->uuid)) {
                $media->uuid = (string) Str::uuid();
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
            'custom_properties' => 'array',
            'conversions' => 'array',
            'size_bytes' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'position' => 'integer',
        ];
    }

    /**
     * The owning mediable model.
     */
    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * The user who uploaded this media.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Content blocks that directly embed this media item.
     */
    public function contentBlocks(): HasMany
    {
        return $this->hasMany(ContentBlock::class);
    }

    /**
     * Scope to filter by collection name.
     */
    public function scopeInCollection(Builder $query, string $collectionName): Builder
    {
        return $query->where('collection_name', $collectionName);
    }

    /**
     * Resolve the storage URL for this media file.
     */
    public function getUrl(): string
    {
        return Storage::disk($this->disk)->url($this->file_name);
    }
}
