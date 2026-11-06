<?php

namespace App\Http\Controllers;

use App\Models\ContentBlock;
use App\Models\SectionPage;
use App\Models\TopicSection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StageBuilderController extends Controller
{
    /**
     * Offset used to park existing rows on unique positions while
     * reassigning final ordering, avoiding unique-position collisions
     * without relying on negative values in unsigned columns.
     */
    private const POSITION_PARK_OFFSET = 1000000;

    /**
     * Persist the entire page/component structure of a stage in one transaction.
     */
    public function save(Request $request, TopicSection $stage): RedirectResponse
    {
        $this->authorizeCurriculumEdit($request);

        $validated = $request->validate([
            'pages' => ['present', 'array', 'max:100'],
            'pages.*.id' => ['nullable', 'integer'],
            'pages.*.title' => ['nullable', 'string', 'max:255'],
            'pages.*.layout_type' => ['required', 'string', Rule::in(SectionPage::VALID_LAYOUT_TYPES)],
            'pages.*.is_visible' => ['boolean'],
            'pages.*.blocks' => ['present', 'array', 'max:200'],
            'pages.*.blocks.*.id' => ['nullable', 'integer'],
            'pages.*.blocks.*.block_type' => ['required', 'string', Rule::in(ContentBlock::VALID_BLOCK_TYPES)],
            'pages.*.blocks.*.display_variant' => ['required', 'string', Rule::in(ContentBlock::VALID_DISPLAY_VARIANTS)],
            'pages.*.blocks.*.layout_slot' => ['required', 'string', Rule::in(ContentBlock::VALID_LAYOUT_SLOTS)],
            'pages.*.blocks.*.content' => ['nullable', 'array'],
            'pages.*.blocks.*.is_visible' => ['boolean'],
            'stage' => ['nullable', 'array'],
            'stage.title' => ['nullable', 'string', 'max:255'],
            'stage.section_type' => ['nullable', 'string', Rule::in(TopicSectionController::VALID_SECTION_TYPES)],
            'stage.instructions' => ['nullable', 'string', 'max:5000'],
            'stage.is_required' => ['boolean'],
            'stage.is_published' => ['boolean'],
        ]);

        DB::transaction(function () use ($stage, $validated) {
            $this->syncPages($stage, $validated['pages']);
            $this->syncStageMeta($stage, $validated['stage'] ?? []);
        });

        return back()->with('success', 'Stage content saved successfully.');
    }

    /**
     * Apply the stage-level metadata submitted alongside the builder payload.
     *
     * @param  array<string, mixed>  $meta
     */
    private function syncStageMeta(TopicSection $stage, array $meta): void
    {
        if ($meta === []) {
            return;
        }

        $attributes = array_filter([
            'title' => $meta['title'] ?? null,
            'section_type' => $meta['section_type'] ?? null,
            'instructions' => $meta['instructions'] ?? null,
        ], fn ($value) => $value !== null);

        if (array_key_exists('is_required', $meta)) {
            $attributes['is_required'] = (bool) $meta['is_required'];
        }

        if (array_key_exists('is_published', $meta)) {
            $attributes['is_published'] = (bool) $meta['is_published'];
        }

        if ($attributes !== []) {
            $stage->fill($attributes)->save();
        }
    }

    /**
     * Reconcile the submitted page list with the persisted structure.
     *
     * @param  array<int, array<string, mixed>>  $pages
     */
    private function syncPages(TopicSection $stage, array $pages): void
    {
        $stage->pages()->update(['position' => DB::raw('position + '.self::POSITION_PARK_OFFSET)]);

        $submittedPageIds = collect($pages)->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

        $stage->pages()
            ->whereNotIn('id', $submittedPageIds ?: [0])
            ->delete();

        foreach ($pages as $index => $pageData) {
            $page = $this->resolvePage($stage, $pageData['id'] ?? null);

            $page->fill([
                'title' => $pageData['title'] ?? null,
                'layout_type' => $pageData['layout_type'],
                'is_visible' => $pageData['is_visible'] ?? true,
                'position' => $index + 1,
            ])->save();

            $this->syncBlocks($page, $pageData['blocks'] ?? []);
        }
    }

    /**
     * Reconcile the submitted block list for a single page.
     *
     * @param  array<int, array<string, mixed>>  $blocks
     */
    private function syncBlocks(SectionPage $page, array $blocks): void
    {
        $page->blocks()->update(['position' => DB::raw('position + '.self::POSITION_PARK_OFFSET)]);

        $submittedBlockIds = collect($blocks)->pluck('id')->filter()->map(fn ($id) => (int) $id)->all();

        $page->blocks()
            ->whereNotIn('id', $submittedBlockIds ?: [0])
            ->delete();

        foreach ($blocks as $index => $blockData) {
            $block = $this->resolveBlock($page, $blockData['id'] ?? null);

            $block->fill([
                'block_type' => $blockData['block_type'],
                'display_variant' => $blockData['display_variant'],
                'layout_slot' => $blockData['layout_slot'],
                'content' => $blockData['content'] ?? null,
                'is_visible' => $blockData['is_visible'] ?? true,
                'position' => $index + 1,
            ])->save();
        }
    }

    /**
     * Resolve an existing page within the stage or instantiate a new one.
     */
    private function resolvePage(TopicSection $stage, mixed $pageId): SectionPage
    {
        if ($pageId) {
            $page = $stage->pages()->whereKey((int) $pageId)->first();
            if ($page) {
                return $page;
            }
        }

        $page = new SectionPage;
        $page->topic_section_id = $stage->id;

        return $page;
    }

    /**
     * Resolve an existing block within the page or instantiate a new one.
     */
    private function resolveBlock(SectionPage $page, mixed $blockId): ContentBlock
    {
        if ($blockId) {
            $block = $page->blocks()->whereKey((int) $blockId)->first();
            if ($block) {
                return $block;
            }
        }

        $block = new ContentBlock;
        $block->section_page_id = $page->id;

        return $block;
    }

    /**
     * Authorize that the current user is an admin or super admin.
     */
    private function authorizeCurriculumEdit(Request $request): void
    {
        if (! $request->user()?->can('manage curriculum')) {
            abort(403, 'Unauthorized.');
        }
    }
}
