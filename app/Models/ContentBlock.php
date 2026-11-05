<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_page_id',
        'block_type',
        'display_variant',
        'layout_slot',
        'content',
        'media_id',
        'position',
        'is_visible',
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
            'position' => 'integer',
            'is_visible' => 'boolean',
        ];
    }

    /**
     * The parent container page.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(SectionPage::class, 'section_page_id');
    }

    /**
     * Associated media file (video, PDF, diagram) if this block references media.
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    /**
     * Scope for visible/active blocks.
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope to filter by block type.
     */
    public function scopeOfType(Builder $query, string $blockType): Builder
    {
        return $query->where('block_type', $blockType);
    }

    /**
     * Scope to filter by layout slot.
     */
    public function scopeInSlot(Builder $query, string $slot): Builder
    {
        return $query->where('layout_slot', $slot);
    }
}
