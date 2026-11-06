<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentBlock extends Model
{
    use HasFactory;

    /**
     * Canonical block types available in the stage builder palette.
     */
    public const VALID_BLOCK_TYPES = [
        'rich_text',
        'video',
        'audio',
        'code',
        'callout',
        'download',
        'embed',
    ];

    /**
     * Display variants that control how a block renders inside its layout.
     */
    public const VALID_DISPLAY_VARIANTS = [
        'default',
        'card',
        'banner',
        'hero',
        'accordion',
        'callout_tip',
        'heading',
        'divider',
        'terminal',
        'objectives',
        'checklist',
        'table',
        'steps',
    ];

    /**
     * Layout slots a block can occupy within its parent page layout.
     */
    public const VALID_LAYOUT_SLOTS = [
        'main',
        'left',
        'right',
        'sidebar',
        'full',
    ];

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
